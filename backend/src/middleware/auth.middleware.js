import { verifyToken } from "../utils/authToken.js";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. Please log in or sign up.",
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired session. Please log in again.",
      });
    }

    if (!decoded || !decoded.sub) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
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
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User account not found. Please sign up or log in again.",
      });
    }

    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      message: "Internal authentication error.",
    });
  }
}
