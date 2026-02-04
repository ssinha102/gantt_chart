export type Row = {
  id: string;
  name: string;
  order: number;
};

export type Task = {
  id: string;
  rowId: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;   // Acts as Due Date
  owner?: string;
  status?: "todo" | "in-progress" | "done" | "blocked";
  link?: string;
  progress?: number;
};

export type Timebox = {
  id: string;
  type: "sprint" | "pi";
  name: string;
  start: string; // YYYY-MM-DD
  end: string;
};

export type GanttDocV1 = {
  version: 1;
  title: string;
  rows: Row[];
  tasks: Task[];
  timeboxes: Timebox[];
  view: {
    zoom: string;
    showTimeboxes: boolean;
    collapsedRowIds: string[]; // New field for row state
  };
};
