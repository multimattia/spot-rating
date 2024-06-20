import { a1 as bold, a2 as red, a3 as yellow, a4 as dim, a5 as blue } from './chunks/astro_Ccjqjgku.mjs';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at ".concat(i));
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at ".concat(j));
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at ".concat(j));
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at ".concat(i));
            if (!pattern)
                throw new TypeError("Missing pattern at ".concat(i));
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
    };
    var consumeText = function () {
        var result = "";
        var value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options) {
    if (options === void 0) { options = {}; }
    var reFlags = flags(options);
    var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
    // Compile all the tokens into regexps.
    var matches = tokens.map(function (token) {
        if (typeof token === "object") {
            return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
        }
    });
    return function (data) {
        var path = "";
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (typeof token === "string") {
                path += token;
                continue;
            }
            var value = data ? data[token.name] : undefined;
            var optional = token.modifier === "?" || token.modifier === "*";
            var repeat = token.modifier === "*" || token.modifier === "+";
            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to not repeat, but got an array"));
                }
                if (value.length === 0) {
                    if (optional)
                        continue;
                    throw new TypeError("Expected \"".concat(token.name, "\" to not be empty"));
                }
                for (var j = 0; j < value.length; j++) {
                    var segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError("Expected all \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }
            if (typeof value === "string" || typeof value === "number") {
                var segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }
            if (optional)
                continue;
            var typeOfMessage = repeat ? "an array" : "a string";
            throw new TypeError("Expected \"".concat(token.name, "\" to be ").concat(typeOfMessage));
        }
        return path;
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    const path = toPath(sanitizedParams);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/.pnpm/astro@4.10.2_typescript@5.4.5/node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/loadplaylist/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/loadplaylist\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"loadplaylist","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/loadplaylist/[id].ts","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/logout","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/logout\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"logout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/logout.ts","pathname":"/api/logout","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/playlists/[playlist]/[offset]/tracks","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/playlists\\/([^/]+?)\\/([^/]+?)\\/tracks\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"playlists","dynamic":false,"spread":false}],[{"content":"playlist","dynamic":true,"spread":false}],[{"content":"offset","dynamic":true,"spread":false}],[{"content":"tracks","dynamic":false,"spread":false}]],"params":["playlist","offset"],"component":"src/pages/api/playlists/[playlist]/[offset]/tracks.ts","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/save/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/save\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"save","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/save/[id].ts","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"document.forms[0].addEventListener(\"submit\",async e=>{e.preventDefault();const t=e.target;await fetch(t.action,{method:t.method,body:new FormData(t)}),window.location.href=\"/login\"});\n"}],"styles":[{"type":"inline","content":"[data-astro-cid-gd6od7ox]{box-sizing:border-box;font-family:Helvetica,Arial,sans-serif}.square[data-astro-cid-gd6od7ox]{object-fit:cover}.title[data-astro-cid-gd6od7ox]{flex-grow:1}.user[data-astro-cid-gd6od7ox]{display:flex;justify-content:space-around;align-items:center;gap:1rem}nav[data-astro-cid-gd6od7ox]{min-width:100%;padding:0 2rem;display:flex;background-color:#eee;justify-content:space-around;align-items:center}\n.main-list[data-astro-cid-ncakswfw]{display:flex;flex-direction:column;gap:1.5rem}.playlist[data-astro-cid-ncakswfw]{display:flex;align-items:center;background-color:#f0f8ff;gap:.7rem}\n"}],"routeData":{"route":"/createplaylist","isIndex":true,"type":"page","pattern":"^\\/createplaylist\\/?$","segments":[[{"content":"createplaylist","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/createplaylist/index.astro","pathname":"/createplaylist","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/fetchplaylist","isIndex":false,"type":"endpoint","pattern":"^\\/fetchPlaylist\\/?$","segments":[[{"content":"fetchPlaylist","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/fetchPlaylist.ts","pathname":"/fetchPlaylist","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/login/spotify/callback","isIndex":false,"type":"endpoint","pattern":"^\\/login\\/spotify\\/callback\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}],[{"content":"spotify","dynamic":false,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login/spotify/callback.ts","pathname":"/login/spotify/callback","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/login/spotify","isIndex":true,"type":"endpoint","pattern":"^\\/login\\/spotify\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}],[{"content":"spotify","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login/spotify/index.ts","pathname":"/login/spotify","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/login","isIndex":true,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login/index.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"let y;const C=t=>{const s=Math.floor(t/6e4),n=Math.floor(t%6e4/1e3);return`${s}:${n.toString().padStart(2,\"0\")}`},v=t=>{const s=document.createElement(\"div\");s.className=\"playlist\";const n=document.createElement(\"div\");n.className=\"desc\",s.appendChild(n);const e=document.createElement(\"div\");e.className=\"track-cluster\",n.appendChild(e);const a=document.createElement(\"img\");a.src=t.track.album?.images[2]?.url?t.track.album.images[2].url:\"https://kagi.com/proxy/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg?c=l0oPx0FvhjhG2vnK29uE37OLQc-WdefmvQp_UcLKL29LDJEkeYiVhvf2KWXWGustLbBUuFUVTrSjFGd_d3GuBmPOffiZmHemGi6a-Uj_O0D_Dbnq01_FkRla6Ecmv6akMJ1xYVkRKnmiEtwwYeItBw%3D%3D\",a.alt=\"\",a.width=50,a.height=50,e.appendChild(a);const o=document.createElement(\"p\");o.textContent=t.track.name,e.appendChild(o);const p=document.createElement(\"p\");p.textContent=t.track.artists.map(k=>k.name).join(\", \"),n.appendChild(p);const u=document.createElement(\"p\");u.textContent=t.added_by.id,n.appendChild(u);const g=document.createElement(\"p\");return g.textContent=C(t.track.duration_ms),n.appendChild(g),s};let i=0,d=!1,r=!1,c=0;const f=document.getElementById(\"song-count\"),l=document.getElementById(\"fetch-indicator\"),b=document.querySelector(\"playlist-id\"),h=document.getElementById(\"post-playlist-button\"),E=(t=0,s=!1,n=!1)=>{!d&&!n?(console.log(\"showing loading...\"),l&&(l.style.display=\"block\",l.classList.add(\"loading-fade\")),d=!0,fetch(`/api/playlists/${y}/${i}/tracks/`).then(e=>(console.log(e),e.json())).then(e=>{e.items.forEach(o=>{o.track!==null&&b?.appendChild(v(o))}),i=i+100;const a=i;d=!1,f&&(c=c+e.items.length,f.innerText=`${c} songs`),E(a,!1,e.items.length<100)}).catch(e=>{console.error(\"Error:\",e)}),m.textContent=x):l&&(l.innerText=\"Loaded!\",h&&h.classList.remove(\"disabled\"),setTimeout(()=>{l.classList.remove(\"loading-fade\"),l.style.display=\"none\"},1e3))};document.addEventListener(\"DOMContentLoaded\",t=>{E(0,!1,r)});const m=document.createElement(\"style\"),x=`\n  * {\n    font-family: Helvetica, sans-serif;\n  }\n  .main-list {\n    display: flex;\n    flex-direction: column;\n    gap: 1rem;\n  }\n  .header #track-name {\n    margin-left: 1rem;\n  }\n  .track-cluster {\n    display: flex;\n    gap: 1rem;\n  }\n  .playlist {\n    height: 5rem;\n  }\n  .playlist img {\n    margin-left: 1rem;\n  }\n  .desc {\n    text-overflow: ellipsis;\n    width: 100%;\n    display: grid;\n    grid-template-columns: 3fr 2fr 2fr 1fr;\n    grid-template-rows: 1fr;\n    gap: 1rem;\n  }\n  .desc p {\n    text-overflow: ellipsis;\n    text-align: start;\n  }\n  .playlist {\n    display: flex;\n    align-items: center;\n    gap: 3.7rem;\n    border-top: 1px solid #ececec;\n  }\n  .playlist:nth-of-type(even) {\n    background-color: #fafafb;\n  }\n  .playlist:hover {\n    background-color: #ebebeb;\n    transition: all 0.2s ease-out;\n  }\n  #loading-indicator {\n    margin: 0 auto;\n    background-color: gray;\n    padding: 10rem 10rem;\n    display: none;\n  }\n  `;class L extends HTMLElement{constructor(){super(),document.head.appendChild(m),console.log(this.dataset.allFetched),m.textContent=x,y=this.dataset.id?this.dataset.id:\"\",r=this.dataset.allFetched===\"yes\",console.log(`alltracks: ${r}`)}}customElements.define(\"playlist-id\",L);\n"}],"styles":[{"type":"inline","content":"[data-astro-cid-skzc3fze]{font-family:Helvetica,sans-serif}.disabled[data-astro-cid-skzc3fze]{opacity:.5;pointer-events:none;cursor:not-allowed}#count-cluster[data-astro-cid-skzc3fze]{display:flex;align-items:center;gap:1rem}.main-list[data-astro-cid-skzc3fze]{display:flex;flex-direction:column;gap:1rem}.loading-fade[data-astro-cid-skzc3fze]{color:gray}#track-header[data-astro-cid-skzc3fze]{margin-left:1rem}.desc[data-astro-cid-skzc3fze] p[data-astro-cid-skzc3fze],#track-name[data-astro-cid-skzc3fze]{width:100%;overflow:hidden;text-overflow:ellipsis}.track-cluster[data-astro-cid-skzc3fze]{display:flex;gap:1rem;overflow:hidden;text-overflow:ellipsis}.playlist[data-astro-cid-skzc3fze]{height:5rem}.playlist[data-astro-cid-skzc3fze] img[data-astro-cid-skzc3fze]{margin-left:1rem}.desc[data-astro-cid-skzc3fze]{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%;display:grid;grid-template-columns:3fr 2fr 2fr 1fr;grid-template-rows:1fr;gap:1rem}.desc[data-astro-cid-skzc3fze] p[data-astro-cid-skzc3fze]{text-overflow:ellipsis;text-align:start}.playlist[data-astro-cid-skzc3fze]{display:flex;align-items:center;gap:3.7rem;border-top:1px solid #ececec}.playlist[data-astro-cid-skzc3fze]:nth-of-type(2n){background-color:#fafafb}.playlist[data-astro-cid-skzc3fze]:hover{background-color:#ebebeb;transition:all .2s ease-out}.playlist-header[data-astro-cid-rlilkne5]{margin:3rem 1rem;padding-bottom:2rem;display:flex;align-items:center;gap:3rem;background:#000;background:linear-gradient(347deg,#0000002b,#fff 58%)}\n"}],"routeData":{"route":"/playlists/[id]","isIndex":false,"type":"page","pattern":"^\\/playlists\\/([^/]+?)\\/?$","segments":[[{"content":"playlists","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/playlists/[id].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"document.forms[0].addEventListener(\"submit\",async e=>{e.preventDefault();const t=e.target;await fetch(t.action,{method:t.method,body:new FormData(t)}),window.location.href=\"/login\"});\n"}],"styles":[{"type":"inline","content":"[data-astro-cid-j7pv25f6]{box-sizing:border-box;font-family:Helvetica,Arial,sans-serif}.square[data-astro-cid-j7pv25f6]{object-fit:cover}.title[data-astro-cid-j7pv25f6]{flex-grow:1}.user[data-astro-cid-j7pv25f6]{display:flex;justify-content:space-around;align-items:center;gap:1rem}nav[data-astro-cid-j7pv25f6]{min-width:100%;padding:0 2rem;display:flex;background-color:#eee;justify-content:space-around;align-items:center}\n.main-list[data-astro-cid-ncakswfw]{display:flex;flex-direction:column;gap:1.5rem}.playlist[data-astro-cid-ncakswfw]{display:flex;align-items:center;background-color:#f0f8ff;gap:.7rem}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/maat/development/spot-rating/src/pages/playlists/[id].astro",{"propagation":"none","containsHead":true}],["/Users/maat/development/spot-rating/src/pages/createplaylist/index.astro",{"propagation":"none","containsHead":true}],["/Users/maat/development/spot-rating/src/pages/login/index.astro",{"propagation":"none","containsHead":true}],["/Users/maat/development/spot-rating/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","/src/pages/login/spotify/callback.ts":"chunks/pages/callback_xAcCRjpF.mjs","/src/pages/fetchPlaylist.ts":"chunks/pages/fetchPlaylist_DlABH2bp.mjs","/node_modules/.pnpm/astro@4.10.2_typescript@5.4.5/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_DD7W-YfZ.mjs","/src/pages/login/spotify/index.ts":"chunks/pages/index_Dk0utuKG.mjs","/src/pages/api/logout.ts":"chunks/pages/logout_BQmtN4Re.mjs","/src/pages/api/playlists/[playlist]/[offset]/tracks.ts":"chunks/pages/tracks_BIxinAf8.mjs","\u0000@astrojs-manifest":"manifest_BFfn3A1t.mjs","\u0000@astro-page:node_modules/.pnpm/astro@4.10.2_typescript@5.4.5/node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_CK8Dywux.mjs","\u0000@astro-page:src/pages/api/loadplaylist/[id]@_@ts":"chunks/_id__BAX2wcHG.mjs","\u0000@astro-page:src/pages/api/logout@_@ts":"chunks/logout_CyMcJGsY.mjs","\u0000@astro-page:src/pages/api/playlists/[playlist]/[offset]/tracks@_@ts":"chunks/tracks_B_CAmkKf.mjs","\u0000@astro-page:src/pages/api/save/[id]@_@ts":"chunks/_id__B7QsoJIi.mjs","\u0000@astro-page:src/pages/createplaylist/index@_@astro":"chunks/index_BHq5ZNFj.mjs","\u0000@astro-page:src/pages/fetchPlaylist@_@ts":"chunks/fetchPlaylist_D8wYLf_3.mjs","\u0000@astro-page:src/pages/login/spotify/callback@_@ts":"chunks/callback_sddiJ5bM.mjs","\u0000@astro-page:src/pages/login/spotify/index@_@ts":"chunks/index_Dfrq4V0B.mjs","\u0000@astro-page:src/pages/login/index@_@astro":"chunks/index_BiFsC45E.mjs","\u0000@astro-page:src/pages/playlists/[id]@_@astro":"chunks/_id__DN6tfx9L.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_CTcI1h0T.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.DFDDPSok.js","/astro/hoisted.js?q=1":"_astro/hoisted.LLMaN7dT.js","/astro/hoisted.js?q=2":"_astro/hoisted.D4JSd48x.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/favicon.svg"],"buildFormat":"directory","checkOrigin":true,"rewritingEnabled":false,"experimentalEnvGetSecretEnabled":false});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest };
