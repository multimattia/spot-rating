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
  let offset = 0;
  let responseLength = 101;

  const dbsongs = await db
    .select()
    .from(Songs_Temp)
    .where(sql`${playlistId} = ${Songs_Temp.playlistId}`);
  // .where(sql`${Songs.playlistId} = ${playlistId}`);
  console.log(`db poll: ${JSON.stringify(dbsongs.slice(0, 3), null, 2)}`);
  console.log(`db length: ${dbsongs.length}`);

  //   console.log(`params: ${JSON.stringify(context.params)}`);
  //   console.log(`playlistId: ${playlistId}`);
  //   const spotifyTrackResponse = await fetch(
  //     // `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2Citems%28added_by.id%2Cadded_at%2Ctrack%28name%2Cpopularity%2Cduration_ms%2Cartists%28name%2Cid%29%2Calbum%28name%2Cimages%29%29`,
  //     `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2C+items%28added_by.id%2C+added_at%2C+track%28name%2C+popularity%2C+duration_ms%2Cartists%28name%29%2C+album%28name%2Cimages%29%29&limit=100&offset=${offset}`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${session[0].accessToken}`,
  //       },
  //     },
  //   );
  //   let spotifyTrackData;
  //   if (spotifyTrackResponse.ok) {
  //     spotifyTrackData = await spotifyTrackResponse.json();
  //     // console.log(spotifyTrackData);
  //   } else {
  //     console.error(
  //       "error: ",
  //       spotifyTrackResponse.status,
  //       spotifyTrackResponse.statusText,
  //     );
  //     spotifyTrackData = [];
  //   }

  return context.redirect(`/`);
  new Response(JSON.stringify(dbsongs), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
