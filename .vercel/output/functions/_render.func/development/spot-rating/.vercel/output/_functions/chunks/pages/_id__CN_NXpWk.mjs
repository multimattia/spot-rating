import { d as db, S as Session, U as User, a as Songs_Temp } from './_id__ChIl-fI5.mjs';
import { v4 } from 'uuid';
import { eq, lte, sql } from '@astrojs/db/dist/runtime/virtual.js';
import { Lucia } from 'lucia';
import { Spotify } from 'arctic';

/// <reference types="@astrojs/db" />
class AstroDBAdapter {
    db;
    sessionTable;
    userTable;
    constructor(db, sessionTable, userTable) {
        this.db = db;
        this.sessionTable = sessionTable;
        this.userTable = userTable;
    }
    async deleteSession(sessionId) {
        await this.db.delete(this.sessionTable).where(eq(this.sessionTable.id, sessionId));
    }
    async deleteUserSessions(userId) {
        await this.db.delete(this.sessionTable).where(eq(this.sessionTable.userId, userId));
    }
    async getSessionAndUser(sessionId) {
        const result = await this.db
            .select({
            user: this.userTable,
            session: this.sessionTable
        })
            .from(this.sessionTable)
            .innerJoin(this.userTable, eq(this.sessionTable.userId, this.userTable.id))
            .where(eq(this.sessionTable.id, sessionId))
            .get();
        if (!result)
            return [null, null];
        return [transformIntoDatabaseSession(result.session), transformIntoDatabaseUser(result.user)];
    }
    async getUserSessions(userId) {
        const result = await this.db
            .select()
            .from(this.sessionTable)
            .where(eq(this.sessionTable.userId, userId))
            .all();
        return result.map((val) => {
            return transformIntoDatabaseSession(val);
        });
    }
    async setSession(session) {
        await this.db
            .insert(this.sessionTable)
            .values({
            id: session.id,
            userId: session.userId,
            expiresAt: session.expiresAt,
            ...session.attributes
        })
            .run();
    }
    async updateSessionExpiration(sessionId, expiresAt) {
        await this.db
            .update(this.sessionTable)
            .set({
            expiresAt: expiresAt
        })
            .where(eq(this.sessionTable.id, sessionId))
            .run();
    }
    async deleteExpiredSessions() {
        await this.db.delete(this.sessionTable).where(lte(this.sessionTable.expiresAt, new Date()));
    }
}
function transformIntoDatabaseSession(raw) {
    const { id, userId, expiresAt, ...attributes } = raw;
    return {
        userId,
        id,
        expiresAt,
        attributes
    };
}
function transformIntoDatabaseUser(raw) {
    const { id, ...attributes } = raw;
    return {
        id,
        attributes
    };
}

const spotify = new Spotify(
  "6167bb08bdd34369adce494bf0546d3b",
  "77dfccf905de485bacccc5ea624cef84",
  "http://localhost:4321/login/spotify/callback"
);
const adapter = new AstroDBAdapter(db, Session, User);
const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: true
    }
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      spotifyId: attributes.spotifyId,
      username: attributes.username
    };
  }
});

const flattenTrack = (trackObject, playlistId) => {
  let tryName = "No name";
  if (trackObject.track === null) {
    return {
      id: `null${JSON.stringify(trackObject.added_by)}${trackObject.added_at}`,
      name: tryName,
      duration_ms: 0,
      addedById: trackObject.added_by.id,
      playlistId,
      spotifyId: v4(),
      albumId: v4(),
      popularity: 0,
      addedAt: new Date(trackObject.added_at)
    };
  }
  try {
    const preparedTrack = {
      id: `${trackObject.track.id ? trackObject.track.id : trackObject.track.name.slice(0, 5)}${trackObject.added_at}`,
      name: trackObject.track.name,
      duration_ms: trackObject.track.duration_ms ? trackObject.track.duration_ms : 0,
      addedById: trackObject.added_by.id,
      playlistId,
      spotifyId: trackObject.track.id ? trackObject.track.id : v4(),
      albumId: trackObject.track.album.id ? trackObject.track.id : v4(),
      popularity: trackObject.track.popularity ? trackObject.track.popularity : 0,
      addedAt: new Date(trackObject.added_at)
    };
    return preparedTrack;
  } catch (e) {
    console.error(`flatten error: ${e}`);
  }
};
const insertSongWithRelations = async (tracks, playlistInfo) => {
  const preparedData = tracks.map((item, i) => {
    return flattenTrack(item, playlistInfo.id);
  });
  try {
    await db.batch([db.insert(Songs_Temp).values(preparedData)]);
  } catch (e) {
    console.error(`song table error: ${e}`);
  }
};

async function GET$1(context) {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401
    });
  }
  const existingUser = (await db.select().from(User).where(
    sql`${User.id} = ${context.locals.session ? context.locals.session.userId : ""}`
  ))[0];
  const playlistId = context.params.playlist;
  let offset = 0;
  const session = await db.select().from(Session).where(eq(existingUser.id, Session.userId));
  console.log(`params: ${JSON.stringify(context.params)}`);
  console.log(`playlistId: ${playlistId}`);
  const spotifyTrackResponse = await fetch(
    // `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2Citems%28added_by.id%2Cadded_at%2Ctrack%28name%2Cpopularity%2Cduration_ms%2Cartists%28name%2Cid%29%2Calbum%28name%2Cimages%29%29`,
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=name%2C+items%28added_by.id%2C+added_at%2C+track%28name%2C+popularity%2C+duration_ms%2Cartists%28name%29%2C+album%28name%2Cimages%29%29&limit=100&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${session[0].accessToken}`
      }
    }
  );
  let spotifyTrackData;
  if (spotifyTrackResponse.ok) {
    spotifyTrackData = await spotifyTrackResponse.json();
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

const _id_$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET: GET$1
}, Symbol.toStringTag, { value: 'Module' }));

async function GET(context) {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401
    });
  }
  (await db.select().from(User).where(
    sql`${User.id} = ${context.locals.session ? context.locals.session.userId : ""}`
  ))[0];
  const playlistId = context.params.id;
  const dbsongs = await db.select().from(Songs_Temp).where(sql`${playlistId} = ${Songs_Temp.playlistId}`);
  console.log(`db poll: ${JSON.stringify(dbsongs.slice(0, 3), null, 2)}`);
  console.log(`db length: ${dbsongs.length}`);
  return new Response(JSON.stringify(dbsongs), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

const _id_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

export { _id_$1 as _, _id_ as a, insertSongWithRelations as i, lucia as l, spotify as s };
