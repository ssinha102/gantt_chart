import { z } from "zod";

// Helper for YYYY-MM-DD validation
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD");

export const RowSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  order: z.number(),
});

export const TaskSchema = z.object({
  id: z.string().min(1),
  rowId: z.string().min(1),
  name: z.string(),
  start: dateStringSchema,
  end: dateStringSchema,
  progress: z.number().min(0).max(100).optional(),
  color: z.string().optional(),
}).refine((data) => data.start <= data.end, {
  message: "Task start date must be before or equal to end date",
  path: ["end"],
});

export const TimeboxSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["sprint", "pi"]),
  name: z.string(),
  start: dateStringSchema,
  end: dateStringSchema,
}).refine((data) => data.start <= data.end, {
  message: "Timebox start date must be before or equal to end date",
  path: ["end"],
});

export const GanttDocV1Schema = z.object({
  version: z.literal(1),
  title: z.string().min(1),
  timezone: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  rows: z.array(RowSchema),
  tasks: z.array(TaskSchema),
  timeboxes: z.array(TimeboxSchema),
  view: z.object({
    zoom: z.enum(["day", "week", "month"]),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
  }),
});

export type GanttDocV1 = z.infer<typeof GanttDocV1Schema>;

export const validateGanttDoc = (data: unknown): { success: boolean; data?: GanttDocV1; error?: string } => {
  const result = GanttDocV1Schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
  }
  return { success: true, data: result.data };
};