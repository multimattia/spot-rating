/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
  interface Token {
    refreshToken: String;
    accessToken: String;
    accessTokenExpiresAt: Date;
  }

  interface SpotifyUser {
    id: string;
    url: string;
    name: string;
    spotifyId: string;
    updatedAt: string;
    createdAt: string;
  }

  interface Locals {
    session: import("lucia").Session | null;
    user: import("lucia").User | null;
    currentUser: SpotifyUser;
    accessToken: String;
    dbUser: User | null;
    tokens: Token | null;
    isLoggedIn: boolean;
  }
}
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("./lib/lucia").Auth;
  type DatabaseUserAttributes = {};
  type DatabaseSessionAttributes = {};
}

interface ImportMetaEnv {
  readonly SPOTIFY_CLIENT_ID: string;
  readonly SPOTIFY_CLIENT_SECRET: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
