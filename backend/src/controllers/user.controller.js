import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

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
  theme: true,
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
      theme,
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
    if (theme !== undefined) dataToUpdate.theme = theme;

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

export const updateUserTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        theme,
      },
      select: SAFE_USER_SELECT,
    });

    return res.status(200).json({
      message: "Theme updated successfully",
      theme: updatedUser.theme,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user theme:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
