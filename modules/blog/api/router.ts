import router from "../../../services/router.service";

router.get('/api/blog/posts', async ({ request }) => {
    const page = request.query.page ? parseInt(request.query.page as string, 10) : 1;
    const limit = request.query.limit ? parseInt(request.query.limit as string, 10) : 10;
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
