import { z } from "zod";

export const LoanCreateSchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().min(0),
  interest: z.number().min(0),
  months: z.number().int().min(1),
  partialAmortRate: z.number().min(0).optional().default(0),
  totalAmortRate: z.number().min(0).optional().default(0),
  startDate: z.string().datetime({ offset: true }).optional().nullable(),
  category: z.string().optional().default("other"),
  reminderDays: z.number().int().min(0).optional().default(0),
});

export const LoanUpdateSchema = LoanCreateSchema.partial();

export const UserCreateSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});

export type LoanCreateInput = z.infer<typeof LoanCreateSchema>;
export type LoanUpdateInput = z.infer<typeof LoanUpdateSchema>;
export type UserCreateInput = z.infer<typeof UserCreateSchema>;
