import { defineDb, defineTable, column, NOW } from "astro:db";

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    expiresAt: column.date(),
    refreshToken: column.text({ optional: true }),
    accessToken: column.text({ optional: true }),
    tokenExpires: column.date({ optional: true }),
  },
  indexes: [{ on: ["id", "userId"] }],
});

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    url: column.text({ optional: true }),
    name: column.text(),
    avatar: column.text({ optional: true }),
    spotifyId: column.text({ unique: true }),
    updatedAt: column.date({ default: NOW, nullable: true }),
    createdAt: column.date({ default: NOW, nullable: true }),
  },
  indexes: [{ on: ["spotifyId"] }],
});

const Songs = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    duration_ms: column.number(),
    spotifyId: column.text(),
    addedById: column.text(),
    playlistId: column.number({ references: () => Playlists.columns.id }),
    albumId: column.number(),
    popularity: column.number(),
    addedAt: column.date(),
  },
  indexes: [{ on: ["spotifyId"] }],
});

const Songs_Temp = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    duration_ms: column.number(),
    addedById: column.text(),
    playlistId: column.number({ references: () => Playlists.columns.id }),
    spotifyId: column.text(),
    albumId: column.text(),
    popularity: column.number(),
    addedAt: column.date(),
  },
  indexes: [
    {
      on: ["playlistId"],
      unique: false,
    },
    {
      on: ["spotifyId"],
      unique: false,
    },
    {
      on: ["addedById"],
      unique: false,
    },
  ],
});

const Contributors_Temp = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    spotifyId: column.text(),
  },
});

const ContributorsSongsPlaylists_Temp = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    contributorId: column.text(),
    songId: column.text(),
    playlistId: column.text(),
    addedAt: column.date(),
  },
  // indexes: [{ on: [] }],
});

const Artists_Temp = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text({ unique: true }),
    spotifyId: column.text(),
  },
  // indexes: [{ on: [] }],
});

const Albums_Temp = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text({ unique: true }),
    spotifyId: column.text(),
  },
  // indexes: [{ on: ["id"] }],
});

const SongArtists_Temp = defineTable({
  columns: {
    songId: column.text({ primaryKey: true }),
    artistId: column.text(),
  },
  // indexes: [{ on: ["songId", "artistId"], unique: true }],
});

const SongPlaylists_Temp = defineTable({
  columns: {
    songId: column.text(),
    playlistId: column.text(),
    addedById: column.text(),
    addedAt: column.date(),
  },
  // indexes: [{ on: ["songId", "playlistId", "addedById"], unique: true }],
});

const SongAlbums_Temp = defineTable({
  columns: {
    songId: column.text(),
    albumId: column.text(),
  },
  indexes: [{ on: ["songId", "albumId"], unique: true }],
});

const AlbumArtists_Temp = defineTable({
  columns: {
    albumId: column.text(),
    artistId: column.text(),
  },
  indexes: [{ on: ["albumId", "artistId"], unique: true }],
});

const SongStaging = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    playlist_id: column.text(),
    added_by_id: column.text(),
    album_id: column.text(),
    name: column.text(),
    duration_ms: column.number(),
    popularity: column.number(),
    added_at: column.date(),
  },
});

const Artists = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    spotifyId: column.text(),
    name: column.text(),
  },
  indexes: [{ on: ["spotifyId"], unique: true }],
});

const Albums = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    spotifyId: column.number({ unique: true }),
    name: column.text(),
  },
  indexes: [{ on: ["spotifyId"] }],
});

const SongPlaylists = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    songId: column.number({ references: () => Songs.columns.id }),
    playlistId: column.number({ references: () => Playlists.columns.id }),
    addedById: column.text({ references: () => User.columns.id }),
    addedAt: column.date(),
  },
  indexes: [{ on: ["songId", "playlistId", "addedById"], unique: true }],
});

const SongArtist = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    songId: column.number({ references: () => Songs.columns.id }),
    artistId: column.number({ references: () => Artists.columns.id }),
  },
});

const SongAlbums = defineTable({
  columns: {
    songId: column.number({ references: () => Songs.columns.id }),
    albumId: column.number({ references: () => Albums.columns.id }),
  },
  indexes: [{ on: ["songId", "albumId"], unique: true }],
});

const Playlists = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    spotifyId: column.text(),
    userId: column.text({ references: () => User.columns.id }),
    ownerId: column.text({ references: () => User.columns.spotifyId }),
    createdAt: column.date({ default: NOW, nullable: true }),
    name: column.text(),
  },
  indexes: [
    {
      on: ["ownerId"],
      unique: false,
    },
    {
      on: ["userId"],
      unique: false,
    },
  ],
});

const PlaylistComments = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    author: column.text({ references: () => User.columns.id }),
    playlist: column.number({ references: () => Playlists.columns.id }),
  },
});

const Comments = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    songId: column.number({ references: () => Songs.columns.id }),
    playlistId: column.number({ references: () => Playlists.columns.id }),
    userId: column.text({ references: () => User.columns.id }),
    comment: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Session,
    User,
    Songs,
    Artists,
    Contributors_Temp,
    ContributorsSongsPlaylists_Temp,
    AlbumArtists_Temp,
    Artists_Temp,
    Albums_Temp,
    Songs_Temp,
    SongAlbums_Temp,
    SongArtists_Temp,
    SongPlaylists_Temp,
    Albums,
    Comments,
    Playlists,
    PlaylistComments,
    SongArtist,
    SongPlaylists,
    SongAlbums,
    SongStaging,
  },
});
