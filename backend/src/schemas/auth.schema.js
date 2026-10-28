import { z } from "zod";

export const signupSchema = z.object({
  name: z.string({
    error: "Name is required",
  }).trim().min(1, "Name is required").max(100),

  email: z.string({
    error : "Email is required"
  })
    .trim()
    .email("Enter a valid email address")
    .max(254),

  password: z.string({
    error : "Password is required"
  })
    .min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email("Enter a valid email address")
    .max(254),

  password: z.string()
    .min(1, "Password is required"),
});

