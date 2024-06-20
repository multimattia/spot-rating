const GET = async ({ params, request }) => {
  params.id;
  return new Response(
    JSON.stringify({
      name: "astro",
      url: "https://astro.build"
    })
  );
};

export { GET };
