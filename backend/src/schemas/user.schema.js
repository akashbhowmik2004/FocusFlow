import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z
      .string({ invalid_type_error: "Name must be a string" })
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    email: z
      .string({ invalid_type_error: "Email must be a string" })
      .trim()
      .toLowerCase()
      .email("Invalid email format")
      .max(254, "Email cannot exceed 254 characters")
      .optional(),

    avatar: z
      .string()
      .nullable()
      .optional(),

    studyGoal: z
      .string()
      .max(255, "Study goal cannot exceed 255 characters")
      .nullable()
      .optional(),

    dailyStudyHours: z
      .number({ invalid_type_error: "Daily study hours must be a number" })
      .int("Daily study hours must be an integer")
      .min(0, "Daily study hours must be between 0 and 24")
      .max(24, "Daily study hours must be between 0 and 24")
      .optional(),

    preferredStartTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be HH:MM format")
      .optional(),

    preferredEndTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be HH:MM format")
      .optional(),

    reminderEnabled: z
      .boolean({ invalid_type_error: "reminderEnabled must be a boolean" })
      .optional(),

    onboardingCompleted: z.boolean().optional(),

    // Academic Profile: Identity & Position
    institution: z.string().max(255, "Institution name cannot exceed 255 characters").nullable().optional(),
    degree: z.string().max(255, "Degree name cannot exceed 255 characters").nullable().optional(),
    department: z.string().max(255, "Department cannot exceed 255 characters").nullable().optional(),
    academicYear: z.number().int().min(1, "Academic year must be at least 1").max(10, "Academic year cannot exceed 10").nullable().optional(),
    currentSemester: z.number().int().min(1, "Semester must be at least 1").max(20, "Semester cannot exceed 20").nullable().optional(),
    academicSession: z.string().max(100, "Academic session cannot exceed 100 characters").nullable().optional(),
    semesterStartDate: z.string().nullable().optional(),
    semesterEndDate: z.string().nullable().optional(),
    expectedGraduationYear: z.number().int().min(2000).max(2100).nullable().optional(),

    // Academic Profile: Goals & Preferences
    secondaryGoals: z.array(z.string()).optional(),
    customGoal: z.string().max(500, "Custom goal cannot exceed 500 characters").nullable().optional(),
    targetCgpa: z.number().min(0).max(10, "CGPA must be between 0 and 10").nullable().optional(),
    targetCompletionDate: z.string().nullable().optional(),
    defaultFocusDuration: z.number().int().min(5, "Focus duration must be at least 5 minutes").max(180, "Focus duration cannot exceed 180 minutes").optional(),
    defaultBreakDuration: z.number().int().min(1, "Break duration must be at least 1 minute").max(60, "Break duration cannot exceed 60 minutes").optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0 &&
      Object.values(data).some((val) => val !== undefined),
    {
      message: "Provide at least one field to update",
    }
  );

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(100, "New password cannot exceed 100 characters"),

    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: 'Confirmation token must be "DELETE"' }),
  }),
});

export const onboardingSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  institution: z
    .string({ invalid_type_error: "Institution must be a string" })
    .trim()
    .max(255, "Institution name cannot exceed 255 characters")
    .nullable()
    .optional(),

  degree: z
    .string({ invalid_type_error: "Degree must be a string" })
    .trim()
    .max(255, "Degree name cannot exceed 255 characters")
    .nullable()
    .optional(),

  department: z
    .string({ invalid_type_error: "Department must be a string" })
    .trim()
    .max(255, "Department cannot exceed 255 characters")
    .nullable()
    .optional(),

  academicYear: z
    .number({ invalid_type_error: "Academic year must be a number" })
    .int("Academic year must be an integer")
    .min(1, "Academic year must be at least 1")
    .max(10, "Academic year cannot exceed 10")
    .nullable()
    .optional(),

  currentSemester: z
    .number({ invalid_type_error: "Current semester must be a number" })
    .int("Semester must be an integer")
    .min(1, "Semester must be at least 1")
    .max(20, "Semester cannot exceed 20")
    .nullable()
    .optional(),

  academicSession: z
    .string({ invalid_type_error: "Academic session must be a string" })
    .trim()
    .max(100, "Academic session cannot exceed 100 characters")
    .nullable()
    .optional(),

  semesterStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("")),

  semesterEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("")),

  expectedGraduationYear: z
    .number({ invalid_type_error: "Expected graduation year must be a number" })
    .int("Graduation year must be an integer")
    .min(2000, "Expected graduation year must be at least 2000")
    .max(2100, "Expected graduation year cannot exceed 2100")
    .nullable()
    .optional(),

  studyGoal: z
    .string({ invalid_type_error: "Study goal must be a string" })
    .trim()
    .max(255, "Study goal cannot exceed 255 characters")
    .nullable()
    .optional(),

  secondaryGoals: z
    .array(z.string().max(255, "Secondary goal cannot exceed 255 characters"))
    .optional(),

  customGoal: z
    .string({ invalid_type_error: "Custom goal must be a string" })
    .trim()
    .max(500, "Custom goal cannot exceed 500 characters")
    .nullable()
    .optional(),

  targetCgpa: z
    .number({ invalid_type_error: "Target CGPA must be a number" })
    .min(0, "CGPA must be between 0 and 10")
    .max(10, "CGPA must be between 0 and 10")
    .nullable()
    .optional(),

  targetCompletionDate: z
    .string()
    .nullable()
    .optional()
    .or(z.literal("")),

  dailyStudyHours: z
    .number({ invalid_type_error: "Daily study hours must be a number" })
    .int("Daily study hours must be an integer")
    .min(0, "Daily study hours must be between 0 and 24")
    .max(24, "Daily study hours must be between 0 and 24")
    .optional(),

  preferredStartTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be HH:MM format")
    .optional(),

  preferredEndTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be HH:MM format")
    .optional(),

  defaultFocusDuration: z
    .number({ invalid_type_error: "Focus duration must be a number" })
    .int("Focus duration must be an integer")
    .min(5, "Focus duration must be at least 5 minutes")
    .max(180, "Focus duration cannot exceed 180 minutes")
    .optional(),

  defaultBreakDuration: z
    .number({ invalid_type_error: "Break duration must be a number" })
    .int("Break duration must be an integer")
    .min(1, "Break duration must be at least 1 minute")
    .max(60, "Break duration cannot exceed 60 minutes")
    .optional(),

  reminderEnabled: z
    .boolean({ invalid_type_error: "reminderEnabled must be a boolean" })
    .optional(),

  onboardingCompleted: z
    .boolean({ invalid_type_error: "onboardingCompleted must be a boolean" })
    .optional(),
});
