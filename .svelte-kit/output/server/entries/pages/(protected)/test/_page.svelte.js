import { c as create_ssr_component, a as subscribe } from "../../../../chunks/ssr.js";
import { g as goalStore } from "../../../../chunks/goals.js";
import { h as habitStore } from "../../../../chunks/habits.js";
import "../../../../chunks/supabase.js";
import { s as session } from "../../../../chunks/auth.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_goalStore;
  let $$unsubscribe_habitStore;
  let $$unsubscribe_session;
  $$unsubscribe_goalStore = subscribe(goalStore, (value) => value);
  $$unsubscribe_habitStore = subscribe(habitStore, (value) => value);
  $$unsubscribe_session = subscribe(session, (value) => value);
  $$unsubscribe_goalStore();
  $$unsubscribe_habitStore();
  $$unsubscribe_session();
  return `<div class="container mx-auto py-6"><h1 class="text-2xl mb-4" data-svelte-h="svelte-7ugj8e">Test Page</h1> ${`${`<div class="p-4 bg-yellow-100 mb-4" data-svelte-h="svelte-ek9fro">Loading...</div>`}`}</div>`;
});
export {
  Page as default
};
