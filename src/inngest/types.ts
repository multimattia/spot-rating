import { EventSchemas } from "inngest";

const DemoEventSent = {
  name: "demo/hello.world",
  data: {} as {
    message: string;
    email?: string;
    user?: any;
  },
} as const;

const PlaylistEventSent = {
  name: "boomboxd/loadPlaylist",
  data: {} as {
    message: string;
    playlistId: string;
    spotifyId: string;
    user?: any;
    songs?: any;
  },
} as const;

const LeavePlaylistEvent = {
  name: "boomboxd/leavePlaylist",
  data: {} as {
    page: string;
    timestamp: string;
    playlistId: string;
    spotifyId: string;
  },
} as const;

const eventTypes = {
  DemoEventSent,
  PlaylistEventSent,
  LeavePlaylistEvent,
};

type AllEvents = (typeof eventTypes)[keyof typeof eventTypes];

export const schemas = new EventSchemas().fromUnion<AllEvents>();
