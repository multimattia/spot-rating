import { Lucia } from "lucia";
import { AstroDBAdapter } from "lucia-adapter-astrodb";
import { Spotify } from "arctic";
import { db, Session, User } from "astro:db";

export const spotify = new Spotify(
	import.meta.env.SPOTIFY_CLIENT_ID,
	import.meta.env.SPOTIFY_CLIENT_SECRET,
    "http://localhost:4321/login/spotify/callback"
);

const adapter = new AstroDBAdapter(
	db as any,
    Session,
    User
);

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
}
