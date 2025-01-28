import { c as create_ssr_component, a as subscribe } from "../../../../chunks/ssr.js";
import "clsx";
import "dequal";
import "../../../../chunks/index3.js";
import "../../../../chunks/client.js";
import "../../../../chunks/supabase.js";
import { h as habitStore } from "../../../../chunks/habits.js";
import "../../../../chunks/auth.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_habitStore;
  $$unsubscribe_habitStore = subscribe(habitStore, (value) => value);
  $$unsubscribe_habitStore();
  return `<div class="container mx-auto py-6">${`<div class="text-center" data-svelte-h="svelte-19x75p3"><p>Loading dashboard...</p></div>`}</div>`;
});
export {
  Page as default
};
