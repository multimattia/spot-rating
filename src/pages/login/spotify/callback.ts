import { spotify, lucia } from "../../../lib/auth";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { db, User, Session, eq } from "astro:db";

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("spotify_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await spotify.validateAuthorizationCode(code);
    const spotifyUserResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const spotifyUser: SpotifyUser = await spotifyUserResponse.json();
    console.log(`${JSON.stringify(spotifyUser, null, 2)}`);
    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.spotifyId, spotifyUser.id));

    if (existingUser.length !== 0) {
      const session = await lucia.createSession(existingUser[0].id, {});
      console.log(`existinguser id: ${existingUser[0].id}`);
      await db
        .update(Session)
        .set({
          refreshToken: tokens.refreshToken,
          accessToken: tokens.accessToken,
          tokenExpires: tokens.accessTokenExpiresAt,
        })
        .where(eq(Session.userId, existingUser[0].id));
      console.log(`session list: ${db.select().from(Session)}`);
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return context.redirect("/");
    }

    const userId = generateId(15);
    await db
      .insert(User)
      .values({
        id: userId,
        spotifyId: spotifyUser.id,
        name: spotifyUser.display_name,
        avatar: spotifyUser.images[0].url,
        uri: spotifyUser.uri,
      });
    const session = await lucia.createSession(userId, {});
    console.log(`userId id: ${userId}`);
    await db
      .update(Session)
      .set({
        refreshToken: tokens.refreshToken,
        accessToken: tokens.accessToken,
        tokenExpires: tokens.accessTokenExpiresAt,
      })
      .where(eq(Session.userId, userId));
    console.log(
      `session list: ${JSON.stringify(await db.select().from(Session))}`
    );
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return context.redirect("/");
  } catch (e) {
    console.error(e);
    if (
      e instanceof OAuth2RequestError &&
      e.message === "bad_verification_code"
    ) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}

interface Image {
  url: string;
  height?: number;
  width?: number;
}

interface SpotifyUser {
  display_name: string;
  href: string;
  id: string;
  images: Image[];
  type: string;
  uri: string;
}

interface DatabaseUser {
  id: string;
  username: string;
  spotify_id: number;
}
