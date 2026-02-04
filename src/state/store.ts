import { create } from 'zustand';
import { GanttDocV1, Task } from '../model/types';
import { createDefaultDoc } from '../model/defaults';
import { v4 as uuidv4 } from 'uuid';

interface GanttState {
  doc: GanttDocV1;
  setTitle: (t: string) => void;
  toggleTimeboxes: () => void;
  
  // Row CRUD
  addRow: (name: string) => void;
  deleteRow: (id: string) => void;
  
  // Task CRUD
  addTask: (rowId: string, name: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
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

  addRow: (name) => set((s) => ({
    doc: { 
      ...s.doc, 
      rows: [...s.doc.rows, { id: uuidv4(), name, order: s.doc.rows.length }] 
    }
  })),
  
  deleteRow: (id) => set((s) => ({
    doc: {
      ...s.doc,
      rows: s.doc.rows.filter(r => r.id !== id),
      tasks: s.doc.tasks.filter(t => t.rowId !== id)
    }
  })),

  addTask: (rowId, name) => set((s) => ({
    doc: {
      ...s.doc,
      tasks: [...s.doc.tasks, { 
        id: uuidv4(), 
        rowId, 
        name, 
        start: new Date().toISOString().split('T')[0], 
        end: new Date().toISOString().split('T')[0] 
      }]
    }
  })),

  updateTask: (taskId, updates) => set((s) => ({
    doc: {
      ...s.doc,
      tasks: s.doc.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }
  })),
  
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
      view: { ...doc.view, showTimeboxes: doc.view.showTimeboxes ?? false }
    } 
  })
}));
