import * as v from 'valibot';

const base = v.object({
    NODE_ENV: v.optional(v.union([v.literal('development'), v.literal('production'), v.literal('test')]), 'development') 
})

const schema = v.pipe(base, v.transform((value) => {
    return {
        ...value,
        isProduction: value.NODE_ENV === 'production',
        isDevelopment: value.NODE_ENV === 'development',
        isTest: value.NODE_ENV === 'test',
    }
}))

const env = v.parse(schema, process.env);

export default env;
