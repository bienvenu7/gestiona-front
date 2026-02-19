"use client";
import { clearAuthCookies, getCookie } from "@/configs/cookie.config";
import { getUser } from "@/lib/api/authentication.api";
import { IUserResponse } from "@/types/company";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ---------------------------
// TYPES
// ---------------------------
interface AuthState {
  isAuthenticated: boolean;
  user: IUserResponse | null;
  isLoading: boolean;
  error: string | null;
  selectedCode?: string | null;
}

interface AuthContextType {
  state: AuthState;
  resetState: () => void;
  fillState: (user: IUserResponse) => void;
  setSelectedCode: (code: string) => void;
}

// ---------------------------
// CONTEXT
// ---------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
    selectedCode: null,
  });

  const router = useRouter();

  // ---------------------------
  // INITIAL TOKEN VALIDATION
  // ---------------------------
  useEffect(() => {
    console.log("begin");
    const initializeAuth = async () => {
      const isOnLoginPage = location.pathname.startsWith("/auth");

      console.log("enter");

      try {
        const user = await getUser(); // validate token
        console.log("try");

        console.log(user);

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user,
          isLoading: false,
          error: null,
        }));

        // Redirect from login page to last real page
        if (isOnLoginPage) {
          router.push("/dashboard");
        }
      } catch (e) {
        console.log(e);
        clearAuthCookies();
        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          error: "Token validation failed",
        }));
      }
    };

    initializeAuth();
  }, []);

  // ---------------------------
  // ACTIONS
  // ---------------------------
  const resetState = () => {
    clearAuthCookies();
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      selectedCode: null,
    });
  };

  const fillState = (user: IUserResponse) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user,
      isLoading: false,
      error: null,
    }));
  };

  const setSelectedCode = (code: string) => {
    setState((prev) => ({ ...prev, selectedCode: code || null }));
  };

  const value: AuthContextType = {
    state,
    resetState,
    fillState,
    setSelectedCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ---------------------------
// HOOK
// ---------------------------
export const Auth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Auth must be used within an AuthProvider");
  }
  return context;
};
