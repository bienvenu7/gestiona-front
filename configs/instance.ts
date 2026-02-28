import axios, { AxiosError } from "axios";
import { config } from "./en.config";
import { getAccess } from "@/lib/api/authentication.api";
import { setCookie } from "./cookie.config";

export const baseURL =
  (process.env.NODE_ENV === "production"
    ? config.api.baseUrl
    : config.api.baseDevUrl) + "/v1/";

export const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Network / CORS / timeout
    if (!error.response) {
      return Promise.reject({
        status: 500,
        message: "Network error",
      });
    }

    const { status, data } = error.response;

    return Promise.reject({
      status,
      message: data?.message || "Something went wrong",
      errors: data?.errors || null, // for validation errors
      raw: error, // optional, for debugging
    });
  },
);

let isRefreshing = false;

let failedQueue = [];

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Éviter les boucles infinies
    if (error.response?.status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Appel au endpoint de refresh (le cookie est envoyé automatiquement)
        const { accessToken } = await getAccess();

        setCookie("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Le nouveau access token est aussi en cookie, donc pas besoin de le récupérer
        isRefreshing = false;

        // Réessayer la requête originale
        return instance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Rediriger vers login ou dispatch d'une action de déconnexion
        // window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
