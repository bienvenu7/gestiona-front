import { getCookie } from "@/configs/cookie.config";
import { instance } from "@/configs/instance";
import {
  ICreateUserResponse,
  IPaymentStats,
  IUserResponse,
  IcreateUserFromOwner,
} from "@/types/company";
import { ICreateOrder, IOrder, IPaymentData } from "@/types/socket";

export const getUsers = async (id: string): Promise<ICreateUserResponse[]> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.get(`/company/users?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createUser = async (
  entry: IcreateUserFromOwner,
): Promise<ICreateUserResponse> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.post(`/company/create-user`, entry, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createCompanyOrder = async (
  entry: ICreateOrder,
): Promise<IOrder> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.post(`/order/create-order`, entry, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createPayment = async (entry: IPaymentData): Promise<IOrder> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.post(`/order/pay-order`, entry, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getCompanyOrder = async (
  id: string,
  clientName: string,
  startDate: string | null,
  endDate: string | null,
): Promise<IOrder[]> => {
  const token = await getCookie("accessToken")!;

  if (clientName.length >= 3 && startDate && endDate) {
    const { data } = await instance.get(
      `/order/orders?id=${id}&clientName=${clientName}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  }

  if (clientName.length >= 3) {
    const { data } = await instance.get(
      `/order/orders?id=${id}&clientName=${clientName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  }

  if (startDate && endDate) {
    const { data } = await instance.get(
      `/order/orders?id=${id}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  }

  const { data } = await instance.get(`/order/orders?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getPayments = async (
  id: string,
): Promise<ICreateUserResponse[]> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.get(`/order/payments?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getPaymentStats = async (id: string): Promise<IPaymentStats> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.get(`/order/payments-stats?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
