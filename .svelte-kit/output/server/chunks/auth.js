import { w as writable } from "./index2.js";
import { createBrowserClient } from "@supabase/ssr";
import { P as PUBLIC_SUPABASE_URL, a as PUBLIC_SUPABASE_ANON_KEY } from "./public.js";
const session = writable(null);
createBrowserClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);
export {
  session as s
};
