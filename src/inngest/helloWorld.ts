import { inngest } from "./client";
import { db, User } from "astro:db";

export default inngest.createFunction(
  { id: "hello-world" },
  { event: "demo/hello.world" },
  async ({ event, step }) => {
    let albumResults = await db.select().from(User);
    return { event, body: `${JSON.stringify(albumResults, null, 2)}` };
  },
);
