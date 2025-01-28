import { e as error, f as fail, r as redirect } from "../../../../chunks/index.js";
const load = async ({ locals: { supabase } }) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    throw error(401, "Unauthorized");
  }
  const { data: profile, error: profileError } = await supabase.from("Profiles").select("*").eq("user_auth_id", user.id).single();
  if (profileError) {
    throw error(500, "Error fetching profile");
  }
  return { profile, user };
};
const actions = {
  updateProfile: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) return fail(401, { error: "Unauthorized" });
    const formData = await request.formData();
    const { error: updateError } = await supabase.from("Profiles").update({
      user_name: formData.get("userName"),
      location: formData.get("location"),
      description: formData.get("description")
    }).eq("user_auth_id", session.user.id);
    if (updateError) return fail(500, { error: updateError.message });
    return { success: true };
  },
  updateEmail: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) return fail(401, { error: "Unauthorized" });
    const formData = await request.formData();
    const newEmail = formData.get("email");
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail
    });
    if (updateError) return fail(500, { error: updateError.message });
    return { success: true, message: "Verification email sent" };
  },
  updatePassword: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) return fail(401, { error: "Unauthorized" });
    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");
    if (newPassword !== confirmPassword) {
      return fail(400, { error: "Passwords do not match" });
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword
    });
    if (signInError) return fail(400, { error: "Current password is incorrect" });
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (updateError) return fail(500, { error: updateError.message });
    return { success: true };
  },
  deleteProfile: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) return fail(401, { error: "Unauthorized" });
    const formData = await request.formData();
    const confirmation = formData.get("deleteConfirmation");
    if (confirmation !== "delete me") {
      return fail(400, { error: "Invalid confirmation text" });
    }
    const { error: updateError } = await supabase.from("Profiles").update({
      is_active: false
    }).eq("user_auth_id", session.user.id);
    if (updateError) return fail(500, { error: updateError.message });
    await supabase.auth.signOut();
    throw redirect(303, "/auth/login");
  }
};
export {
  actions,
  load
};
