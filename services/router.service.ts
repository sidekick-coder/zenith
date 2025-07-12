import type { Request, Response } from "express";
import { importAll } from "../utils/importAll.ts";
import { basePath } from "../utils/paths.ts";
import fs from 'fs';
import modules from "./modules.service.ts";
import { tryCatch } from "../utils/tryCatch.ts";

export interface HttpContext {
    request: Request
    response: Response
}

interface Handler {
    (ctx: HttpContext): Promise<any> | any;
}

class Route {
    public method: string;
    public path: string;
    public handler: Handler;
    public metas: Record<string, any> = {};
    public filename: string | null = null;

    constructor(method: string, path: string, filename: string | null = null, handler: Handler) {
        this.method = method.toUpperCase();
        this.path = path;
        this.handler = handler;
        this.filename = filename;
    }

    public meta(key: string, value: any) {
        this.metas[key] = value;
        return this;
    }

    public name(name: string) {
        return this.meta('name', name);
    }

}

export class Router {
    private routes = new Map<string, Route>();
    private filename = null as string | null;

    public open(filename: string) {
        this.filename = filename;
    }

    public close() {
        if (!this.filename) {
            throw new Error(`Cannot close router without a filename`);
        }

        this.filename = null;
    }

    public add(payload: Pick<Route, 'method' | 'path' | 'handler'>) {
        let key = `${payload.method.toUpperCase()} ${payload.path}`;

        if (!this.filename) {
            throw new Error(`Cannot add route without a filename. Did you forget to call open()?`);
        }

        const route = new Route(payload.method, payload.path, this.filename, payload.handler);

        this.routes.set(key, route);

        return route;
    }

    public remove(path: string, httpMethod?: string) {
        const method = httpMethod ? httpMethod.toUpperCase() : 'GET';
        const key = `${method} ${path}`;

        this.routes.delete(key);
    }

    public get(path: string, handler: Handler) {
        return this.add({ method: 'GET', path, handler });
    }

    public post(path: string, handler: Handler) {
        return this.add({ method: 'POST', path, handler });
    }

    public put(path: string, handler: Handler) {
        return this.add({ method: 'PUT', path, handler });
    }

    public delete(path: string, handler: Handler) {
        return this.add({ method: 'DELETE', path, handler });
    }

    // public resource(resourceName: string, controller: Controller) {
    //     const base = `/${resourceName}`;
    //     this.get(base, [controller, 'index']);
    //     this.post(base, [controller, 'store']);
    //     this.get(`${base}/:id`, [controller, 'show']);
    //     this.put(`${base}/:id`, [controller, 'update']);
    //     this.delete(`${base}/:id`, [controller, 'destroy']);
    // }

    public resolve(method: string, path: string) {
        const routes = Array.from(this.routes.values());

        const route = routes.find(r => r.path === path && r.method === method.toUpperCase());

        if (!route) {
            return null;
        }

        return route;
    }

    public async execute(method: string, path: string, ctx: HttpContext) {
        const route = this.resolve(method, path);

        if (!route) {
            throw new Error(`Route not found: ${method} ${path}`);
        }

        const [error, result] = await tryCatch(() => route.handler(ctx));

        if (error) {
            ctx.response.status(500).send(`Internal Server Error: ${error.message}`);
            return;
        }

        if (ctx.response.headersSent) {
            return; // if headers are already sent, do not modify the response
        }

        // headers not set 
        ctx.response.status(200) 

        if (typeof result === 'object' || Array.isArray(result)) {
            ctx.response.setHeader('Content-Type', 'application/json');
        }

        ctx.response.send(result);
    }

    public async load() {
        // clear 
        this.routes.clear();

        // load root routes 
        await importAll(basePath('routes'), {
            onBeforeImport: (filename) => this.open(filename),
            onAfterImport: () => this.close()
        });

        // load module routes
        const enabled = await modules.list({
            enabled: true
        });

        for await (const mod of enabled) {
            const filename = mod.makePath('server', 'routes.ts');

            if (!fs.existsSync(filename)) {
                continue;
            }

            this.open(filename);

            await import(filename);

            this.close();

        }
    }

    public list() {
        return Array.from(this.routes.values())
    }
}

const router = new Router();

export default router;
