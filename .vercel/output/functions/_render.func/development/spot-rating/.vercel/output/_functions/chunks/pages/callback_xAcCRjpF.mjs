import { s as spotify, l as lucia } from './_id__CN_NXpWk.mjs';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { d as db, U as User, S as Session } from './_id__ChIl-fI5.mjs';
import { eq } from '@astrojs/db/dist/runtime/virtual.js';

async function GET(context) {
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("spotify_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
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
    const spotifyUser = await spotifyUserResponse.json();
    console.log(`${JSON.stringify(spotifyUser, null, 2)}`);
    const existingUser = await db.select().from(User).where(eq(User.spotifyId, spotifyUser.id));
    if (existingUser.length !== 0) {
      const session2 = await lucia.createSession(existingUser[0].id, {});
      console.log(`existinguser id: ${existingUser[0].id}`);
      await db.update(Session).set({
        refreshToken: tokens.refreshToken,
        accessToken: tokens.accessToken,
        tokenExpires: tokens.accessTokenExpiresAt
      }).where(eq(Session.userId, existingUser[0].id));
      console.log(`session list: ${db.select().from(Session)}`);
      const sessionCookie2 = lucia.createSessionCookie(session2.id);
      context.cookies.set(
        sessionCookie2.name,
        sessionCookie2.value,
        sessionCookie2.attributes
      );
      return context.redirect("/");
    }
    const userId = generateId(15);
    await db.insert(User).values({
      id: userId,
      spotifyId: spotifyUser.id,
      name: spotifyUser.display_name,
      avatar: spotifyUser.images[0].url,
      uri: spotifyUser.uri
    });
    const session = await lucia.createSession(userId, {});
    console.log(`userId id: ${userId}`);
    await db.update(Session).set({
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      tokenExpires: tokens.accessTokenExpiresAt
    }).where(eq(Session.userId, userId));
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
    if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
      return new Response(null, {
        status: 400
      });
    }
    return new Response(null, {
      status: 500
    });
  }
}

export { GET };
