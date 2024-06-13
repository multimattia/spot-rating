/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
	interface Locals {
        session: import("lucia").Session | null;
        user: import("lucia").User | null;
        dbUser: User | null;
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

