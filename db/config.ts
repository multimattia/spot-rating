import { defineDb, defineTable, column, NOW } from "astro:db";

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({references: () => User.columns.id }),
    expiresAt: column.date(),
  },
})

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    url: column.text({ optional: true }),
    name: column.text(),
    email: column.text({ unique: true, optional: true }),
    username: column.text(),
    avatar: column.text({optional: true}),
    spotifyId: column.text({ unique: true }),
    updatedAt: column.date({default: NOW, nullable: true }),
    createdAt: column.date({default: NOW, nullable: true })
  }
})

const Song = defineTable({
    columns: {
        id: column.number({ primaryKey: true}),
        uri: column.text(),
        name: column.text(),
    }
})

const Addition = defineTable({
    columns: {
        id: column.number({ primaryKey: true}),
        songId: column.number({references: () => Song.columns.id}),
        userId: column.text({references: () => User.columns.id})
    }
})

const Comment = defineTable({
    columns: {
        id: column.number({ primaryKey: true}),
        songId: column.number({references: () => Song.columns.id}),
        userId: column.text({references: () => User.columns.id}),
        comment: column.text(),
    }
})

const Rating = defineTable({
    columns: {
        id: column.number({ primaryKey: true}),
        songId: column.number({references: () => Song.columns.id}),
        userId: column.text({references: () => User.columns.id}),
        rating: column.number(),
    }
})

// https://astro.build/db/config
export default defineDb({
  tables: { Session, User, Song, Addition, Comment, Rating}
});


