import { create } from 'zustand';
import { GanttDocV1 } from '../model/types';
import { createDefaultDoc } from '../model/defaults';
import { v4 as uuidv4 } from 'uuid';

interface GanttState {
  doc: GanttDocV1;
  setTitle: (t: string) => void;
  addRow: (name: string) => void;
  addTask: (rowId: string, name: string) => void;
  deleteRow: (id: string) => void;
  deleteTask: (id: string) => void;
  loadDoc: (doc: GanttDocV1) => void;
}

export const useStore = create<GanttState>((set) => ({
  doc: createDefaultDoc(),
  setTitle: (title) => set((s) => ({ doc: { ...s.doc, title } })),
  
  addRow: (name) => set((s) => ({
    doc: { 
      ...s.doc, 
      rows: [...s.doc.rows, { id: uuidv4(), name, order: s.doc.rows.length }] 
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
  
  deleteRow: (id) => set((s) => ({
    doc: {
      ...s.doc,
      rows: s.doc.rows.filter(r => r.id !== id),
      tasks: s.doc.tasks.filter(t => t.rowId !== id)
    }
  })),
  
  deleteTask: (id) => set((s) => ({
    doc: {
      ...s.doc,
      tasks: s.doc.tasks.filter(t => t.id !== id)
    }
  })),
  
  loadDoc: (doc) => set({ doc })
}));
