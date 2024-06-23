import { Lucia } from "lucia";
import { AstroDBAdapter } from "lucia-adapter-astrodb";
import { Spotify } from "arctic";
import { db, Session, eq, User } from "astro:db";

let callbackUrl = `${import.meta.env.PROD ? `https://${import.meta.env.PUBLIC_VERCEL_URL}/login/spotify/callback` : "http://localhost:4321/login/spotify/callback"}`;
callbackUrl = import.meta.env.PROD_URL || callbackUrl;

export const spotify = new Spotify(
  import.meta.env.SPOTIFY_CLIENT_ID,
  import.meta.env.SPOTIFY_CLIENT_SECRET,
  callbackUrl,
);

// export const getSession = async (Astro, luciaUser: User | null) => {
//   if (!luciaUser) {
//     return Astro.redirect("/login");
//   }
//   const existingUser = (
//     await db
//       .select()
//       .from(Users)
//       .where(sql`${Users.id} = ${luciaUser.id}`)
//   )[0];

//   let session;

//   try {
//     session = await db
//       .select()
//       .from(Session)
//       .where(eq(existingUser.id, Session.userId));
//   } catch (e) {}

//   return { existingUser, session };
// };

// https://spot-rating-mj6yvgu6s-matts-projects-db5c02cb.vercel.app

const adapter = new AstroDBAdapter(db as any, Session, User);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      spotifyId: attributes.spotifyId,
      username: attributes.username,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  spotifyId: number;
  username: string;
  name: string;
}
