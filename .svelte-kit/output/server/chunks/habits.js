import { d as derived, w as writable } from "./index2.js";
import { s as supabase } from "./supabase.js";
import { u as get_store_value } from "./ssr.js";
async function fetchCompletions(habitIds, dateRange) {
  console.log("=== Fetching Completions ===", { habitIds, dateRange });
  try {
    const { data: completions, error } = await supabase.from("Habit_Completion").select("*").in("user_habit_id", habitIds).gte("completed_at", dateRange.start.split("T")[0]).lte("completed_at", dateRange.end.split("T")[0]).eq("completed", true).order("created_at", { ascending: false });
    if (error) throw error;
    return completions || [];
  } catch (error) {
    console.error("Error fetching completions:", error);
    return [];
  }
}
async function fetchHabitsWithStatus(userId, date) {
  console.log("=== Fetching Habits with Status ===", { userId, date });
  try {
    const selectedDate = new Date(date);
    const { data: habits, error } = await supabase.from("User_Habits").select(`
                id,
                created_at,
                is_active,
                deleted_at,
                Habits (
                    id,
                    name,
                    description
                )
            `).eq("user_id", userId).eq("is_active", true).is("deleted_at", null).lte("created_at", selectedDate.toISOString());
    if (error) throw error;
    console.log("=== Fetched Habits ===", habits);
    const habitIds = habits.map((h) => h.id);
    const completions = await fetchCompletions(habitIds, {
      start: date,
      end: date
    });
    return habits.map((habit) => ({
      id: habit.id,
      title: habit.Habits.name,
      description: habit.Habits.description,
      created_at: habit.created_at,
      deleted_at: habit.deleted_at,
      isCompleted: completions.some(
        (c) => c.user_habit_id === habit.id && c.completed
      ),
      completions: completions.filter((c) => c.user_habit_id === habit.id)
    }));
  } catch (error) {
    console.error("Error fetching habits with status:", error);
    throw error;
  }
}
function saveToStorage(state) {
}
function loadFromStorage() {
  return null;
}
function createHabitStore() {
  const stored = loadFromStorage();
  const initialState = stored || {
    habits: [],
    loading: false,
    error: null,
    currentDate: (/* @__PURE__ */ new Date()).toISOString(),
    initialized: false
  };
  const { subscribe, set, update } = writable(initialState);
  async function refreshHabitData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      const { data: profile } = await supabase.from("Profiles").select("id").eq("user_auth_id", user.id).single();
      if (!profile) throw new Error("Profile not found");
      const { data: userHabits, error } = await supabase.from("User_Habits").select(`
                    id,
                    habit_id,
                    user_id,
                    Habits (
                        id,
                        title,
                        description
                    ),
                    Habit_Completion (
                        completed,
                        completed_at,
                        created_at
                    )
                `).eq("user_id", profile.id).eq("is_active", true);
      if (error) throw error;
      const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const processedHabits = userHabits?.map((uh) => ({
        id: uh.id,
        // Use user_habit_id as the main id
        habit_id: uh.habit_id,
        title: uh.Habits.title,
        description: uh.Habits.description,
        isCompleted: uh.Habit_Completion?.some(
          (c) => c.completed_at === currentDate && c.completed
        ) || false
      })) || [];
      const currentState = get_store_value({ subscribe });
      const newState = {
        ...currentState,
        habits: processedHabits,
        error: null
      };
      updateState(newState);
    } catch (e) {
      console.error("Error refreshing habit data:", e);
      updateState({ error: e.message });
    }
  }
  function updateState(newState) {
    update((state) => {
      const updatedState = { ...state, ...newState };
      return updatedState;
    });
  }
  const store = {
    subscribe,
    habits: derived({ subscribe }, ($state) => $state.habits),
    currentDate: derived({ subscribe }, ($state) => $state.currentDate),
    initialized: derived({ subscribe }, ($state) => $state.initialized),
    loading: derived({ subscribe }, ($state) => $state.loading),
    error: derived({ subscribe }, ($state) => $state.error),
    async initialize() {
      return false;
    },
    async setCurrentDate(date, showLoading = true) {
      try {
        if (showLoading) {
          updateState({ loading: true });
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");
        const { data: profile } = await supabase.from("Profiles").select("id").eq("user_auth_id", user.id).single();
        if (!profile) throw new Error("No profile found");
        const habits = await fetchHabitsWithStatus(profile.id, date);
        updateState({
          currentDate: date,
          habits,
          loading: false
        });
      } catch (e) {
        console.error("[HabitStore] Error:", e);
        updateState({ error: e.message, loading: false });
      }
    },
    async toggleComplete(habitId, completed) {
      const previousState2 = get_store_value({ subscribe });
      try {
        const newState = {
          ...previousState2,
          habits: previousState2.habits.map(
            (h) => h.id === habitId ? { ...h, isCompleted: completed } : h
          )
        };
        updateState(newState);
        const { error } = await supabase.from("Habit_Completion").insert({
          user_habit_id: habitId,
          completed_at: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          completed,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (error) throw error;
        saveToStorage(newState);
        await refreshHabitData();
      } catch (e) {
        console.error("[HabitStore] Toggle error:", e);
        updateState(previousState2);
      }
    },
    async deleteHabit(habitId) {
      try {
        const { data: habit } = await supabase.from("User_Habits").select("*").eq("id", habitId).single();
        if (!habit) throw new Error("Habit not found");
        const { error } = await supabase.from("User_Habits").update({
          is_active: false,
          deleted_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", habitId);
        if (error) throw error;
        updateState({
          habits: previousState.habits.filter((h) => h.id !== habitId)
        });
        return true;
      } catch (e) {
        console.error("[HabitStore] Error:", e);
        updateState({ error: e.message });
        return false;
      }
    },
    async findDuplicates() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");
        const { data: habits } = await supabase.from("User_Habits").select(`
                        id,
                        habit_id,
                        created_at,
                        is_active,
                        Habits (
                            id,
                            name
                        )
                    `).eq("user_id", user.id);
        if (!habits) return;
        const grouped = habits.reduce((acc, habit) => {
          if (!acc[habit.habit_id]) {
            acc[habit.habit_id] = [];
          }
          acc[habit.habit_id].push({
            id: habit.id,
            created_at: habit.created_at,
            is_active: habit.is_active,
            habit_name: habit.Habits.name
          });
          return acc;
        }, {});
        const duplicates = Object.entries(grouped).filter(([_, entries]) => entries.length > 1).map(([habit_id, entries]) => ({
          habit_id: Number(habit_id),
          entries
        }));
        console.log("=== Duplicate Habits Found ===", duplicates);
        return duplicates;
      } catch (error) {
        console.error("Error finding duplicates:", error);
        return null;
      }
    },
    // Add new method to get completion status
    getCompletionStatus(habitId, date) {
      const state = get_store_value({ subscribe });
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return false;
      return habit.isCompleted;
    },
    // Add method to get completions for date range
    async getCompletionsForRange(habitIds, dateRange) {
      const state = get_store_value({ subscribe });
      return state.habits.filter((h) => habitIds.includes(h.id)).map((h) => ({
        user_habit_id: h.id,
        completed: h.isCompleted,
        completed_at: state.currentDate
      }));
    }
  };
  return store;
}
const habitStore = createHabitStore();
export {
  habitStore as h
};
