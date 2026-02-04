import { GanttDocV1 } from "./types";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

export const createDefaultDoc = (): GanttDocV1 => {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  // Default view range: 2 weeks before to 4 weeks after
  const viewStart = format(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), "yyyy-MM-dd");
  const viewEnd = format(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 28), "yyyy-MM-dd");

  const row1Id = uuidv4();
  const row2Id = uuidv4();

  return {
    version: 1,
    title: "New Project Plan",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    rows: [
      { id: row1Id, name: "Engineering", order: 0 },
      { id: row2Id, name: "Design", order: 1 }
    ],
    tasks: [
      { id: uuidv4(), rowId: row1Id, name: "Setup Repo", start: today, end: today, progress: 0 },
      { id: uuidv4(), rowId: row2Id, name: "Mockups", start: today, end: today, progress: 0 }
    ],
    timeboxes: [],
    view: {
      zoom: "day",
      startDate: viewStart,
      endDate: viewEnd,
    },
  };
};