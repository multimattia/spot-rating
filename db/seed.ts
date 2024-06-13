import { db, User } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(User).values([
	{ id: 1, username: "Kasim", name:"anem", spotifyId: "jasasm"},
	{ id: 2, username: "Mina", name: "anem", spotifyId: "test" },
  ]);
}
