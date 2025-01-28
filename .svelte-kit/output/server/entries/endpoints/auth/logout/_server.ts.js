import { r as redirect } from "../../../../chunks/index.js";
const GET = async ({ locals: { supabase } }) => {
  await supabase.auth.signOut();
  redirect(307, "/");
};
export {
  GET
};
