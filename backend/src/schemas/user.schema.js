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
      .min(1, "Daily study hours must be between 1 and 24")
      .max(24, "Daily study hours must be between 1 and 24")
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

    theme: z
      .enum(["light", "dark"], {
        errorMap: () => ({ message: "Theme must be either 'light' or 'dark'" }),
      })
      .optional(),
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

export const updateThemeSchema = z.object({
  theme: z.enum(["light", "dark"], {
    errorMap: () => ({ message: "Theme must be either 'light' or 'dark'" }),
  }),
});
