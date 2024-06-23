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
  if (context.url.pathname === "/_image") {
    return next();
  }
  if (context.url.pathname === "/logout") {
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

  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);

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
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
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

    currentSession = await db
      .select({ accessToken: Session.accessToken })
      .from(Session)
      .where(eq(existingUser.id, Session.userId));

    context.locals.accessToken = currentSession[0].accessToken;
  } catch (e) {
    console.log(
      `existingUser ${existingUser} or currentSession ${currentSession}`,
    );
    console.error(e);
  }

  context.locals.session = session;
  context.locals.user = user;
  context.locals.currentUser = existingUser;
  if (context.locals.user) {
    context.locals.user.username = existingUser.name;
  }
  return next();
});
