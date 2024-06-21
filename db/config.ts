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
    uri: column.text(),
    name: column.text(),
    avatar: column.text({ optional: true }),
    spotifyId: column.text({ unique: true }),
    updatedAt: column.date({ default: NOW, nullable: true }),
    createdAt: column.date({ default: NOW, nullable: true }),
  },
  indexes: [{ on: ["id", "spotifyId"] }],
});

const Songs = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    duration_ms: column.number(),
    addedById: column.text(),
    playlistId: column.text({ references: () => Playlists.columns.id }),
    albumId: column.text(),
    popularity: column.number(),
    addedAt: column.date(),
  },
  indexes: [{ on: ["id"] }],
});

const Songs_Temp = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    duration_ms: column.number(),
    addedById: column.text(),
    playlistId: column.text({ references: () => Playlists.columns.id }),
    spotifyId: column.text(),
    albumId: column.text(),
    popularity: column.number(),
    addedAt: column.date(),
  },
  indexes: [
    { on: ["id"] },
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
    id: column.text({ primaryKey: true }),
    name: column.text(),
  },
});

const Albums = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
  },
});
const SongPlaylists = defineTable({
  columns: {
    id: column.text(),
    songId: column.text({ references: () => Songs.columns.id }),
    playlistId: column.text({ references: () => Playlists.columns.id }),
  },
});

const SongArtist = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    songId: column.text({ references: () => Songs.columns.id }),
    artistId: column.text({ references: () => Artists.columns.id }),
  },
});

const SongAlbums = defineTable({
  columns: {
    id: column.text(),
    songId: column.text({ references: () => Songs.columns.id }),
    albumId: column.text({ references: () => Albums.columns.id }),
  },
});

const Playlists = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    userId: column.text({ references: () => User.columns.id }),
    ownerId: column.text({ references: () => User.columns.spotifyId }),
    createdAt: column.date({ default: NOW, nullable: true }),
    name: column.text(),
  },
  indexes: [
    { on: ["id"] },
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
    playlist: column.text({ references: () => Playlists.columns.id }),
  },
});

const Comments = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    songId: column.text({ references: () => Songs.columns.id }),
    playlistId: column.text({ references: () => Playlists.columns.id }),
    userId: column.text({ references: () => User.columns.id }),
    comment: column.text(),
    rating: column.number(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Session,
    User,
    Songs,
    Songs_Temp,
    Albums,
    Comments,
    Playlists,
    PlaylistComments,
    SongArtist,
    SongPlaylists,
    SongAlbums,
    Artists,
    SongStaging,
  },
});
