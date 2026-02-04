import { GanttDocV1, validateGanttDoc } from "../model/schema";
import { createDefaultDoc } from "../model/defaults";
import { v4 as uuidv4 } from 'uuid';

export const saveToFile = (doc: GanttDocV1) => {
  const json = JSON.stringify(doc, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dateStr = doc.updatedAt.split('T')[0];
  const filename = `${safeTitle}_${dateStr}.gantt.json`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const loadFromFile = async (file: File): Promise<GanttDocV1> => {
  const text = await file.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid JSON file");
  }

  const { success, data, error } = validateGanttDoc(json);
  
  if (!success || !data) {
    throw new Error(`Validation Failed: ${error}`);
  }

  // Repair logic: ensure all tasks reference valid rows
  const rowIds = new Set(data.rows.map(r => r.id));
  const orphanTasks = data.tasks.filter(t => !rowIds.has(t.rowId));

  if (orphanTasks.length > 0) {
    const unassignedId = uuidv4();
    data.rows.push({
      id: unassignedId,
      name: "Unassigned",
      order: data.rows.length
    });
    data.tasks = data.tasks.map(t => {
      if (!rowIds.has(t.rowId)) {
        return { ...t, rowId: unassignedId };
      }
      return t;
    });
    console.warn(`Repaired ${orphanTasks.length} orphan tasks.`);
  }

  return data;
};