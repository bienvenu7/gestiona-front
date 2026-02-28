import {
  createNewClientFromCompany,
  getClientFromCompany,
} from "@/lib/api/client.api";
import { ICreateClient } from "@/types/company";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateClient = (id: string | undefined) => {
  const {
    mutateAsync: asyncCreateClient,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["create/client", id],
    mutationFn: async (entry: ICreateClient) =>
      await createNewClientFromCompany(id!, entry),
  });
  return { error, isPending, asyncCreateClient };
};

export const useGetClients = (id: string | undefined) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["get/clients", id],
    queryFn: async () => getClientFromCompany(id!),
    enabled: id === undefined ? false : true,
  });
  return { error, isPending, data };
};
