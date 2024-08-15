import type { APIRoute } from "astro";
import { db, Song_Staging, sql } from "astro:db";

export const DELETE: APIRoute = async ({ request }) => {
  const req = await request.json();
  const playlistId = req.playlistId;
  try {
    await db
      .delete(Song_Staging)
      .where(sql`${Song_Staging.playlist_id} = ${playlistId}`);
  } catch (e) {
    console.error(e);
    return new Response(null, {
      status: 500,
    });
  }
  return new Response(null, {
    status: 200,
  });
};
