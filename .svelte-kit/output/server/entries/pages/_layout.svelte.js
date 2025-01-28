import { c as create_ssr_component, v as validate_component, a as subscribe } from "../../chunks/ssr.js";
import "../../chunks/client.js";
import { s as session } from "../../chunks/auth.js";
import "../../chunks/supabase.js";
import { I as Icon } from "../../chunks/Icon.js";
import { d as derived, w as writable } from "../../chunks/index2.js";
import "../../chunks/index3.js";
import { B as Button } from "../../chunks/button.js";
import { p as page } from "../../chunks/stores.js";
const Sun = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "4" }],
    ["path", { "d": "M12 2v2" }],
    ["path", { "d": "M12 20v2" }],
    ["path", { "d": "m4.93 4.93 1.41 1.41" }],
    ["path", { "d": "m17.66 17.66 1.41 1.41" }],
    ["path", { "d": "M2 12h2" }],
    ["path", { "d": "M20 12h2" }],
    ["path", { "d": "m6.34 17.66-1.41 1.41" }],
    ["path", { "d": "m19.07 4.93-1.41 1.41" }]
  ];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "sun" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Moon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [
    [
      "path",
      {
        "d": "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
      }
    ]
  ];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "moon" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
let timeoutAction;
let timeoutEnable;
function withoutTransition(action) {
  if (typeof document === "undefined")
    return;
  clearTimeout(timeoutAction);
  clearTimeout(timeoutEnable);
  const style = document.createElement("style");
  const css2 = document.createTextNode(`* {
     -webkit-transition: none !important;
     -moz-transition: none !important;
     -o-transition: none !important;
     -ms-transition: none !important;
     transition: none !important;
  }`);
  style.appendChild(css2);
  const disable = () => document.head.appendChild(style);
  const enable = () => document.head.removeChild(style);
  if (typeof window.getComputedStyle !== "undefined") {
    disable();
    action();
    window.getComputedStyle(style).opacity;
    enable();
    return;
  }
  if (typeof window.requestAnimationFrame !== "undefined") {
    disable();
    action();
    window.requestAnimationFrame(enable);
    return;
  }
  disable();
  timeoutAction = window.setTimeout(() => {
    action();
    timeoutEnable = window.setTimeout(enable, 120);
  }, 120);
}
const noopStorage = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getItem: (_key) => null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setItem: (_key, _value) => {
  }
};
const isBrowser = typeof document !== "undefined";
const modes = ["dark", "light", "system"];
const localStorageKey = "mode-watcher-mode";
const userPrefersMode = createUserPrefersMode();
const systemPrefersMode = createSystemMode();
const themeColors = writable(void 0);
const disableTransitions = writable(true);
createDerivedMode();
function createUserPrefersMode() {
  const defaultValue = "system";
  const storage = isBrowser ? localStorage : noopStorage;
  const initialValue = storage.getItem(localStorageKey);
  let value = isValidMode(initialValue) ? initialValue : defaultValue;
  const { subscribe: subscribe2, set: _set } = writable(value, () => {
    if (!isBrowser)
      return;
    const handler = (e) => {
      if (e.key !== localStorageKey)
        return;
      const newValue = e.newValue;
      if (isValidMode(newValue)) {
        _set(value = newValue);
      } else {
        _set(value = defaultValue);
      }
    };
    addEventListener("storage", handler);
    return () => removeEventListener("storage", handler);
  });
  function set(v) {
    _set(value = v);
    storage.setItem(localStorageKey, value);
  }
  return {
    subscribe: subscribe2,
    set
  };
}
function createSystemMode() {
  const defaultValue = void 0;
  let track = true;
  const { subscribe: subscribe2, set } = writable(defaultValue, () => {
    if (!isBrowser)
      return;
    const handler = (e) => {
      if (!track)
        return;
      set(e.matches ? "light" : "dark");
    };
    const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
    mediaQueryState.addEventListener("change", handler);
    return () => mediaQueryState.removeEventListener("change", handler);
  });
  function query() {
    if (!isBrowser)
      return;
    const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
    set(mediaQueryState.matches ? "light" : "dark");
  }
  function tracking(active) {
    track = active;
  }
  return {
    subscribe: subscribe2,
    query,
    tracking
  };
}
function createDerivedMode() {
  const { subscribe: subscribe2 } = derived([userPrefersMode, systemPrefersMode, themeColors, disableTransitions], ([$userPrefersMode, $systemPrefersMode, $themeColors, $disableTransitions]) => {
    if (!isBrowser)
      return void 0;
    const derivedMode = $userPrefersMode === "system" ? $systemPrefersMode : $userPrefersMode;
    function update() {
      const htmlEl = document.documentElement;
      const themeColorEl = document.querySelector('meta[name="theme-color"]');
      if (derivedMode === "light") {
        htmlEl.classList.remove("dark");
        htmlEl.style.colorScheme = "light";
        if (themeColorEl && $themeColors) {
          themeColorEl.setAttribute("content", $themeColors.light);
        }
      } else {
        htmlEl.classList.add("dark");
        htmlEl.style.colorScheme = "dark";
        if (themeColorEl && $themeColors) {
          themeColorEl.setAttribute("content", $themeColors.dark);
        }
      }
    }
    if ($disableTransitions) {
      withoutTransition(update);
    } else {
      update();
    }
    return derivedMode;
  });
  return {
    subscribe: subscribe2
  };
}
function isValidMode(value) {
  if (typeof value !== "string")
    return false;
  return modes.includes(value);
}
const ThemeToggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Button, "Button").$$render($$result, { variant: "outline", size: "icon" }, {}, {
    default: () => {
      return `${validate_component(Sun, "Sun").$$render(
        $$result,
        {
          class: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        },
        {},
        {}
      )} ${validate_component(Moon, "Moon").$$render(
        $$result,
        {
          class: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        },
        {},
        {}
      )} <span class="sr-only" data-svelte-h="svelte-ntgole">Toggle theme</span>`;
    }
  })}`;
});
const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  $$unsubscribe_session();
  return `<nav class="flex justify-between p-4 bg-background"><div class="flex gap-4 items-center">${validate_component(Button, "Button").$$render(
    $$result,
    {
      variant: "ghost",
      href: "/",
      class: "font-bold"
    },
    {},
    {
      default: () => {
        return `LOGO`;
      }
    }
  )} ${$session ? `${validate_component(Button, "Button").$$render($$result, { variant: "ghost", href: "/dashboard" }, {}, {
    default: () => {
      return `Dashboard`;
    }
  })} ${validate_component(Button, "Button").$$render($$result, { variant: "ghost", href: "/profile" }, {}, {
    default: () => {
      return `Profile`;
    }
  })}` : ``}</div> <div class="flex gap-4 items-center">${validate_component(ThemeToggle, "ThemeToggle").$$render($$result, {}, {}, {})} ${``} ${$session ? `${validate_component(Button, "Button").$$render($$result, { variant: "ghost" }, {}, {
    default: () => {
      return `Logout`;
    }
  })}` : `${validate_component(Button, "Button").$$render($$result, { variant: "ghost", href: "/auth/login" }, {}, {
    default: () => {
      return `Login`;
    }
  })}`}</div></nav>`;
});
const css = {
  code: "footer.svelte-16qhkof.svelte-16qhkof{display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;background-color:#f8f9fa;border-top:1px solid #dee2e6;position:relative;bottom:0;width:100%}.left-section.svelte-16qhkof.svelte-16qhkof{display:flex;flex-direction:column;gap:0.5rem}.left-section.svelte-16qhkof p.svelte-16qhkof{margin:0;font-size:0.9rem}.left-section.svelte-16qhkof a.svelte-16qhkof{color:#6c757d;text-decoration:none;font-size:0.8rem}.navigation.svelte-16qhkof.svelte-16qhkof{display:flex;gap:2rem}.navigation.svelte-16qhkof a.svelte-16qhkof{color:#495057;text-decoration:none;font-size:0.9rem}.navigation.svelte-16qhkof a.svelte-16qhkof:hover{color:#212529}.right-section.svelte-16qhkof.svelte-16qhkof{display:flex;align-items:center}.logo.svelte-16qhkof.svelte-16qhkof{font-size:1.5rem;font-weight:bold;color:#495057}",
  map: '{"version":3,"file":"Footer.svelte","sources":["Footer.svelte"],"sourcesContent":["<footer>\\n  <div class=\\"left-section\\">\\n    <p>© 2024 The Product Viking</p>\\n    <a href=\\"https://theproductviking.com\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">\\n      theproductviking.com\\n    </a>\\n  </div>\\n  \\n  <nav class=\\"navigation\\">\\n    <a href=\\"/\\">Home</a>\\n    <a href=\\"/habits\\">Habits</a>\\n    <a href=\\"/statistics\\">Statistics</a>\\n    <a href=\\"/settings\\">Settings</a>\\n  </nav>\\n\\n  <div class=\\"right-section\\">\\n    <div class=\\"logo\\">\\n      <!-- Logo placeholder -->\\n      TPV\\n    </div>\\n  </div>\\n</footer>\\n\\n<style>\\n  footer {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: center;\\n    padding: 1rem 2rem;\\n    background-color: #f8f9fa;\\n    border-top: 1px solid #dee2e6;\\n    position: relative;\\n    bottom: 0;\\n    width: 100%;\\n  }\\n\\n  .left-section {\\n    display: flex;\\n    flex-direction: column;\\n    gap: 0.5rem;\\n  }\\n\\n  .left-section p {\\n    margin: 0;\\n    font-size: 0.9rem;\\n  }\\n\\n  .left-section a {\\n    color: #6c757d;\\n    text-decoration: none;\\n    font-size: 0.8rem;\\n  }\\n\\n  .navigation {\\n    display: flex;\\n    gap: 2rem;\\n  }\\n\\n  .navigation a {\\n    color: #495057;\\n    text-decoration: none;\\n    font-size: 0.9rem;\\n  }\\n\\n  .navigation a:hover {\\n    color: #212529;\\n  }\\n\\n  .right-section {\\n    display: flex;\\n    align-items: center;\\n  }\\n\\n  .logo {\\n    font-size: 1.5rem;\\n    font-weight: bold;\\n    color: #495057;\\n  }\\n</style>"],"names":[],"mappings":"AAwBE,oCAAO,CACL,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,gBAAgB,CAAE,OAAO,CACzB,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CAC7B,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IACT,CAEA,2CAAc,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,MACP,CAEA,4BAAa,CAAC,gBAAE,CACd,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,MACb,CAEA,4BAAa,CAAC,gBAAE,CACd,KAAK,CAAE,OAAO,CACd,eAAe,CAAE,IAAI,CACrB,SAAS,CAAE,MACb,CAEA,yCAAY,CACV,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IACP,CAEA,0BAAW,CAAC,gBAAE,CACZ,KAAK,CAAE,OAAO,CACd,eAAe,CAAE,IAAI,CACrB,SAAS,CAAE,MACb,CAEA,0BAAW,CAAC,gBAAC,MAAO,CAClB,KAAK,CAAE,OACT,CAEA,4CAAe,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MACf,CAEA,mCAAM,CACJ,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,IAAI,CACjB,KAAK,CAAE,OACT"}'
};
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<footer class="svelte-16qhkof" data-svelte-h="svelte-hgsx0z"><div class="left-section svelte-16qhkof"><p class="svelte-16qhkof">© 2024 The Product Viking</p> <a href="https://theproductviking.com" target="_blank" rel="noopener noreferrer" class="svelte-16qhkof">theproductviking.com</a></div> <nav class="navigation svelte-16qhkof"><a href="/" class="svelte-16qhkof">Home</a> <a href="/habits" class="svelte-16qhkof">Habits</a> <a href="/statistics" class="svelte-16qhkof">Statistics</a> <a href="/settings" class="svelte-16qhkof">Settings</a></nav> <div class="right-section svelte-16qhkof"><div class="logo svelte-16qhkof">
      TPV</div></div> </footer>`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $page.data.session;
  {
    if ($page.data.session) {
      $page.data.session;
      session.set($page.data.session);
    }
  }
  $$unsubscribe_page();
  return `<div class="flex flex-col min-h-screen">${validate_component(Navbar, "Navbar").$$render($$result, {}, {}, {})} <main class="flex-grow">${slots.default ? slots.default({}) : ``}</main> ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Layout as default
};
