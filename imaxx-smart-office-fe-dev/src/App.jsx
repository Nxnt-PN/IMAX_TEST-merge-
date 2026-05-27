// App.jsx
import { Outlet, Navigate, useLocation, useNavigate, useNavigation } from "react-router-dom";
import { useSelector } from "react-redux";
import RouteLoader from "@/components/RouteLoader";
import { Suspense, useEffect, useMemo, useState } from "react";
import WebSocketComponent from "./components/WebSocket";
import {
  selectIsAuthenticated,
} from "@/stores/slices/authSlice";

export default function App() {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);



  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return (
    <>
        {/* {loading && <RouteLoader />} */}
        <WebSocketComponent />
        <Outlet />
    </>
  );
}