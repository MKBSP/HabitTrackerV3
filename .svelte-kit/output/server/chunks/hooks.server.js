import { createServerClient } from "@supabase/ssr";
import { P as PUBLIC_SUPABASE_URL, a as PUBLIC_SUPABASE_ANON_KEY } from "./public.js";
const handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => event.cookies.get(key),
      set: (key, value, options) => {
        event.cookies.set(key, value, { ...options, path: "/" });
      },
      remove: (key, options) => {
        event.cookies.delete(key, { ...options, path: "/" });
      }
    }
  });
  event.locals.getSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    return session;
  };
  return resolve(event);
};
export {
  handle
};
