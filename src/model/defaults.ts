import { GanttDocV1 } from "./types";
import { v4 as uuidv4 } from 'uuid';

export const createDefaultDoc = (): GanttDocV1 => {
  const row1 = uuidv4();
  return {
    version: 1,
    title: "New Project",
    rows: [{ id: row1, name: "Phase 1", order: 0 }],
    tasks: [{ 
      id: uuidv4(), 
      rowId: row1, 
      name: "Task A", 
      start: new Date().toISOString().split('T')[0], 
      end: new Date().toISOString().split('T')[0],
      owner: "Team",
      status: "todo",
      link: "" 
    }],
    timeboxes: [], 
    view: { 
      zoom: "day",
      showTimeboxes: false 
    }
  };
};
