import { io, Socket } from "socket.io-client";
import cookies from "js-cookie";
import { config } from "./en.config";

const token = cookies.get("accessToken");

export const socket: Socket = io(
  process.env.NODE_ENV === "production"
    ? config.api.baseUrl
    : config.api.baseDevUrl,
  {
    autoConnect: false,
    withCredentials: true,
    auth: {
      token,
    },
  },
);
