import * as v from 'valibot';

const schema = v.object({
    NODE_ENV: v.optional(v.union([v.literal('development'), v.literal('production'), v.literal('test')]), 'development'),
})

const env = v.parse(schema, process.env);

export default env;
