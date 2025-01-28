import { e as error, f as fail, r as redirect } from "../../chunks/index.js";
const load = async ({ locals: { supabase } }) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { user: null };
  }
  const { data: profile, error: profileError } = await supabase.from("Profiles").select("*").eq("id", session.user.id).single();
  if (profileError && profileError.code !== "PGRST116") {
    throw error(500, "Error fetching profile");
  }
  return { user: session.user, profile };
};
const actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const isSignUp = formData.get("isSignUp") === "true";
    if (isSignUp) {
      const { error: error2 } = await supabase.auth.signUp({
        email,
        password
      });
      if (error2) {
        return fail(400, { error: error2.message });
      }
      return { success: true };
    } else {
      const { error: error2 } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error2) {
        return fail(400, { error: error2.message });
      }
      throw redirect(303, "/dashboard");
    }
  }
};
export {
  actions,
  load
};
