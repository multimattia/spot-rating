import { db, User } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(User).values([
    {
      name: "anem",
      spotifyId: "jasasm",
    },
    {
      name: "anem",
      spotifyId: "test",
    },
    {
      name: "Spotify",
      spotifyId: "spotify",
    },
  ]);
}
