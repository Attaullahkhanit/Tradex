"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOutUser } from "@/server/actions/auth";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuth() {
      console.log("AUTH_PROVIDER: Initializing authentication check...");
      try {
        const currentUser = await getCurrentUser();
        console.log("AUTH_PROVIDER: Current user result:", currentUser ? `Found user: ${currentUser.email}` : "No user session");
        if (currentUser) {
          setUser(currentUser as User);
        }
      } catch (error) {
        console.error("AUTH_PROVIDER: Error during auth initialization:", error);
      } finally {
        console.log("AUTH_PROVIDER: Auth initialization complete, setting isLoading to false");
        setIsLoading(false);
      }
    }
    
    initAuth();
  }, []);

  const login = (userData: User) => {
    // Sync state and persist user info for client-side components
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await signOutUser();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    router.push("/login");
    router.refresh(); // Ensure the layout refreshes to pick up the logged-out state
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
