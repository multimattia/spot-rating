import {
  Session,
  User,
  Songs,
  Songs_Temp,
  Comments,
  Playlists,
  PlaylistComments,
  SongArtist,
  SongPlaylists,
  Artists,
  SongStaging,
  db,
  NOW,
} from "astro:db";

import { v4 as uuidv4 } from "uuid";

import type { Playlist, PlaylistTrackObject } from "../types/spotifyTypes";

type TablePlaylist = {
  id: string;
  ownerId: string;
  name: string;
};

const flattenTrack = (trackObject: PlaylistTrackObject, playlistId: string) => {
  let tryName = "No name";
  if (trackObject.track === null) {
    return {
      id: `null${JSON.stringify(trackObject.added_by)}${trackObject.added_at}`,
      name: tryName,
      duration_ms: 0,
      addedById: trackObject.added_by.id,
      playlistId: playlistId,
      spotifyId: uuidv4(),
      albumId: uuidv4(),
      popularity: 0,
      addedAt: new Date(trackObject.added_at),
    };
  }
  try {
    const preparedTrack = {
      id: `${trackObject.track.id ? trackObject.track.id : trackObject.track.name.slice(0, 5)}${trackObject.added_at}`,
      name: trackObject.track.name,
      duration_ms: trackObject.track.duration_ms
        ? trackObject.track.duration_ms
        : 0,
      addedById: trackObject.added_by.id,
      playlistId: playlistId,
      spotifyId: trackObject.track.id ? trackObject.track.id : uuidv4(),
      albumId: trackObject.track.album.id ? trackObject.track.id : uuidv4(),
      popularity: trackObject.track.popularity
        ? trackObject.track.popularity
        : 0,
      addedAt: new Date(trackObject.added_at),
    };
    return preparedTrack;
  } catch (e) {
    console.error(`flatten error: ${e}`);
  }
};

export const insertSongWithRelations = async (
  tracks: PlaylistTrackObject[],
  playlistInfo: TablePlaylist,
) => {
  const preparedData = tracks.map((item, i) => {
    return flattenTrack(item, playlistInfo.id);
  });
  try {
    await db.batch([db.insert(Songs_Temp).values(preparedData)]);
  } catch (e) {
    console.error(`song table error: ${e}`);
  }
};
