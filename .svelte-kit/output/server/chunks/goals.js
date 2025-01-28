import { w as writable } from "./index2.js";
import { s as supabase } from "./supabase.js";
import "./habits.js";
function createGoalStore() {
  const { subscribe, set, update } = writable({
    goals: [],
    loading: false,
    error: null,
    completionsCache: /* @__PURE__ */ new Map()
  });
  async function fetchCompletionsForKpi(kpi, dateRange) {
    const startStr = dateRange.start.toISOString().split("T")[0];
    const endStr = dateRange.end.toISOString().split("T")[0];
    console.log("=== KPI Query Start ===", {
      kpiName: kpi.name,
      target: kpi.target,
      period: kpi.period,
      dateRange: { startStr, endStr }
    });
    const { data: completions, error } = await supabase.from("Habit_Completion").select("*").in("user_habit_id", kpi.habit_ids || []).gte("completed_at", startStr).lte("completed_at", endStr).order("completed_at", { ascending: false });
    if (error) {
      console.error("Fetch error:", error);
      return 0;
    }
    console.log("=== Raw Completions ===", completions);
    const totalCompletions = completions.filter((c) => c.completed).length;
    console.log("=== KPI Progress Calculation ===", {
      kpiName: kpi.name,
      totalCompletions,
      target: kpi.target,
      performance: totalCompletions / kpi.target * 100
    });
    return totalCompletions / kpi.target * 100;
  }
  return {
    subscribe,
    initialize: async () => {
      return false;
    },
    // ...other CRUD operations...
    getKpiProgress: fetchCompletionsForKpi,
    clearCache: () => {
      update((s) => ({ ...s, completionsCache: /* @__PURE__ */ new Map() }));
    }
  };
}
const goalStore = createGoalStore();
export {
  goalStore as g
};
