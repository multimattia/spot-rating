import type { APIContext } from "astro";
import { db, Session, User, eq, sql } from "astro:db";
import { insertSongWithRelations } from "src/lib/db-lib";

export async function GET(context: APIContext): Promise<Response> {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401,
    });
  }

  const offset = context.params.offset ? context.params.offset : 0;
  const playlistId = context.params.playlist;

  const spotifyTrackResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2C+items%28added_by.id%2C+added_at%2C+track%28name%2C+popularity%2C+id%2C+duration_ms%2Cartists%28name%2Cid%29%2C+album%28name%2C+id%2Cimages%29%29&limit=100&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${context.locals.accessToken}`,
      },
    },
  );
  const playlistResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}?fields=name%2Cid%2Cowner%28id%2C+display_name%29`,
    {
      headers: {
        Authorization: `Bearer ${context.locals.accessToken}`,
      },
    },
  );
  let playlistData;
  if (playlistResponse.ok) {
    playlistData = await playlistResponse.json();
  } else {
    return new Response(null, {
      status: 500,
    });
  }
  let spotifyTrackData;
  let newPlaylist = {
    id: playlistData.id,
    ownerId: playlistData.owner.id,
    name: playlistData.name,
  };
  if (spotifyTrackResponse.ok && playlistId) {
    spotifyTrackData = await spotifyTrackResponse.json();
    try {
      await insertSongWithRelations(spotifyTrackData.items, newPlaylist);
    } catch (e) {
      console.error(e);
    }
    // insertSongWithRelations(spotifyTrackData);
    // This should be a message queue.
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
