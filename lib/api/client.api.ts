import { getCookie } from "@/configs/cookie.config";
import { instance } from "@/configs/instance";
import { IClient, ICreateClient } from "@/types/company";

export const getClientFromCompany = async (id: string): Promise<IClient[]> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.get(`/client/clients?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createNewClientFromCompany = async (
  id: string,
  entry: ICreateClient,
): Promise<IClient> => {
  const token = await getCookie("accessToken")!;
  const { data } = await instance.post(
    `/client/create-client?id=${id}`,
    entry,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};
