import { generateState } from 'arctic';
import { s as spotify } from './_id__CN_NXpWk.mjs';

async function GET(context) {
  const state = generateState();
  const url = await spotify.createAuthorizationURL(state);
  context.cookies.set("spotify_oauth_state", state, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax"
  });
  return context.redirect(url.toString());
}

export { GET };
