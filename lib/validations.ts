import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(120),
  description: z.string().max(500).optional(),
});

export const memberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
});

export const taskUpdateSchema = taskSchema.partial();

export const adminUserUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  systemRole: z.enum(["USER", "PLATFORM_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});
