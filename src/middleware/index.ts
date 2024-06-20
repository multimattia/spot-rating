import { lucia } from "../lib/auth";
import { verifyRequestOrigin } from "lucia";
import { defineMiddleware } from "astro:middleware";
import type { User as LuciaUser } from "lucia";
import { db, User, sql } from "astro:db";

export interface ExtendedUser extends LuciaUser {
  display_name: string;
  name: string;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // console.log(context);
  if (context.url.pathname === "/_image") {
    return next();
  }

  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
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
  try {
    existingUser = (
      await db
        .select()
        .from(User)
        .where(sql`${User.id} = ${session ? session.userId : ""}`)
    )[0];
  } catch (e) {
    console.error(e);
  }

  context.locals.session = session;
  context.locals.user = user;
  if (context.locals.user) {
    context.locals.user.username = existingUser.name;
  }
  return next();
});
