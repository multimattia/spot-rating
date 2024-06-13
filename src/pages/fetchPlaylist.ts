import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({params, request}) => {
    const id = params.id;
    return new Response(
        JSON.stringify({
            name: 'astro',
            url: 'https://astro.build',
        })
    )
}
