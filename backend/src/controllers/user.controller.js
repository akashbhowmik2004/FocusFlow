import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { setAuthCookie, clearAuthCookie } from "../utils/authToken.js";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  studyGoal: true,
  dailyStudyHours: true,
  preferredStartTime: true,
  preferredEndTime: true,
  reminderEnabled: true,
  onboardingCompleted: true,
  onboardingCompletedAt: true,
  institution: true,
  degree: true,
  department: true,
  academicYear: true,
  currentSemester: true,
  academicSession: true,
  semesterStartDate: true,
  semesterEndDate: true,
  expectedGraduationYear: true,
  secondaryGoals: true,
  customGoal: true,
  targetCgpa: true,
  targetCompletionDate: true,
  defaultFocusDuration: true,
  defaultBreakDuration: true,
  createdAt: true,
  updatedAt: true,
};

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      avatar,
      studyGoal,
      dailyStudyHours,
      preferredStartTime,
      preferredEndTime,
      reminderEnabled,
      onboardingCompleted,
      institution,
      degree,
      department,
      academicYear,
      currentSemester,
      academicSession,
      semesterStartDate,
      semesterEndDate,
      expectedGraduationYear,
      secondaryGoals,
      customGoal,
      targetCgpa,
      targetCompletionDate,
      defaultFocusDuration,
      defaultBreakDuration,
    } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (email !== undefined) dataToUpdate.email = email.toLowerCase().trim();
    if (avatar !== undefined) dataToUpdate.avatar = avatar;
    if (studyGoal !== undefined) dataToUpdate.studyGoal = studyGoal;
    if (dailyStudyHours !== undefined) dataToUpdate.dailyStudyHours = dailyStudyHours;
    if (preferredStartTime !== undefined) dataToUpdate.preferredStartTime = preferredStartTime;
    if (preferredEndTime !== undefined) dataToUpdate.preferredEndTime = preferredEndTime;
    if (reminderEnabled !== undefined) dataToUpdate.reminderEnabled = reminderEnabled;
    if (onboardingCompleted !== undefined) dataToUpdate.onboardingCompleted = Boolean(onboardingCompleted);

    if (institution !== undefined) dataToUpdate.institution = institution ? institution.trim() : null;
    if (degree !== undefined) dataToUpdate.degree = degree ? degree.trim() : null;
    if (department !== undefined) dataToUpdate.department = department ? department.trim() : null;
    if (academicYear !== undefined) dataToUpdate.academicYear = academicYear !== null ? Number(academicYear) : null;
    if (currentSemester !== undefined) dataToUpdate.currentSemester = currentSemester !== null ? Number(currentSemester) : null;
    if (academicSession !== undefined) dataToUpdate.academicSession = academicSession ? academicSession.trim() : null;
    if (semesterStartDate !== undefined) dataToUpdate.semesterStartDate = semesterStartDate ? new Date(semesterStartDate) : null;
    if (semesterEndDate !== undefined) dataToUpdate.semesterEndDate = semesterEndDate ? new Date(semesterEndDate) : null;
    if (expectedGraduationYear !== undefined) dataToUpdate.expectedGraduationYear = expectedGraduationYear !== null ? Number(expectedGraduationYear) : null;
    if (secondaryGoals !== undefined) dataToUpdate.secondaryGoals = Array.isArray(secondaryGoals) ? secondaryGoals : [];
    if (customGoal !== undefined) dataToUpdate.customGoal = customGoal ? customGoal.trim() : null;
    if (targetCgpa !== undefined) dataToUpdate.targetCgpa = targetCgpa !== null ? Number(targetCgpa) : null;
    if (targetCompletionDate !== undefined) dataToUpdate.targetCompletionDate = targetCompletionDate ? new Date(targetCompletionDate) : null;
    if (defaultFocusDuration !== undefined) dataToUpdate.defaultFocusDuration = Number(defaultFocusDuration);
    if (defaultBreakDuration !== undefined) dataToUpdate.defaultBreakDuration = Number(defaultBreakDuration);

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    // Check if new email is already in use by another user
    if (dataToUpdate.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: dataToUpdate.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "An account with this email already exists",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: dataToUpdate,
      select: SAFE_USER_SELECT,
    });

    return res
      .status(200)
      .json({ message: "User details updated successfully", user: updatedUser });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    console.error("Error updating user details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        message: "This account was registered using Google and does not have a password set.",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordIsCorrect) {
      return res.status(400).json({
        message: "Incorrect current password",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (samePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    setAuthCookie(res, userId);

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating user password:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const confirmation = req.body?.confirmation;

    if (confirmation !== "DELETE") {
      return res.status(400).json({
        message: 'Invalid confirmation token. Confirmation must be "DELETE"',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      clearAuthCookie(res);
      return res.status(404).json({ message: "User account not found" });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    clearAuthCookie(res);
    return res.status(200).json({
      message: "Account and associated academic data permanently deleted",
    });
  } catch (error) {
    if (error?.code === "P2025") {
      clearAuthCookie(res);
      return res.status(404).json({ message: "User account not found" });
    }
    console.error("Error deleting user account:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: {
        topics: {
          include: {
            revisions: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const sessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return res.status(200).json({
      exportedAt: new Date().toISOString(),
      user,
      subjects,
      sessions,
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};

    // Check if client requested completion or intermediate progress save
    const markCompleted =
      body.onboardingCompleted !== undefined
        ? Boolean(body.onboardingCompleted)
        : true;

    // Validate required fields if attempting to finalize onboarding
    if (markCompleted) {
      const resolvedInstitution =
        body.institution !== undefined ? body.institution : req.user.institution;
      const resolvedDegree =
        body.degree !== undefined ? body.degree : req.user.degree;

      if (!resolvedInstitution || !String(resolvedInstitution).trim()) {
        return res.status(400).json({
          message: "Institution or college is required to complete academic onboarding",
        });
      }

      if (!resolvedDegree || !String(resolvedDegree).trim()) {
        return res.status(400).json({
          message: "Degree or course is required to complete academic onboarding",
        });
      }
    }

    const dataToUpdate = {
      onboardingCompleted: markCompleted,
    };

    if (markCompleted) {
      dataToUpdate.onboardingCompletedAt = new Date();
    }

    if (body.name !== undefined && typeof body.name === "string" && body.name.trim()) {
      dataToUpdate.name = body.name.trim();
    }
    if (body.studyGoal !== undefined) {
      dataToUpdate.studyGoal = body.studyGoal ? String(body.studyGoal).trim() : null;
    }
    if (body.dailyStudyHours !== undefined && body.dailyStudyHours !== null) {
      dataToUpdate.dailyStudyHours = Number(body.dailyStudyHours);
    }
    if (body.preferredStartTime !== undefined) {
      dataToUpdate.preferredStartTime = body.preferredStartTime;
    }
    if (body.preferredEndTime !== undefined) {
      dataToUpdate.preferredEndTime = body.preferredEndTime;
    }
    if (body.reminderEnabled !== undefined) {
      dataToUpdate.reminderEnabled = Boolean(body.reminderEnabled);
    }

    if (body.institution !== undefined) {
      dataToUpdate.institution = body.institution ? String(body.institution).trim() : null;
    }
    if (body.degree !== undefined) {
      dataToUpdate.degree = body.degree ? String(body.degree).trim() : null;
    }
    if (body.department !== undefined) {
      dataToUpdate.department = body.department ? String(body.department).trim() : null;
    }
    if (body.academicYear !== undefined) {
      dataToUpdate.academicYear = body.academicYear !== null ? Number(body.academicYear) : null;
    }
    if (body.currentSemester !== undefined) {
      dataToUpdate.currentSemester = body.currentSemester !== null ? Number(body.currentSemester) : null;
    }
    if (body.academicSession !== undefined) {
      dataToUpdate.academicSession = body.academicSession ? String(body.academicSession).trim() : null;
    }
    if (body.semesterStartDate !== undefined) {
      dataToUpdate.semesterStartDate = body.semesterStartDate ? new Date(body.semesterStartDate) : null;
    }
    if (body.semesterEndDate !== undefined) {
      dataToUpdate.semesterEndDate = body.semesterEndDate ? new Date(body.semesterEndDate) : null;
    }
    if (body.expectedGraduationYear !== undefined) {
      dataToUpdate.expectedGraduationYear =
        body.expectedGraduationYear !== null ? Number(body.expectedGraduationYear) : null;
    }
    if (body.secondaryGoals !== undefined) {
      dataToUpdate.secondaryGoals = Array.isArray(body.secondaryGoals) ? body.secondaryGoals : [];
    }
    if (body.customGoal !== undefined) {
      dataToUpdate.customGoal = body.customGoal ? String(body.customGoal).trim() : null;
    }
    if (body.targetCgpa !== undefined) {
      dataToUpdate.targetCgpa = body.targetCgpa !== null ? Number(body.targetCgpa) : null;
    }
    if (body.targetCompletionDate !== undefined) {
      dataToUpdate.targetCompletionDate = body.targetCompletionDate ? new Date(body.targetCompletionDate) : null;
    }
    if (body.defaultFocusDuration !== undefined && body.defaultFocusDuration !== null) {
      dataToUpdate.defaultFocusDuration = Number(body.defaultFocusDuration);
    }
    if (body.defaultBreakDuration !== undefined && body.defaultBreakDuration !== null) {
      dataToUpdate.defaultBreakDuration = Number(body.defaultBreakDuration);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: SAFE_USER_SELECT,
    });

    return res.status(200).json({
      message: markCompleted
        ? "Academic profile onboarding completed successfully"
        : "Onboarding progress saved successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
