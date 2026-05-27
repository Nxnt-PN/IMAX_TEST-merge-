import { Outlet } from "react-router-dom";
// Components
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProfileModal from "@/components/ProfileModal"
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function useIsMobile({ breakpoint = 768, setSidebarStatus }) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof globalThis.window === "undefined"
      ? false
      : globalThis.window.innerWidth < breakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(globalThis.window.innerWidth < breakpoint);
    };

    globalThis.window.addEventListener("resize", handleResize);
    handleResize();

    return () => globalThis.window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  useEffect(() => {
    const sidebarEl = document.getElementById("sidebarElement");
    if (!sidebarEl) return;

    if (isMobile) {
      sidebarEl.classList.remove("open", "mini");
      sidebarEl.classList.add("close");
      setSidebarStatus("close");
    } else {
      sidebarEl.classList.remove("close");
      sidebarEl.classList.add("open");
      setSidebarStatus("open");
    }
  }, [isMobile, setSidebarStatus]);

  return isMobile;
}

export default function MainLayout(props) {
  const location = useLocation()
  const [openProfileModal, setOpenProfileModal] = useState(false)
  const [sidebarStatus, setSidebarStatus] = useState("open")
  const isMobile = useIsMobile({ breakpoint: 768, setSidebarStatus});

  const onClickSidebar = ()=>{
    console.log("click sidebar", sidebarStatus, isMobile)
    let status = null
    if(sidebarStatus === "open" && !isMobile){
      status = "mini"
    } else if(sidebarStatus === "mini" && !isMobile) {
      status = "open"
    } else if(["open","mini"].includes(sidebarStatus) && isMobile){
      status = "close"
    } else if(sidebarStatus === "close" && isMobile) {
      status = "open"
    } else {
      status = "open"
    }
    setSidebarStatus(status)
  }

  return (
    <div className="layout">
        <header className="navbar-block navbar">
          <Navbar
            isMobile={isMobile}
            onOpenProfile={(value)=>setOpenProfileModal(value)}
            sidebarStatus={sidebarStatus}
            onClickSidebar={onClickSidebar} />
        </header>
        <main className="content-container">
            <Sidebar  sidebarStatus={sidebarStatus} setSidebarStatus={setSidebarStatus} isMobile={isMobile} />
            <div className="content-block"><Outlet key={location.pathname} /></div>
        </main>
        <ProfileModal open={openProfileModal}  onClose={()=>setOpenProfileModal(false)} />
    </div>
  );
}
