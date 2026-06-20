import { z } from "zod";

export const statusValues = ["ACTIVE", "INACTIVE", "TERMINATED", "LEAVE"] as const;
export const employmentTypeValues = ["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"] as const;
export const departmentValues = [
  "People",
  "Finance",
  "Information Technology",
  "Security",
  "Engineering",
  "Sales",
  "Marketing",
  "Customer Success",
  "Operations",
  "Legal"
] as const;

export const employeeCreateSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email"),
  username: z.string().trim().min(1, "Username is required"),
  phoneNumber: z.string().trim().optional().or(z.literal("")),
  department: z.string().trim().min(1, "Department is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  managerEmail: z.string().trim().email("Enter a valid manager email").optional().or(z.literal("")),
  employmentType: z.enum(employmentTypeValues),
  contractDuration: z.string().trim().optional().or(z.literal("")),
  status: z.enum(statusValues),
  startDate: z.string().trim().min(1, "Start date is required"),
  location: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  streetAddress: z.string().trim().optional().or(z.literal(""))
});

export const employeeUpdateSchema = employeeCreateSchema.omit({ employeeId: true });

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;

export function normalizeEmployeeInput<T extends EmployeeCreateInput | EmployeeUpdateInput>(input: T) {
  return {
    ...input,
    phoneNumber: input.phoneNumber || null,
    managerEmail: input.managerEmail || null,
    contractDuration: input.contractDuration || null,
    location: input.location || null,
    country: input.country || null,
    state: input.state || null,
    streetAddress: input.streetAddress || null,
    startDate: new Date(`${input.startDate}T00:00:00.000Z`)
  };
}

export function dateInputValue(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}
