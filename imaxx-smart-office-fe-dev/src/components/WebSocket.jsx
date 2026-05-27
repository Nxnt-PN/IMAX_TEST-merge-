import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectToken } from "@/stores/slices/authSlice";
import { toast } from "react-toastify";
import { config } from "@/config/config";
import { setMenuCounter } from "@/stores/slices/menuStatusSlice";
import { setUnread } from "@/stores/slices/notificationSlice";

export default function WebSocketComponent() {

  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  const socketRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const shouldReconnect = useRef(true);

  const pageNo = 1;
  const pageLimit = 5;

  useEffect(() => {

    if (!token) return;

    shouldReconnect.current = true;

    const connect = () => {

      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
         socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const socket = new WebSocket(
        `${config.apiWsURL}?token=${token}&page=${pageNo}&limit=${pageLimit}`
      );

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WS Connected");
      };

      socket.onmessage = (event) => {

        try {

          const { type, payload } = JSON.parse(event.data);

          if (type === "notification_alert") {

            if (payload.noti_unread) {
              dispatch(setUnread(payload.noti_unread));
            }

            if (payload.menu_counter) {
              dispatch(setMenuCounter(payload.menu_counter));
            }

          }

        } catch (err) {
          console.error("Invalid WebSocket message:", err);
          toast.error("Invalid WebSocket message received");
        }

      };

      socket.onerror = () => {
        console.error("WebSocket connection error");
      };

      socket.onclose = () => {

        console.warn("WS Disconnected");

        socketRef.current = null;

        if (shouldReconnect.current) {
          reconnectTimeout.current = setTimeout(connect, 5000);
        }

      };

    };

    connect();

    return () => {

      shouldReconnect.current = false;

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

    };

  }, [token, dispatch]);

  return null;
}