
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  onIdTokenChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User } from "@/types";

// ── Sync ID token to cookie so middleware & API routes can verify it ──────────
async function syncSessionCookie(fbUser: FirebaseUser | null) {
  if (typeof document === "undefined") return; // SSR guard
  if (fbUser) {
    const token = await fbUser.getIdToken();
    // 1-hour expiry matching Firebase ID token lifetime
    document.cookie = `firebase-session=${token}; path=/; SameSite=Strict; max-age=3600`;
  } else {
    document.cookie = "firebase-session=; path=/; max-age=0";
  }
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerMechanic: (name: string, email: string, password: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged handles login / logout lifecycle
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      await syncSessionCookie(fbUser);
      if (fbUser) {
        const appUser: User = {
          id: fbUser.uid,
          email: fbUser.email ?? "",
          name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
          role: "admin", // TODO: fetch role from Firestore user profile
          garageId: "garage_001", // TODO: fetch from Firestore
        };
        setFirebaseUser(fbUser);
        setUser(appUser);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    // Proactively refresh the cookie whenever Firebase refreshes the ID token
    const unsubscribeToken = onIdTokenChanged(auth, async (fbUser) => {
      await syncSessionCookie(fbUser);
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged above will set user & sync cookie
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    // onAuthStateChanged above will clear user & remove cookie
  };

  const registerMechanic = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    const res = await fetch("/api/team/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to register mechanic");
    }
    const data = await res.json();
    return data.user as User;
  };

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, isLoading, login, logout, registerMechanic }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useUserRole() {
  const { user, isLoading } = useAuth();
  return {
    role: user?.role,
    garageId: user?.garageId,
    isAdmin: user?.role === "admin",
    isMechanic: user?.role === "mechanic",
    isLoading,
  };
}
