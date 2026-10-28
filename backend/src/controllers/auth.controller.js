import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
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
  theme: true,
  createdAt: true,
};

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: SAFE_USER_SELECT,
    });

    setAuthCookie(res, user.id);

    return res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    console.error("Signup failed:", error);

    return res.status(500).json({
      message: "Failed to create account",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        message: "This account was registered using Google. Please sign in with Google.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    setAuthCookie(res, user.id);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      studyGoal: user.studyGoal,
      dailyStudyHours: user.dailyStudyHours,
      preferredStartTime: user.preferredStartTime,
      preferredEndTime: user.preferredEndTime,
      reminderEnabled: user.reminderEnabled,
      theme: user.theme,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
}

export async function logout(req, res) {
  try {
    clearAuthCookie(res);
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({
      message: "Logout failed",
    });
  }
}

export async function getMe(req, res) {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("getMe failed:", error);
    return res.status(500).json({
      message: "Failed to retrieve user profile",
    });
  }
}

export async function googleAuth(req, res) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/api/auth/google/callback";

    if (!clientId) {
      return res.status(500).json({
        message: "Google OAuth is not configured on this server",
      });
    }

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

    return res.redirect(`${rootUrl}?${params.toString()}`);
  } catch (error) {
    console.error("Google auth initiation failed:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Failed to initiate Google sign-in")}`);
  }
}

export async function googleCallback(req, res) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const { code, error } = req.query;

    if (error) {
      console.warn("Google OAuth callback returned error:", error);
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          error === "access_denied" ? "Google sign-in was cancelled" : error
        )}`
      );
    }

    if (!code) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent("Authorization code missing from Google callback")}`
      );
    }

    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/api/auth/google/callback";

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || !tokens.access_token) {
      console.error("Google token exchange failed:", tokens);
      const errorMsg = tokens.error_description || tokens.error || "Failed to exchange Google code";
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMsg)}`);
    }

    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userinfoResponse.json();

    if (!userinfoResponse.ok || !googleUser.email) {
      console.error("Failed to fetch Google userinfo:", googleUser);
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent("Failed to get profile from Google")}`
      );
    }

    const normalizedEmail = googleUser.email.toLowerCase().trim();
    const providerAccountId = String(googleUser.sub);

    let oauthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId,
        },
      },
      include: { user: true },
    });

    let user;

    if (oauthAccount) {
      user = oauthAccount.user;
      if (!user.avatar && googleUser.picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar: googleUser.picture },
          select: SAFE_USER_SELECT,
        });
      }
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        user = existingUser;
        await prisma.oAuthAccount.create({
          data: {
            provider: "google",
            providerAccountId,
            userId: user.id,
          },
        });

        if (!user.avatar && googleUser.picture) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { avatar: googleUser.picture },
            select: SAFE_USER_SELECT,
          });
        }
      } else {
        user = await prisma.user.create({
          data: {
            name: googleUser.name || normalizedEmail.split("@")[0],
            email: normalizedEmail,
            avatar: googleUser.picture || null,
            emailVerifiedAt: new Date(),
            oauthAccounts: {
              create: {
                provider: "google",
                providerAccountId,
              },
            },
          },
          select: SAFE_USER_SELECT,
        });
      }
    }

    setAuthCookie(res, user.id);

    return res.redirect(`${frontendUrl}/app/dashboard`);
  } catch (error) {
    console.error("Google callback processing error:", error);
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent("An unexpected error occurred during Google sign-in")}`
    );
  }
}

export async function googleToken(req, res) {
  try {
    const { credential, code } = req.body;

    if (!credential && !code) {
      return res.status(400).json({
        message: "Google credential or authorization code is required",
      });
    }

    let googleUser;

    if (credential) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      const tokenInfo = await verifyRes.json();

      if (!verifyRes.ok || !tokenInfo.email) {
        return res.status(401).json({
          message: "Invalid Google credential",
        });
      }

      if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
        console.warn("Google token audience mismatch:", tokenInfo.aud);
      }

      googleUser = tokenInfo;
    } else if (code) {
      const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:3000/api/auth/google/callback";

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenRes.json();

      if (!tokenRes.ok || !tokens.access_token) {
        return res.status(401).json({
          message: tokens.error_description || "Failed to exchange Google authorization code",
        });
      }

      const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      googleUser = await userinfoRes.json();

      if (!userinfoRes.ok || !googleUser.email) {
        return res.status(401).json({
          message: "Failed to retrieve Google user profile",
        });
      }
    }

    const normalizedEmail = googleUser.email.toLowerCase().trim();
    const providerAccountId = String(googleUser.sub);

    let oauthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId,
        },
      },
      include: { user: true },
    });

    let user;

    if (oauthAccount) {
      user = oauthAccount.user;
      if (!user.avatar && googleUser.picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar: googleUser.picture },
          select: SAFE_USER_SELECT,
        });
      }
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        user = existingUser;
        await prisma.oAuthAccount.create({
          data: {
            provider: "google",
            providerAccountId,
            userId: user.id,
          },
        });

        if (!user.avatar && googleUser.picture) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { avatar: googleUser.picture },
            select: SAFE_USER_SELECT,
          });
        }
      } else {
        user = await prisma.user.create({
          data: {
            name: googleUser.name || normalizedEmail.split("@")[0],
            email: normalizedEmail,
            avatar: googleUser.picture || null,
            emailVerifiedAt: new Date(),
            oauthAccounts: {
              create: {
                provider: "google",
                providerAccountId,
              },
            },
          },
          select: SAFE_USER_SELECT,
        });
      }
    }

    setAuthCookie(res, user.id);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      studyGoal: user.studyGoal,
      dailyStudyHours: user.dailyStudyHours,
      preferredStartTime: user.preferredStartTime,
      preferredEndTime: user.preferredEndTime,
      reminderEnabled: user.reminderEnabled,
      theme: user.theme,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: "Google sign-in successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("googleToken handler error:", error);
    return res.status(500).json({
      message: "Failed to process Google sign-in",
    });
  }
}
