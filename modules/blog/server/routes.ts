import router from "#facades/router.ts";

router.get('/api/blog/posts', async ({ query }) => {
    const page = query.page ? parseInt(query.page as string, 10) : 1;
    const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
    const posts = [
        {
            id: 1,
            title: 'First Post',
            content: 'This is the content of the first post.',
        }
    ]

    const meta = {
        page,
        limit,
        total: posts.length,
    }

    return { 
        meta,
        data: posts
    };
})
