import {
  clearAuthCookies,
  getCookie,
  setCookie,
} from "@/configs/cookie.config";
import { instance } from "@/configs/instance";
import {
  ICreateCompanyWithUser,
  ICreateOtp,
  IUserLogin,
  IUserResponse,
} from "@/types/company";

export const createCp = async (
  entry: ICreateCompanyWithUser,
): Promise<{ message: string }> => {
  const { data } = await instance.post("company/register", entry);
  return data;
};

export const verifyHash = async (
  entry: ICreateOtp,
): Promise<{ accessToken: string }> => {
  const { data } = await instance.patch("company/verify-otp", entry);
  await setCookie("accessToken", data.accessToken);
  return data;
};

export const loginUser = async (
  entry: IUserLogin,
): Promise<{ message: string }> => {
  const { data } = await instance.post("/auth/login", entry);
  return data;
};

export const getUser = async (): Promise<IUserResponse> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getAccess = async () => {
  const { data } = await instance.get("auth/get-access");
  return data;
};

export const logoutUser = async (): Promise<{ message: "string" }> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.delete("auth/logout", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await clearAuthCookies();

  return data;
};
