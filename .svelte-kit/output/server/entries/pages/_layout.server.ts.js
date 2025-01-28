import { r as redirect } from "../../chunks/index.js";
const load = async ({ locals, url }) => {
  const session = await locals.getSession();
  const isProtectedRoute = url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/goals");
  if (isProtectedRoute && !session) {
    throw redirect(303, "/auth/login");
  }
  return { session };
};
export {
  load
};
