import {
  createFromFile,
  createOneProduct,
  getProducts,
} from "@/lib/api/product.api";
import { IProducts } from "@/types/socket";
import { useMutation, usePrefetchQuery, useQuery } from "@tanstack/react-query";

export interface IPs {
  entry: FormData;
  id: string;
}

export const useCreateManyProduct = () => {
  const {
    mutateAsync: createProducts,
    data,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["create/products"],
    mutationFn: async (ds: IPs) => await createFromFile(ds),
  });
  return { error, isPending, data, createProducts };
};

export const useCreateOneProduct = () => {
  const {
    mutateAsync: asyncCreateProduct,
    data,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["create/product"],
    mutationFn: async (entry: IProducts) => await createOneProduct(entry),
  });
  return { error, isPending, data, asyncCreateProduct };
};

export const useGetProducts = (id: string | undefined) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["get/products"],
    queryFn: async () => getProducts(id!),
    enabled: id === undefined ? false : true,
  });
  return { error, isPending, data };
};

export const useGetProductsPrefetch = (id: string | undefined) => {
  usePrefetchQuery({
    queryKey: ["get/products"],
    queryFn: async () => getProducts(id!),
  });
};
