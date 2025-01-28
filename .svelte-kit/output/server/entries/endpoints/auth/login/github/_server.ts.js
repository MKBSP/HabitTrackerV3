import { r as redirect } from "../../../../../chunks/index.js";
const GET = async ({ locals: { supabase }, url }) => {
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: url.origin + "/auth/callback"
    }
  });
  if (data.url) {
    redirect(307, data.url);
  }
  redirect(307, "/auth/error");
};
export {
  GET
};
