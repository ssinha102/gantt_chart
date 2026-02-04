import { GanttDocV1, validateGanttDoc } from "../model/schema";

const STORAGE_KEY = "gantt_doc_v1_current";

export const saveToLocalStorage = (doc: GanttDocV1) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch (e) {
    console.error("Failed to autosave", e);
  }
};

export const loadFromLocalStorage = (): GanttDocV1 | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const json = JSON.parse(raw);
    const { success, data } = validateGanttDoc(json);
    return success && data ? data : null;
  } catch (e) {
    return null;
  }
};