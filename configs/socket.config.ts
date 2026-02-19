import { io, Socket } from "socket.io-client";
import cookies from "js-cookie";

const token = cookies.get("accessToken");

export const socket: Socket = io("http://localhost:7001", {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token,
  },
});
