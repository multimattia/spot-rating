import {
  Session,
  User,
  Songs,
  Contributors_Temp,
  ContributorsSongsPlaylists_Temp,
  Albums,
  Albums_Temp,
  Artists_Temp,
  Songs_Temp,
  SongPlaylists_Temp,
  SongAlbums,
  SongAlbums_Temp,
  SongArtists_Temp,
  Comments,
  Playlists,
  PlaylistComments,
  SongArtist,
  SongPlaylists,
  Artists,
  SongStaging,
  sql,
  db,
  NOW,
  AlbumArtists_Temp,
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
  const dummyTrackId = uuidv4();
  const dummyAlbumId = uuidv4();
  const dummyArtistId = uuidv4();
  if (trackObject.track === null) {
    const dumbuuid = `null${JSON.stringify(trackObject.added_by)}${trackObject.added_at}`;
    const preparedTrack = {
      id: dummyTrackId,
      name: tryName,
      duration_ms: 0,
      addedById: trackObject.added_by.id,
      playlistId: playlistId,
      spotifyId: dummyTrackId,
      albumId: dummyAlbumId,
      popularity: 0,
      addedAt: new Date(trackObject.added_at),
      artists: [],
    };

    const artistsData = {
      id: dummyArtistId,
      name: "Local artist",
      spotifyId: dummyArtistId,
    };

    const albumData = {
      id: dummyAlbumId,
      name: "Local file",
      spotifyId: dummyAlbumId,
    };

    const songArtistsData = {
      songId: preparedTrack.id,
      artistId: dumbuuid,
    };

    const songAlbumData = {
      songId: dummyTrackId,
      albumId: dummyAlbumId,
    };

    const albumArtistsData = {
      artistId: dummyArtistId,
      albumId: dummyAlbumId,
    };

    const songPlaylistData = {
      songId: preparedTrack.id,
      playlistId: playlistId,
      addedById: trackObject.added_by.id,
      addedAt: new Date(trackObject.added_at),
    };

    // console.log(
    //   `flatten missing track: no object: ${JSON.stringify(
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
      artists: artistsData,
      album: albumData,
      albumArtists: albumArtistsData,
      songArtists: songArtistsData,
      songAlbum: songAlbumData,
      songPlaylist: songPlaylistData,
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
      artists: trackObject.track.artists,
    };
    // console.log(
    //   `trackobject: artists ${JSON.stringify(trackObject.track.artists)}`,
    // );

    const artistsData = trackObject.track.artists.map((artist) => ({
      id: artist.id ? artist.id : dummyArtistId,
      name: artist.name,
      spotifyId: artist.id ? artist.id : dummyArtistId,
    }));

    const albumData = {
      id: trackObject.track.album.id
        ? trackObject.track.album.id
        : dummyAlbumId,
      name: trackObject.track.album.name ? trackObject.track.album.name : "N/A",
      spotifyId: trackObject.track.album.id
        ? trackObject.track.album.id
        : dummyAlbumId,
    };

    const albumArtistsData = trackObject.track.artists.map((artist) => ({
      albumId: trackObject.track.album.id
        ? trackObject.track.album.id
        : dummyAlbumId,
      artistId: artist.id ? artist.id : dummyArtistId,
    }));

    const songArtistsData = trackObject.track.artists.map((artist) => ({
      songId: preparedTrack.id ? preparedTrack.id : dummyTrackId,
      artistId: artist.id ? artist.id : dummyArtistId,
    }));

    const songAlbumData = {
      songId: preparedTrack.id,
      albumId: trackObject.track.album.id
        ? trackObject.track.album.id
        : dummyAlbumId,
    };

    const songPlaylistData = {
      songId: preparedTrack.id,
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
      artists: artistsData,
      album: albumData,
      albumArtists: albumArtistsData,
      songArtists: songArtistsData,
      songAlbum: songAlbumData,
      songPlaylist: songPlaylistData,
    };
  } catch (e) {
    // will fix later
    const dumbuuid = `null${JSON.stringify(trackObject.added_by)}${trackObject.added_at}`;
    const preparedTrack = {
      id: dummyTrackId,
      name: tryName,
      duration_ms: 0,
      addedById: trackObject.added_by.id,
      playlistId: playlistId,
      spotifyId: dummyTrackId,
      albumId: dummyAlbumId,
      popularity: 0,
      addedAt: new Date(trackObject.added_at),
      artists: [],
    };

    const artistsData = {
      id: dummyArtistId,
      name: "Local artist",
      spotifyId: dummyArtistId,
    };

    const albumData = {
      id: dummyAlbumId,
      name: "Local file",
      spotifyId: dummyAlbumId,
    };

    const songArtistsData = {
      songId: preparedTrack.id,
      artistId: dumbuuid,
    };

    const songAlbumData = {
      songId: dummyTrackId,
      albumId: dummyAlbumId,
    };

    const albumArtistsData = {
      artistId: dummyArtistId,
      albumId: dummyAlbumId,
    };

    const songPlaylistData = {
      songId: preparedTrack.id,
      playlistId: playlistId,
      addedById: trackObject.added_by.id,
      addedAt: new Date(trackObject.added_at),
    };

    // console.log(
    //   `flatten error: ${e}, object: ${JSON.stringify(
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
      artists: artistsData,
      album: albumData,
      albumArtists: albumArtistsData,
      songArtists: songArtistsData,
      songAlbum: songAlbumData,
      songPlaylist: songPlaylistData,
    };
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
    await db.batch([
      db
        .insert(Songs_Temp)
        .values(preparedData.map(({ song }) => song))
        .onConflictDoNothing(),
    ]);
  } catch (e) {
    console.error(`song table error: ${e}`);
  }

  try {
    await db.batch([
      db
        .insert(Artists_Temp)
        .values(preparedData.flatMap(({ artists }) => artists))
        .onConflictDoNothing(),
    ]);
  } catch (e) {
    console.error(`artist table error: ${e}`);
  }
  try {
    await db.batch([
      db
        .insert(Albums_Temp)
        .values(
          preparedData.map(({ album }) => {
            return album;
          }),
        )
        .onConflictDoNothing(),
    ]);
  } catch (e) {
    console.error(`album table error: ${e}`);
  }

  try {
    await db.batch([
      db
        .insert(AlbumArtists_Temp)
        .values(preparedData.flatMap(({ albumArtists }) => albumArtists))
        .onConflictDoNothing(),
    ]);
  } catch (e) {
    console.error(`album artist relational table error: ${e}`);
  }

  try {
    await db.batch([
      db
        .insert(Contributors_Temp)
        .values(
          preparedData.map(({ song }) => ({
            id: song.addedById || "Spotify",
            name: song.addedById || "Spotify",
            spotifyId: song.addedById,
          })),
        )
        .onConflictDoNothing(),
    ]);
  } catch (e) {
    console.error(`contributor relational table error: ${e}`);
  }

  try {
    await db.batch([
      db
        .insert(ContributorsSongsPlaylists_Temp)
        .values(
          preparedData.map(({ song }) => ({
            id: `${song.addedById || "Spotify"}-${song.id}-${song.playlistId}}`,
            contributorId: song.addedById ? song.addedById : "Spotify",
            songId: song.id,
            playlistId: song.playlistId,
            addedAt: song.addedAt,
          })),
        )
        .onConflictDoNothing(),
    ]);
  } catch (e) {
    console.error(`contributor relational table error: ${e}`);
  }

  try {
    await db.batch([
      db
        .insert(SongPlaylists_Temp)
        .values(preparedData.map(({ songPlaylist }) => songPlaylist))
        .onConflictDoNothing(),
    ]);
  } catch (e) {
    console.error(`song playlist relational table error: ${e}`);
  }
};

// TODO: spotify-generated playlists
export const processStagingData = async (playlistId: string) => {
  try {
    await db.batch([
      db.insert(Songs).values(db.select().from(Songs_Temp)),
      db.insert(Artists).values(db.select().from(Artists_Temp)),
      db.insert(Albums).values(db.select().from(Albums_Temp)),
      db.insert(SongArtist).values(
        db
          .select({
            id: sql`${SongArtists_Temp.songId} || '-' || ${SongArtists_Temp.artistId}`,
            songId: SongArtists_Temp.songId,
            artistId: SongArtists_Temp.artistId,
          })
          .from(SongArtists_Temp),
      ),
      db.insert(SongAlbums).values(
        db
          .select({
            id: `sql${SongAlbums_Temp.songId} || '-' || ${SongAlbums_Temp.albumId}`,
            songId: SongAlbums_Temp.songId,
            albumId: SongAlbums_Temp.albumId,
          })
          .from(SongAlbums_Temp),
      ),
    ]);

    await db.batch([
      db.delete(Songs_Temp),
      db.delete(Artists_Temp),
      db.delete(Albums_Temp),
      db.delete(SongArtists_Temp),
      db.delete(SongAlbums_Temp),
    ]);
  } catch (e) {
    console.error(`Error processing stage data: ${e}`);
  }
};
