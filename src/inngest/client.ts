import { Inngest } from "inngest";
import { schemas } from "./types.ts";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "boomboxd", schemas });
