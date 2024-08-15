import { inngest } from "../../inngest/client";
import { db, User } from "astro:db";

export async function GET() {
  // Send your event payload to Inngest
  let albumResults: any[];
  try {
    albumResults = await db.select().from(User);
    // logger(JSON.stringify(albumResults, null, 2));
  } catch (e) {
    albumResults = [];
    console.error(e);
  }
  await inngest.send({
    name: "demo/hello.world",
    data: {
      message: "Hello, Houston!",
      email: "testToHouston@example.com",
      user: albumResults[0],
    },
  });

  return Response.json({ name: "Hello Houston from Inngest!" });
}
