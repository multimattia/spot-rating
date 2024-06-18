import { lucia, spotify } from "../../../../../lib/auth";

import type { APIContext } from "astro";

import { db, Session, User, eq, sql } from "astro:db";

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

  const offset = context.params.offset ? context.params.offset : 0;
  const playlistId = context.params.playlist;

  const session = await db
    .select()
    .from(Session)
    .where(eq(existingUser.id, Session.userId));

  console.log(`params: ${JSON.stringify(context.params)}`);
  console.log(`playlistId: ${playlistId}`);
  console.log(`offset: ${offset}`);
  const spotifyTrackResponse = await fetch(
    // `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2Citems%28added_by.id%2Cadded_at%2Ctrack%28name%2Cpopularity%2Cduration_ms%2Cartists%28name%2Cid%29%2Calbum%28name%2Cimages%29%29`,
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2C+items%28added_by.id%2C+added_at%2C+track%28name%2C+popularity%2C+duration_ms%2Cartists%28name%29%2C+album%28name%2Cimages%29%29&limit=100&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${session[0].accessToken}`,
      },
    },
  );
  let spotifyTrackData;
  if (spotifyTrackResponse.ok) {
    console.log("positive response");
    spotifyTrackData = await spotifyTrackResponse.json();
    // console.log(spotifyTrackData);
  } else {
    console.log("negative response");
    console.error(
      "error: ",
      spotifyTrackResponse.status,
      spotifyTrackResponse.statusText,
    );
    spotifyTrackData = [];
  }

  // try {
  //   const serializedData = JSON.stringify(spotifyTrackData);
  //   console.log(serializedData);
  //   const parsedData = JSON.parse(serializedData);
  // } catch (error) {
  //   console.error("error serializing: ", error);
  //   return new Response(JSON.stringify({ error: "internal server error" }), {
  //     status: 500,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  // }

  return new Response(JSON.stringify(spotifyTrackData), {
    status: spotifyTrackResponse.ok ? 200 : spotifyTrackResponse.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
