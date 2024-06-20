import { i as insertSongWithRelations } from './_id__CN_NXpWk.mjs';
import { d as db, U as User, S as Session } from './_id__ChIl-fI5.mjs';
import { sql, eq } from '@astrojs/db/dist/runtime/virtual.js';

async function GET(context) {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401
    });
  }
  const existingUser = (await db.select().from(User).where(
    sql`${User.id} = ${context.locals.session ? context.locals.session.userId : ""}`
  ))[0];
  const offset = context.params.offset ? context.params.offset : 0;
  const playlistId = context.params.playlist;
  const session = await db.select().from(Session).where(eq(existingUser.id, Session.userId));
  const spotifyTrackResponse = await fetch(
    // `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2Citems%28added_by.id%2Cadded_at%2Ctrack%28name%2Cpopularity%2Cduration_ms%2Cartists%28name%2Cid%29%2Calbum%28name%2Cimages%29%29`,
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2C+items%28added_by.id%2C+added_at%2C+track%28name%2C+popularity%2C+id%2C+duration_ms%2Cartists%28name%29%2C+album%28name%2C+id%2Cimages%29%29&limit=100&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${session[0].accessToken}`
      }
    }
  );
  const playlistResponse = await fetch(
    // `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2Citems%28added_by.id%2Cadded_at%2Ctrack%28name%2Cpopularity%2Cduration_ms%2Cartists%28name%2Cid%29%2Calbum%28name%2Cimages%29%29`,
    `https://api.spotify.com/v1/playlists/${playlistId}?fields=name%2Cid%2Cowner%28id%2C+display_name%29`,
    {
      headers: {
        Authorization: `Bearer ${session[0].accessToken}`
      }
    }
  );
  let playlistData;
  if (playlistResponse.ok) {
    playlistData = await playlistResponse.json();
  } else {
    return new Response(null, {
      status: 500
    });
  }
  let spotifyTrackData;
  let newPlaylist = {
    id: playlistData.id,
    ownerId: playlistData.owner.id,
    name: playlistData.name
  };
  if (spotifyTrackResponse.ok && playlistId) {
    spotifyTrackData = await spotifyTrackResponse.json();
    try {
      insertSongWithRelations(spotifyTrackData.items, newPlaylist);
    } catch (e) {
      console.error(e);
    }
  } else {
    console.error(
      "error: ",
      spotifyTrackResponse.status,
      spotifyTrackResponse.statusText
    );
    spotifyTrackData = [];
  }
  return new Response(JSON.stringify(spotifyTrackData), {
    status: spotifyTrackResponse.ok ? 200 : spotifyTrackResponse.status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export { GET };
