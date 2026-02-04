export type Zoom = "day" | "week" | "month";

export type Row = {
  id: string;
  name: string;
  order: number;
};

export type Task = {
  id: string;
  rowId: string;
  name: string;
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
  progress?: number; // 0..100
  color?: string;
};

export type Timebox = {
  id: string;
  type: "sprint" | "pi";
  name: string;
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
};

export type GanttDocV1 = {
  version: 1;
  title: string;
  timezone: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  rows: Row[];
  tasks: Task[];
  timeboxes: Timebox[];
  view: {
    zoom: Zoom;
    startDate: string;
    endDate: string;
  };
};