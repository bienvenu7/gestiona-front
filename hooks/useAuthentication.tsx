import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCp,
  getUser,
  loginUser,
  logoutUser,
  verifyHash,
} from "@/lib/api/authentication.api";

export const useCreateCompany = () => {
  const {
    mutateAsync: createCompanyAsync,
    data: message,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["create/user"],
    mutationFn: createCp,
  });
  return { createCompanyAsync, message, error, isPending };
};

export const useCheckOtp = () => {
  const {
    mutateAsync: checkOtpFn,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["verify/otp"],
    mutationFn: verifyHash,
  });
  return { checkOtpFn, error, isPending };
};

export const useLoginUser = () => {
  const {
    mutateAsync: loginUserFn,
    error,
    isPending,
    data: message,
  } = useMutation({
    mutationKey: ["login/user"],
    mutationFn: loginUser,
  });
  return { loginUserFn, error, isPending, message };
};

export const useGetAuth = () => {
  const { data: authData } = useQuery({
    queryKey: [""],
    queryFn: getUser,
  });
  return authData;
};

export const useLogout = () => {
  const {
    data: message,
    error,
    isPending: isLogingOut,
    mutateAsync: logoutFn,
  } = useMutation({
    mutationKey: ["user/logout"],
    mutationFn: logoutUser,
  });
  return { message, error, isLogingOut, logoutFn };
};
