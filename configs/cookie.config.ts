"use server";
import { cookies } from "next/headers";

// Simple cookie utility functions
export const setCookie = async (
  name: string,
  value: string,
  days: number = 1,
) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  (await cookies()).set(name, value, {
    expires,
    path: "/",
    sameSite: "lax", // ✅ allow cross-site
    secure: process.env.NODE_ENV === "production", // ✅ requ
    httpOnly: false,
  });
};

export const getCookie = async (name: string): Promise<string | null> => {
  const cookieData = (await cookies()).get(name);
  return cookieData ? cookieData.value : null;
};

export const deleteCookie = async (data: string[]) => {
  data.forEach(async (name) => {
    (await cookies()).delete(name);
  });
};

export const clearAuthCookies = async () => {
  // Clear cookies with multiple approaches to handle Chrome caching
  const cookieNames = ["app_token", "accessToken"];

  (await cookies()).delete("app_token");
  (await cookies()).delete("accessToken");
  return;
};
