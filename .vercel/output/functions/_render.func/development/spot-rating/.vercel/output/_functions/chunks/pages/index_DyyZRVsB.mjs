import { e as createComponent, r as renderTemplate, m as maybeRenderHead, i as renderComponent, h as createAstro, g as addAttribute, k as Fragment, j as renderHead } from '../astro_Ccjqjgku.mjs';
import { $ as $$Image, d as db, U as User, S as Session } from './_id__ChIl-fI5.mjs';
/* empty css                          */
import { sql, eq } from '@astrojs/db/dist/runtime/virtual.js';
/* empty css                          */
/* empty css                          */

const $$Astro$3 = createAstro();
const $$Playlisting = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Playlisting;
  let playlistDataArray;
  if ("playlistData" in Astro2.props && Array.isArray(Astro2.props.playlistData)) {
    playlistDataArray = Astro2.props.playlistData;
  } else {
    playlistDataArray = [];
  }
  return renderTemplate`${maybeRenderHead()}<div class="main-list" data-astro-cid-ncakswfw> ${playlistDataArray.map((item, index) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-ncakswfw": true }, { "default": ($$result2) => renderTemplate` <a${addAttribute(`playlists/${item.id}`, "href")} data-astro-cid-ncakswfw> <div class="playlist" data-astro-cid-ncakswfw> ${renderComponent($$result2, "Image", $$Image, { "src": item.images[0].url, "alt": "", "width": "100", "height": "100", "data-astro-cid-ncakswfw": true })} <div class="desc" data-astro-cid-ncakswfw> <h2 data-astro-cid-ncakswfw>${item.name}</h2> <h3 data-astro-cid-ncakswfw>by ${item.owner.display_name}</h3> <p data-astro-cid-ncakswfw>${item.description}</p>  </div> </div> </a> ` })}`)} </div> `;
}, "/Users/maat/development/spot-rating/src/components/Playlisting.astro", void 0);

const $$Astro$2 = createAstro();
const $$Index$2 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Index$2;
  const luciaUser = Astro2.locals.user;
  console.log(luciaUser);
  if (!luciaUser) {
    return Astro2.redirect("/login");
  }
  const existingUser = (await db.select().from(User).where(sql`${User.id} = ${luciaUser.id}`))[0];
  const session = await db.select().from(Session).where(eq(existingUser.id, Session.userId));
  const spotifyUserResponse = await fetch(
    `https://api.spotify.com/v1/users/${existingUser.spotifyId}/playlists?offset=0&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${session[0].accessToken}`
      }
    }
  );
  let spotifyUserData;
  if (spotifyUserResponse.ok) {
    spotifyUserData = await spotifyUserResponse.json();
  } else {
    console.error(
      "error: ",
      spotifyUserResponse.status,
      spotifyUserResponse.statusText
    );
    spotifyUserData = [];
  }
  return renderTemplate`<html lang="en" data-astro-cid-gd6od7ox> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Create Playlist</title>${renderHead()}</head> <body data-astro-cid-gd6od7ox> <nav data-astro-cid-gd6od7ox> <h2 class="title" data-astro-cid-gd6od7ox>Spot-rating</h2> <div class="user" data-astro-cid-gd6od7ox> ${renderComponent($$result, "Image", $$Image, { "src": existingUser.avatar, "alt": ``, "height": "40", "width": "40", "loading": "eager", "class": "square", "data-astro-cid-gd6od7ox": true })} <p data-astro-cid-gd6od7ox>${existingUser.name}</p> <form method="post" action="/api/logout" data-astro-cid-gd6od7ox> <button data-astro-cid-gd6od7ox>Sign out</button> </form> </div> </nav> <p data-astro-cid-gd6od7ox> <em data-astro-cid-gd6od7ox>Missing playlists? Make sure that they're visible from your profile!</em> </p> ${renderComponent($$result, "Playlisting", $$Playlisting, { "playlistData": spotifyUserData.items, "data-astro-cid-gd6od7ox": true })}  </body> </html>`;
}, "/Users/maat/development/spot-rating/src/pages/createplaylist/index.astro", void 0);

const $$file$2 = "/Users/maat/development/spot-rating/src/pages/createplaylist/index.astro";
const $$url$2 = "/createplaylist";

const index$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index$2,
  file: $$file$2,
  url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$1 = createAstro();
const $$Index$1 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Index$1;
  if (Astro2.locals.user) {
    return Astro2.redirect("/");
  }
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Lucia example</title>${renderHead()}</head> <body> <h1>Sign in</h1> <a href="/login/spotify">Sign in with Spotify</a> </body></html>`;
}, "/Users/maat/development/spot-rating/src/pages/login/index.astro", void 0);

const $$file$1 = "/Users/maat/development/spot-rating/src/pages/login/index.astro";
const $$url$1 = "/login";

const index$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index$1,
  file: $$file$1,
  url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const luciaUser = Astro2.locals.user;
  console.log(luciaUser);
  if (!luciaUser) {
    return Astro2.redirect("/login");
  }
  const existingUser = (await db.select().from(User).where(sql`${User.id} = ${luciaUser.id}`))[0];
  const session = await db.select().from(Session).where(eq(existingUser.id, Session.userId));
  const spotifyUserResponse = await fetch(
    `https://api.spotify.com/v1/users/${existingUser.spotifyId}/playlists?offset=0&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${session[0].accessToken}`
      }
    }
  );
  let spotifyUserData;
  if (spotifyUserResponse.ok) {
    spotifyUserData = await spotifyUserResponse.json();
  } else {
    console.error(
      "error: ",
      spotifyUserResponse.status,
      spotifyUserResponse.statusText
    );
    spotifyUserData = [];
  }
  return renderTemplate`<html lang="en" data-astro-cid-j7pv25f6> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Lucia example</title>${renderHead()}</head> <body data-astro-cid-j7pv25f6> <nav data-astro-cid-j7pv25f6> <h2 class="title" data-astro-cid-j7pv25f6>Spot-rating</h2> <div class="user" data-astro-cid-j7pv25f6> ${renderComponent($$result, "Image", $$Image, { "src": existingUser.avatar, "alt": ``, "height": "40", "width": "40", "loading": "eager", "class": "square", "data-astro-cid-j7pv25f6": true })} <p data-astro-cid-j7pv25f6>${existingUser.name}</p> <form method="post" action="/api/logout" data-astro-cid-j7pv25f6> <button data-astro-cid-j7pv25f6>Sign out</button> </form> </div> </nav> <p data-astro-cid-j7pv25f6> <em data-astro-cid-j7pv25f6>Missing playlists? Make sure that they're visible from your profile!</em> </p> ${renderComponent($$result, "Playlisting", $$Playlisting, { "playlistData": spotifyUserData.items, "data-astro-cid-j7pv25f6": true })}  </body> </html>`;
}, "/Users/maat/development/spot-rating/src/pages/index.astro", void 0);

const $$file = "/Users/maat/development/spot-rating/src/pages/index.astro";
const $$url = "";

const index = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { index$1 as a, index as b, index$2 as i };
