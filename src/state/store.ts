import { create } from 'zustand';
import { GanttDocV1, Row, Task, Timebox, Zoom } from '../model/types';
import { createDefaultDoc } from '../model/defaults';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface GanttState {
  doc: GanttDocV1;
  status: "idle" | "error";
  errorMessage: string | null;

  // Actions
  setTitle: (title: string) => void;
  setZoom: (zoom: Zoom) => void;
  loadDoc: (doc: GanttDocV1) => void;
  resetDoc: () => void;
  
  // Row CRUD
  addRow: (name: string) => void;
  deleteRow: (id: string) => void;
  
  // Task CRUD
  addTask: (rowId: string, task: Omit<Task, 'id' | 'rowId'>) => void;
  deleteTask: (id: string) => void;

  // UI Helpers
  setError: (msg: string) => void;
  clearError: () => void;
}

// Debounce helper outside store to avoid recreating
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSave = (doc: GanttDocV1) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToLocalStorage(doc);
    console.log("Autosaved");
  }, 500);
};

export const useStore = create<GanttState>((set, get) => ({
  doc: loadFromLocalStorage() || createDefaultDoc(),
  status: "idle",
  errorMessage: null,

  setTitle: (title) => set((state) => {
    const newDoc = { ...state.doc, title, updatedAt: new Date().toISOString() };
    debouncedSave(newDoc);
    return { doc: newDoc };
  }),

  setZoom: (zoom) => set((state) => {
    const newDoc = { ...state.doc, view: { ...state.doc.view, zoom } };
    debouncedSave(newDoc);
    return { doc: newDoc };
  }),

  loadDoc: (newDoc) => {
    set({ doc: newDoc, status: "idle", errorMessage: null });
    saveToLocalStorage(newDoc);
  },

  resetDoc: () => {
    const newDoc = createDefaultDoc();
    set({ doc: newDoc, status: "idle", errorMessage: null });
    saveToLocalStorage(newDoc);
  },

  addRow: (name) => set((state) => {
    const newRow: Row = {
      id: uuidv4(),
      name,
      order: state.doc.rows.length
    };
    const newDoc = { 
      ...state.doc, 
      rows: [...state.doc.rows, newRow],
      updatedAt: new Date().toISOString()
    };
    debouncedSave(newDoc);
    return { doc: newDoc };
  }),

  deleteRow: (id) => set((state) => {
    // Also delete associated tasks
    const newDoc = {
      ...state.doc,
      rows: state.doc.rows.filter(r => r.id !== id),
      tasks: state.doc.tasks.filter(t => t.rowId !== id),
      updatedAt: new Date().toISOString()
    };
    debouncedSave(newDoc);
    return { doc: newDoc };
  }),

  addTask: (rowId, taskInput) => set((state) => {
    const newTask: Task = {
      id: uuidv4(),
      rowId,
      ...taskInput
    };
    const newDoc = {
      ...state.doc,
      tasks: [...state.doc.tasks, newTask],
      updatedAt: new Date().toISOString()
    };
    debouncedSave(newDoc);
    return { doc: newDoc };
  }),

  deleteTask: (id) => set((state) => {
    const newDoc = {
      ...state.doc,
      tasks: state.doc.tasks.filter(t => t.id !== id),
      updatedAt: new Date().toISOString()
    };
    debouncedSave(newDoc);
    return { doc: newDoc };
  }),

  setError: (msg) => set({ status: "error", errorMessage: msg }),
  clearError: () => set({ status: "idle", errorMessage: null }),
}));