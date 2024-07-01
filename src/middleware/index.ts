import { lucia } from "../lib/auth";
import { verifyRequestOrigin } from "lucia";
import { defineMiddleware } from "astro:middleware";
import type { User as LuciaUser } from "lucia";
import { db, User, Session, sql, eq } from "astro:db";

export interface ExtendedUser extends LuciaUser {
  display_name: string;
  name: string;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // console.log(context);
  // will fix in time ;)
  if (context.url.pathname === "/_image") {
    return next();
  }
  if (context.url.pathname === "/logout") {
    return next();
  }
  if (context.url.pathname === "/login") {
    return next();
  }

  if (context.url.pathname === "/inngest") {
    return next();
  }
  if (context.url.pathname === "/inngest/client") {
    return next();
  }
  if (context.url.pathname === "/inngest/helloWorld") {
    return next();
  }

  if (context.url.pathname === "/login") {
    return next();
  }
  if (context.url.pathname === "/login/spotify") {
    return next();
  }
  if (context.url.pathname === "/login/spotify/callback") {
    return next();
  }

  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
  console.log(`Sessionid: ${sessionId}`);

  if (!sessionId) {
    console.log(`no session id:`);
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  console.log(`lucia session: ${session}`);
  console.log(`lucia user: ${user}`);

  if (!user) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login",
      },
    });
  }

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    console.log(`lucia sessionCookie, fresh: ${sessionCookie}`);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    console.log(`lucia sessionCookie no session: ${sessionCookie}`);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  let existingUser;
  let currentSession;
  try {
    existingUser = (
      await db
        .select()
        .from(User)
        .where(sql`${User.id} = ${session ? session.userId : ""}`)
    )[0];
    console.log(`existing user: ${existingUser}`);

    currentSession = await db
      .select({ accessToken: Session.accessToken })
      .from(Session)
      .where(sql`${existingUser.id} = ${Session.userId}`);
    // .where(eq(existingUser.id, Session.userId));

    context.locals.accessToken = currentSession[0].accessToken!;
  } catch (e) {
    // existingUser = {
    //   currentUser: {
    //     name: "ERROR",
    //   },
    // };
    console.log(
      `existingUser ${existingUser} or currentSession ${currentSession}`,
    );
    console.error(e);
  }

  context.locals.session = session;
  context.locals.user = user;
  console.log(`existingUser: ${existingUser}`);
  // if (context.locals.currentUser) {
  context.locals.currentUser = {
    ...existingUser!,
    url: existingUser!.url || "no url",
    id: existingUser!.id || "no id",
    name: existingUser!.name || "no name",
    spotifyId: existingUser!.spotifyId || "No spotifyid",
    updatedAt:
      existingUser!.updatedAt?.toISOString() || new Date().toISOString(),
    createdAt:
      existingUser!.createdAt?.toISOString() || new Date().toISOString(),
  };
  // }
  if (context.locals.user) {
    context.locals.user.username = existingUser!.name || "No name";
  }
  return next();
});
