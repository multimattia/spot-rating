import type { APIContext } from "astro";

import { db, Session, User, eq, sql } from "astro:db";

export async function GET(context: APIContext): Promise<Response> {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401,
    });
  }

  // const existingUser = (
  //   await db
  //     .select()
  //     .from(User)
  //     .where(
  //       sql`${User.id} = ${context.locals.session ? context.locals.session.userId : ""}`,
  //     )
  // )[0];

  const playlistId = context.params.playlist;
  let offset = 0;

  // const session = await db
  //   .select()
  //   .from(Session)
  //   .where(eq(existingUser.id, Session.userId));

  console.log(`params: ${JSON.stringify(context.params)}`);
  console.log(`playlistId: ${playlistId}`);
  const spotifyTrackResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2C+items%28added_by.id%2C+added_at%2C+track%28name%2C+popularity%2C+duration_ms%2Cartists%28name%29%2C+album%28name%2Cimages%29%29&limit=100&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${context.locals.accessToken}`,
      },
    },
  );
  let spotifyTrackData;
  if (spotifyTrackResponse.ok) {
    spotifyTrackData = await spotifyTrackResponse.json();
  } else {
    console.error(
      "error: ",
      spotifyTrackResponse.status,
      spotifyTrackResponse.statusText,
    );
    spotifyTrackData = [];
  }

  return new Response(JSON.stringify(spotifyTrackData), {
    status: spotifyTrackResponse.ok ? 200 : spotifyTrackResponse.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
