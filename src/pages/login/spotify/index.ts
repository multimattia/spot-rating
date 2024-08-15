import { generateState } from "arctic";
import { spotify } from "../../../lib/auth";

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const state = generateState();
  const url = await spotify.createAuthorizationURL(state, {
    scopes: [
      "streaming",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "user-read-playback-position",
      "user-read-email",
      "user-read-private",
      "playlist-read-private",
      "playlist-read-collaborative",
    ],
  });

  context.cookies.set("spotify_oauth_state", state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return context.redirect(url.toString());
}
