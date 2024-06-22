import type { APIContext } from "astro";

import { db, Songs_Temp, User, sql } from "astro:db";

export async function GET(context: APIContext): Promise<Response> {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401,
    });
  }

  const existingUser = (
    await db
      .select()
      .from(User)
      .where(
        sql`${User.id} = ${context.locals.session ? context.locals.session.userId : ""}`,
      )
  )[0];

  const playlistId = context.params.id;

  const dbsongs = await db
    .select()
    .from(Songs_Temp)
    .where(sql`${playlistId} = ${Songs_Temp.playlistId}`);
  // console.log(`db poll: ${JSON.stringify(dbsongs.slice(0, 3), null, 2)}`);
  // console.log(`db length: ${dbsongs.length}`);

  return context.redirect(`/`);
  new Response(JSON.stringify(dbsongs), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
