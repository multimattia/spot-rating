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
    popularity: column.number(),
    addedAt: column.date(),
  },
  indexes: [{ on: ["spotifyId"] }],
});

const Contributors_Temp = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    spotifyId: column.text(),
  },
});

const Song_Staging = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    playlist_id: column.text(),
    track_name: column.text(),
    track_id: column.text(),
    album_name: column.text(),
    album_id: column.text(),
    artist_names: column.text(),
    artist_ids: column.text(),
    duration_ms: column.number(),
    popularity: column.number(),
    added_by_id: column.text(),
    added_at: column.date(),
    raw_data: column.json(),
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
  indexes: [{ on: ["spotifyId"], unique: true }],
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
    Albums,
    Comments,
    Playlists,
    PlaylistComments,
    SongArtist,
    SongPlaylists,
    SongAlbums,
    Song_Staging,
  },
});
