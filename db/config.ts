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
});

const Song = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    uri: column.text(),
    name: column.text(),
    playlist: column.text({ references: () => Playlist.columns.id }),
    cover: column.text(),
  },
});

const Artist = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
  },
});

const SongArtist = defineTable({
  columns: {
    id: column.text(),
    songId: column.text({ references: () => Song.columns.id }),
    artistId: column.text({ references: () => Artist.columns.id }),
  },
});

const Playlist = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
  },
});

const Addition = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    songId: column.text({ references: () => Song.columns.id }),
    userId: column.text({ references: () => User.columns.id }),
  },
});

const Comment = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    songId: column.text({ references: () => Song.columns.id }),
    userId: column.text({ references: () => User.columns.id }),
    comment: column.text(),
  },
});

const Rating = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    songId: column.text({ references: () => Song.columns.id }),
    userId: column.text({ references: () => User.columns.id }),
    rating: column.number(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Session,
    User,
    Song,
    Addition,
    Comment,
    Rating,
    Playlist,
    SongArtist,
    Artist,
  },
});
