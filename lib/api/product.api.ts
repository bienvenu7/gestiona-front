import { getCookie } from "@/configs/cookie.config";
import { instance } from "@/configs/instance";
import { IPs } from "@/hooks/useProduct";

export const createFromFile = async (d: IPs) => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.post(
    `product/create-products?id=${d.id}`,
    d.entry,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
};

export const createOneProduct = async (entry: IProducts) => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.post(`product/create-one`, entry, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getProducts = async (
  id: string,
): Promise<{ data: IProducts[] }> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.get(`product/get-products?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
