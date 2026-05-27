// App.jsx
import { Outlet, useLocation } from "react-router-dom";
import RouteLoader from "@/components/RouteLoader";
import { useEffect, useState } from "react";

export default function BlankLayout() {
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  return (
    <>
      {/* {loading && <RouteLoader />} */}
      <Outlet />
    </>
  );
}
