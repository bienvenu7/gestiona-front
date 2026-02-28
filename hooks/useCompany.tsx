import {
  createCompanyOrder,
  createPayment,
  createUser,
  getCompanyOrder,
  getOverviewStats,
  getPaymentStats,
  getPayments,
  getUsers,
} from "@/lib/api/company.api";
import { IcreateUserFromOwner } from "@/types/company";
import { ICreateOrder, IPaymentData } from "@/types/socket";
import { useMutation, useQuery, usePrefetchQuery } from "@tanstack/react-query";

export const useGetMembers = (id: string | undefined) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["get/members", id],
    queryFn: async () => getUsers(id!),
    enabled: id === undefined ? false : true,
  });
  return { error, isPending, data };
};

export const useGetMembersPrefecth = (id: string | undefined) => {
  usePrefetchQuery({
    queryKey: ["get/members"],
    queryFn: async () => getUsers(id!),
  });
};

export const useGetOrders = (
  id: string | undefined,
  clientName: string,
  startDate: string | null,
  endDate: string | null,
) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["get/orders", id, clientName, startDate, endDate],
    queryFn: async () => getCompanyOrder(id!, clientName, startDate, endDate),
    enabled: id === undefined ? false : true,
  });
  return { error, isPending, data };
};

export const useGetPayments = (
  id: string | undefined,
  startDate: string | null,
  endDate: string | null,
) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["get/payments", id, startDate, endDate],
    queryFn: async () => getPayments(id!, startDate, endDate),
    enabled: id === undefined ? false : true,
  });
  return { error, isPending, data };
};

export const useGetPaymentStats = (id: string | undefined) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["get/payments-stats", id],
    queryFn: async () => getPaymentStats(id!),
    enabled: id === undefined ? false : true,
  });
  return { error, isPending, data };
};

export const useGetOrdersPrefetch = (
  id: string | undefined,
  clientName: string,
  startDate: string | null,
  endDate: string | null,
) => {
  const u = usePrefetchQuery({
    queryKey: ["get/orders", `${clientName}`, startDate, endDate],
    queryFn: async () => getCompanyOrder(id!, clientName, startDate, endDate),
  });
};

export const useCreateMember = () => {
  const {
    mutateAsync: asyncCreate,
    data,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["create/member"],
    mutationFn: async (entry: IcreateUserFromOwner) => await createUser(entry),
  });
  return { error, isPending, data, asyncCreate };
};

export const useCreateOrder = () => {
  const {
    mutateAsync: asyncCreateOrder,
    data,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["create/order"],
    mutationFn: async (entry: ICreateOrder) => await createCompanyOrder(entry),
  });
  return { error, isPending, data, asyncCreateOrder };
};

export const useCreatePayment = () => {
  const {
    mutateAsync: asyncCreatePayment,
    data,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["create/payment"],
    mutationFn: async (entry: IPaymentData) => await createPayment(entry),
  });
  return { error, isPending, data, asyncCreatePayment };
};

export const useGetStatsOverview = (id: string | undefined) => {
  const now = new Date().toUTCString();
  const { data, error, isPending } = useQuery({
    queryKey: ["get/overview-stats", id],
    queryFn: async () => getOverviewStats(id!, now),
    enabled: id === undefined ? false : true,
  });
  return { error, isPending, data };
};
