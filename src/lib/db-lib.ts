import {
  Session,
  User,
  Songs,
  Contributors_Temp,
  Albums,
  SongAlbums,
  Comments,
  Playlists,
  PlaylistComments,
  SongArtist,
  SongPlaylists,
  Artists,
  Song_Staging,
  sql,
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
  const dummyTrackId = uuidv4();
  const dummyAlbumId = uuidv4();
  const dummyArtistId = uuidv4();
  // let tryName = "No name";
  // if (trackObject.track === null) {
  //   const dumbuuid = `null${JSON.stringify(trackObject.added_by)}${trackObject.added_at}`;
  //   const preparedTrack = {
  //     id: dummyTrackId,
  //     name: tryName,
  //     duration_ms: 0,
  //     addedById: trackObject.added_by.id,
  //     playlistId: playlistId,
  //     spotifyId: dummyTrackId,
  //     albumId: dummyAlbumId,
  //     popularity: 0,
  //     addedAt: new Date(trackObject.added_at),
  //     artists: [],
  //   };

  //   const artistsData = {
  //     name: "Local artist",
  //     spotifyId: dummyArtistId,
  //   };

  //   const albumData = {
  //     name: "Local file",
  //     spotifyId: dummyAlbumId,
  //   };

  //   const songArtistsData = {
  //     songId: preparedTrack.id,
  //     artistId: dumbuuid,
  //   };

  //   const songAlbumData = {
  //     songId: dummyTrackId,
  //     albumId: dummyAlbumId,
  //   };

  //   const albumArtistsData = {
  //     artistId: dummyArtistId,
  //     albumId: dummyAlbumId,
  //   };

  //   const songPlaylistData = {
  //     songId: preparedTrack.id,
  //     playlistId: playlistId,
  //     addedById: trackObject.added_by.id,
  //     addedAt: new Date(trackObject.added_at),
  //   };

  //   // console.log(
  //   //   `flatten missing track: no object: ${JSON.stringify(
  //   //     {
  //   //       song: preparedTrack,
  //   //       artists: artistsData,
  //   //       album: albumData,
  //   //       albumArtists: albumArtistsData,
  //   //       songArtists: songArtistsData,
  //   //       songAlbum: songAlbumData,
  //   //       songPlaylist: songPlaylistData,
  //   //     },
  //   //     null,
  //   //     2,
  //   //   )}`,
  //   // );

  //   return {
  //     song: preparedTrack,
  //     artists: artistsData,
  //     album: albumData,
  //     albumArtists: albumArtistsData,
  //     songArtists: songArtistsData,
  //     songAlbum: songAlbumData,
  //     songPlaylist: songPlaylistData,
  //   };
  // }
  // try {
  const preparedTrack = {
    name: trackObject.track.name || "No Name",
    duration_ms: trackObject.track.duration_ms || 0,
    addedById: trackObject.added_by.id,
    playlistId: playlistId,
    spotifyId: trackObject.track.id || uuidv4(),
    popularity: trackObject.track.popularity || 0,
    addedAt: new Date(trackObject.added_at),
    artists: trackObject.track.artists || "",
  };

  const preparedArtist = trackObject.track.artists.map((artist) => ({
    name: artist.name || "No Name",
    spotifyId: artist.id || dummyArtistId,
  }));

  const albumData = {
    name: trackObject.track.album.name || "N/A",
    spotifyId: trackObject.track.album.id || dummyAlbumId,
  };

  const albumArtistsData = trackObject.track.artists.map((artist) => ({
    albumId: trackObject.track.album.id || dummyAlbumId,
    artistId: artist.id || dummyArtistId,
  }));

  const songArtistsData = trackObject.track.artists.map((artist) => ({
    // songId: preparedTrack!.id ? "" : dummyTrackId,
    artistId: artist.id ? artist.id : dummyArtistId,
  }));

  const songAlbumData = {
    // songId: preparedTrack!.id,
    albumId: trackObject.track.album.id || dummyAlbumId,
  };

  const songPlaylistData = {
    // songId: preparedTrack.id,
    playlistId: playlistId,
    addedById: trackObject.added_by.id,
    addedAt: new Date(trackObject.added_at),
  };

  // console.log(
  //   `flatten no errorobject: ${JSON.stringify(
  //     {
  //       song: preparedTrack,
  //       artists: artistsData,
  //       album: albumData,
  //       albumArtists: albumArtistsData,
  //       songArtists: songArtistsData,
  //       songAlbum: songAlbumData,
  //       songPlaylist: songPlaylistData,
  //     },
  //     null,
  //     2,
  //   )}`,
  // );

  return {
    song: preparedTrack,
    artists: preparedArtist,
    album: albumData,
    albumArtists: albumArtistsData,
    songArtists: songArtistsData,
    songAlbum: songAlbumData,
    songPlaylist: songPlaylistData,
  };
  // } catch (e) {
  //   // will fix later
  //   const dumbuuid = `null${JSON.stringify(trackObject.added_by)}${trackObject.added_at}`;
  //   const preparedTrack = {
  //     id: dummyTrackId,
  //     name: tryName,
  //     duration_ms: 0,
  //     addedById: trackObject.added_by.id,
  //     playlistId: playlistId,
  //     spotifyId: dummyTrackId,
  //     albumId: dummyAlbumId,
  //     popularity: 0,
  //     addedAt: new Date(trackObject.added_at),
  //     artists: [],
  //   };

  //   const artistsData = {
  //     id: dummyArtistId,
  //     name: "Local artist",
  //     spotifyId: dummyArtistId,
  //   };

  //   const albumData = {
  //     id: dummyAlbumId,
  //     name: "Local file",
  //     spotifyId: dummyAlbumId,
  //   };

  //   const songArtistsData = {
  //     songId: preparedTrack.id,
  //     artistId: dumbuuid,
  //   };

  //   const songAlbumData = {
  //     songId: dummyTrackId,
  //     albumId: dummyAlbumId,
  //   };

  //   const albumArtistsData = {
  //     artistId: dummyArtistId,
  //     albumId: dummyAlbumId,
  //   };

  //   const songPlaylistData = {
  //     songId: preparedTrack.id,
  //     playlistId: playlistId,
  //     addedById: trackObject.added_by.id,
  //     addedAt: new Date(trackObject.added_at),
  //   };

  //   // console.log(
  //   //   `flatten error: ${e}, object: ${JSON.stringify(
  //   //     {
  //   //       song: preparedTrack,
  //   //       artists: artistsData,
  //   //       album: albumData,
  //   //       albumArtists: albumArtistsData,
  //   //       songArtists: songArtistsData,
  //   //       songAlbum: songAlbumData,
  //   //       songPlaylist: songPlaylistData,
  //   //     },
  //   //     null,
  //   //     2,
  //   //   )}`,
  //   // );

  //   return {
  //     song: preparedTrack,
  //     artists: artistsData,
  //     album: albumData,
  //     albumArtists: albumArtistsData,
  //     songArtists: songArtistsData,
  //     songAlbum: songAlbumData,
  //     songPlaylist: songPlaylistData,
  //   };
  // }
};

export const insertSongWithRelations = async (
  tracks: PlaylistTrackObject[],
  playlistInfo: TablePlaylist,
) => {
  // db.insert(Song_Staging).values(tracks.map((track: PlaylistTrackObject) => ({ id: track.track.id })) )
  console.log(playlistInfo.id);
  await db.insert(Song_Staging).values(
    tracks.map((track) => ({
      id: track.track.id || uuidv4(),
      playlist_id: playlistInfo.id,
      track_name: track.track.name || uuidv4(),
      track_id: track.track.id || uuidv4(),
      duration_ms: track.track.duration_ms || 0,
      popularity: track.track.popularity || 0,
      album_name: track.track.album.name || "No name",
      album_id: track.track.album.id || uuidv4(),
      artist_names:
        track.track.artists.map((a) => a.name).join(",") || "No artist",
      artist_ids: track.track.artists.map((a) => a.id).join(",") || uuidv4(),
      added_by_id: track.added_by.id,
      added_at: new Date(track.added_at),
      raw_data: JSON.stringify(track),
    })),
  );
  const stagingRecords = await db.select().from(Song_Staging);
  console.log(JSON.stringify(stagingRecords.slice(0, 2)));
  // processStagingData(stagingRecords);
};

// TODO: spotify-generated playlists
export const processStagingData = async (batch: any[]): Promise<void> => {
  for (const row of batch) {
    try {
      const [song] = await db
        .insert(Songs)
        .values({
          name: row.name,
          duration_ms: row.duration_ms,
          spotifyId: row.track_id,
          addedById: row.added_by_id,
          popularity: row.popularity,
          playlistId: row.playlist_id,
          addedAt: row.addedAt,
        })
        .onConflictDoUpdate({
          target: Songs.spotifyId,
          set: {
            name: row.name,
            duration_ms: row.duration_ms,
            popularity: row.popularity,
            addedAt: row.addedAt,
          },
        })
        .returning();
    } catch (e) {
      console.log("error processing initial songs");
      console.error(e);
    }
    try {
      for (const artistData of row.artists) {
        const [artist] = await db
          .insert(Artists)
          .values({
            name: artistData.name,
            spotifyId: artistData.added_by_id,
          })
          .onConflictDoUpdate({
            target: Artists.spotifyId,
            set: {
              name: artistData.name,
            },
          })
          .returning();
      }
    } catch (e) {
      console.log("error processing initial artists");
      console.error(e);
    }
    // db.batch([await])
  }
};
