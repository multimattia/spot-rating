import { spotify, lucia } from "../../../lib/auth";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { db, User, eq } from "astro:db"

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
	const code = context.url.searchParams.get("code");
    console.log(`code: ${code}`)
	const state = context.url.searchParams.get("state");
    console.log(`state: ${state}`)
	const storedState = context.cookies.get("spotify_oauth_state")?.value ?? null;
    console.log(`storedState: ${storedState}`)
	if (!code || !state || !storedState || state !== storedState) {
        console.log(`code: ${code}`)
        console.log(`state: ${state}`)
        console.log(`storedState: ${storedState}`)
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await spotify.validateAuthorizationCode(code);
		const spotifyUserResponse = await fetch("https://api.spotify.com/v1/me", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const spotifyUser: SpotifyUser = await spotifyUserResponse.json();
		console.log(`user response: ${await JSON.stringify(spotifyUser, null, 2)}`)
		const existingUser = await db.select().from(User).where(eq(User.spotifyId, spotifyUser.id));
		// const existingUser = await db.select().from(User);

		if (existingUser.length !== 0) {
			const session = await lucia.createSession(existingUser[0].id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			return context.redirect("/");
		}

		const userId = generateId(15);
		await db.insert(User).values({id: userId, spotifyId: spotifyUser.id, username: spotifyUser.id, name: spotifyUser.display_name});
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		return context.redirect("/");
	} catch (e) {
		console.error(e)
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}

interface SpotifyUser {
	id: string;
	login: string;
	display_name: string;
}

interface DatabaseUser {
    id: string;
    username: string;
    spotify_id: number;
}
