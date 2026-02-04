import { create } from 'zustand';
import { GanttDocV1, Task, Row } from '../model/types';
import { createDefaultDoc } from '../model/defaults';
import { v4 as uuidv4 } from 'uuid';

interface GanttState {
  doc: GanttDocV1;
  setTitle: (t: string) => void;
  toggleTimeboxes: () => void;
  toggleRowCollapse: (rowId: string) => void; // New Action
  
  // Row CRUD
  addRow: (name: string) => void;
  updateRow: (id: string, updates: Partial<Row>) => void;
  deleteRow: (id: string) => void;
  
  // Task CRUD
  addTask: (rowId: string, name: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  reorderTask: (taskId: string, newRowId: string, newIndex: number) => void; 
  deleteTask: (id: string) => void;

  // Timebox CRUD
  addTimebox: (type: "sprint" | "pi", name: string, start: string, end: string) => void;
  deleteTimebox: (id: string) => void;

  loadDoc: (doc: GanttDocV1) => void;
}

export const useStore = create<GanttState>((set) => ({
  doc: createDefaultDoc(),
  
  setTitle: (title) => set((s) => ({ doc: { ...s.doc, title } })),

  toggleTimeboxes: () => set((s) => ({
    doc: { ...s.doc, view: { ...s.doc.view, showTimeboxes: !s.doc.view.showTimeboxes } }
  })),

  toggleRowCollapse: (rowId) => set((s) => {
    const current = s.doc.view.collapsedRowIds || [];
    const isCollapsed = current.includes(rowId);
    const newCollapsed = isCollapsed 
      ? current.filter(id => id !== rowId)
      : [...current, rowId];
    return { doc: { ...s.doc, view: { ...s.doc.view, collapsedRowIds: newCollapsed } } };
  }),

  addRow: (name) => set((s) => ({
    doc: { 
      ...s.doc, 
      rows: [...s.doc.rows, { id: uuidv4(), name, order: s.doc.rows.length }] 
    }
  })),

  updateRow: (id, updates) => set((s) => ({
    doc: {
      ...s.doc,
      rows: s.doc.rows.map(r => r.id === id ? { ...r, ...updates } : r)
    }
  })),
  
  deleteRow: (id) => set((s) => ({
    doc: {
      ...s.doc,
      rows: s.doc.rows.filter(r => r.id !== id),
      tasks: s.doc.tasks.filter(t => t.rowId !== id)
    }
  })),

  addTask: (rowId, name) => set((s) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      doc: {
        ...s.doc,
        tasks: [...s.doc.tasks, { 
          id: uuidv4(), 
          rowId, 
          name, 
          start: today.toISOString().split('T')[0], 
          end: tomorrow.toISOString().split('T')[0]
        }]
      }
    };
  }),

  updateTask: (taskId, updates) => set((s) => ({
    doc: {
      ...s.doc,
      tasks: s.doc.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }
  })),

  reorderTask: (taskId, newRowId, newIndex) => set((s) => {
    const taskToMove = s.doc.tasks.find(t => t.id === taskId);
    if (!taskToMove) return s;

    const others = s.doc.tasks.filter(t => t.id !== taskId);
    const targetRowTasks = others.filter(t => t.rowId === newRowId);
    const otherRowTasks = others.filter(t => t.rowId !== newRowId);

    const updatedTask = { ...taskToMove, rowId: newRowId };
    const safeIndex = Math.max(0, Math.min(newIndex, targetRowTasks.length));
    targetRowTasks.splice(safeIndex, 0, updatedTask);

    return {
      doc: {
        ...s.doc,
        tasks: [...otherRowTasks, ...targetRowTasks]
      }
    };
  }),
  
  deleteTask: (id) => set((s) => ({
    doc: {
      ...s.doc,
      tasks: s.doc.tasks.filter(t => t.id !== id)
    }
  })),

  addTimebox: (type, name, start, end) => set((s) => ({
    doc: {
      ...s.doc,
      timeboxes: [...(s.doc.timeboxes || []), { id: uuidv4(), type, name, start, end }]
    }
  })),

  deleteTimebox: (id) => set((s) => ({
    doc: {
      ...s.doc,
      timeboxes: s.doc.timeboxes.filter(tb => tb.id !== id)
    }
  })),
  
  loadDoc: (doc) => set({ 
    doc: {
      ...doc,
      timeboxes: doc.timeboxes || [],
      view: { 
        ...doc.view, 
        showTimeboxes: doc.view.showTimeboxes ?? false,
        collapsedRowIds: doc.view.collapsedRowIds || []
      } 
    } 
  })
}));
