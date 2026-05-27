import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faMinus,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { faHome, faUser, faListAlt, faFile } from "@fortawesome/free-regular-svg-icons";
import { useEffect, useState, useRef } from "react";
import { selectPermissions } from "@/stores/slices/authSlice";
import {
  selectSelectedData,
} from "@/stores/slices/menuStatusSlice";
import { useSelector } from "react-redux";
import { PERMISSION } from "@/constants/permission/permissionEnum";
import Can from "@/components/Can";
import Tooltip from "@/components/Tooltip";
import { useTranslation } from "react-i18next";

// global constant
const menuList = ({ t, menuStatus }) => [
  {
    id: "dashboard",
    name: t("common:menu.dashboard"),
    link: "/",
    icon: faHome,
    permissions: [],
  },
  {
    id: "my-leaves",
    name: t("common:menu.my-leave"),
    link: "/leave-requests/my-leaves",
    icon: faListAlt,
    permissions: [PERMISSION.VIEW_LEAVE_FORM],
  },
  {
    id: "my-leave-tasks",
    name: t("common:menu.my-task"),
    link: "/leave-requests/my-tasks",
    icon: faListAlt,
    noti: menuStatus?.my_task_count || 0,
    permissions: [PERMISSION.VIEW_MY_TASK],
  },
  {
    id: "report",
    section: "report",
    permissions: [PERMISSION.VIEW_REPORT], // this permissions is for set section show not includes children
    children: [
      {
        id: "report",
        name: t("common:menu.report"),
        icon: faFile,
        permissions: [PERMISSION.VIEW_REPORT],
        children: [
          {
            id: "leave-summary-report",
            name: t("common:menu.summary-report"),
            link: "/leave-requests/summary-report",
            icon: faFile,
            permissions: [PERMISSION.VIEW_REPORT],
          },
          {
            id: "leave-staff-report",
            name: t("common:menu.staff-report"),
            link: "/leave-requests/staff-report",
            icon: faFile,
            permissions: [PERMISSION.VIEW_REPORT],
          },
        ],
      },
    ],
  },
  {
    id: "admin",
    section: "ADMIN",
    permissions: [
      PERMISSION.VIEW_USER,
      PERMISSION.VIEW_ROLE,
      PERMISSION.VIEW_LEAVE_QUOTA,
      PERMISSION.VIEW_WORKFLOW,
      PERMISSION.VIEW_SYSTEM,
    ], // this permissions is for set section show not includes children
    children: [
      {
        id: "user-management",
        name: t("common:menu.user-management"),
        icon: faUser,
        permissions: [PERMISSION.VIEW_USER, PERMISSION.VIEW_ROLE],
        children: [
          {
            id: "users",
            name: t("common:menu.user"),
            link: "/user-management/users",
            icon: faMinus,
            permissions: [PERMISSION.VIEW_USER],
          },
          {
            id: "roles",
            name: t("common:menu.role"),
            link: "/user-management/roles",
            icon: faMinus,
            permissions: [PERMISSION.VIEW_ROLE],
          },
        ],
      },
      {
        id: "settings",
        name: t("common:menu.setting"),
        icon: faGear,
        permissions: [
          PERMISSION.VIEW_LEAVE_QUOTA,
          PERMISSION.VIEW_WORKFLOW,
          PERMISSION.VIEW_SYSTEM,
        ],
        children: [
          {
            id: "leave-quotas",
            name: t("common:menu.leave-quota"),
            link: "/settings/leave-quotas",
            icon: faMinus,
            permissions: [PERMISSION.VIEW_LEAVE_QUOTA],
          },
          {
            id: "workflow",
            name: t("common:menu.workflow"),
            link: "/settings/workflow",
            icon: faMinus,
            permissions: [PERMISSION.VIEW_WORKFLOW],
          },
          {
            id: "systems",
            name: t("common:menu.system"),
            link: "/settings/systems",
            icon: faMinus,
            permissions: [PERMISSION.VIEW_SYSTEM],
          },
        ],
      },
    ],
  },
];

// Props type validate

// Components
function MenuComponent({
  sidebarStatus,
  setSidebarStatus,
  isMobile,
  menuStatus,
}) {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const authPermissions = useSelector(selectPermissions);

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebarMini = document
        .getElementById("sidebarElement")
        ?.classList.contains("mini");
      if (!sidebarMini) {
        return;
      }
      if (
        openMenu !== null &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const onClickLink = () => {
    if (isMobile) {
      console.log("close sidebar");
      setSidebarStatus("close");
    }
  };

  return (
    <ul className="menu" ref={menuRef}>
      {menuList({ t, menuStatus }).map((item) => (
        <div key={item.id}>
          {/* ===== Section ===== */}
          {item.section && (
            <Can required={item.permissions} permissions={authPermissions}>
              <li className="nav-section">
                <span className="text text-uppercase">{item.section} </span>
              </li>
            </Can>
          )}

          {/* ===== Normal Menu ===== */}
          {item.link && (
            <Can required={item.permissions} permissions={authPermissions}>
              <li className="nav-link">
                <Tooltip
                  label={item.name}
                  enabled={sidebarStatus === "open"}
                  placement="bottom"
                >
                  <NavLink
                    to={{
                      pathname: item.link,
                      state: null, // delete state
                    }}
                    className={`link position-relative`}
                    onClick={() => {
                      onClickLink();
                      toggleMenu(item.id);
                    }}
                  >
                    <FontAwesomeIcon icon={item.icon} className="icon" />
                    <span className="text text-capitalize">{item.name}</span>
                    {item.noti > 0 && (
                      <div className="noti-pill">
                        <span className="badge rounded-pill bg-danger">
                          {item.noti}
                        </span>
                      </div>
                    )}
                  </NavLink>
                </Tooltip>
              </li>
            </Can>
          )}

          {/* ===== Sub Menu ===== */}
          {item.children?.map((sub) => (
            <Can
              required={sub.permissions}
              permissions={authPermissions}
              key={sub.id}
            >
              <li className={`nav-link submenu`}>
                <div className="submenu-wrapper">
                  <Tooltip
                    label={sub.name}
                    enabled={sidebarStatus === "open"}
                    placement="top"
                  >
                    <button
                      className={`link pointer btn sidebar-btn w-100`}
                      onClick={() => toggleMenu(sub.id)}
                      type="button"
                    >
                      <FontAwesomeIcon icon={sub.icon} className="icon" />
                      <span className="text text-capitalize">{sub.name}</span>
                      <FontAwesomeIcon
                        icon={openMenu === sub.id ? faCaretUp : faCaretDown}
                        className="ms-auto icon caret-icon"
                      />
                    </button>
                  </Tooltip>
                  {/* ===== Child ===== */}
                  {openMenu === sub.id && (
                    <ul className="submenu-list">
                      {sub.children.map((child) => (
                        <Can
                          required={child.permissions}
                          permissions={authPermissions}
                          key={child.id}
                        >
                          <li className={`nav-link child`}>
                            <NavLink
                              to={{
                                pathname: child.link,
                                state: null, // delete state
                              }}
                              className="submenu-link"
                              onClick={onClickLink}
                              end
                            >
                              <FontAwesomeIcon
                                icon={child.icon}
                                className="submenu-icon"
                              />
                              <span className="submenu-text">{child.name}</span>
                            </NavLink>
                          </li>
                        </Can>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            </Can>
          ))}
        </div>
      ))}
    </ul>
  );
}
// Default Component
export default function Sidebar({ sidebarStatus, setSidebarStatus, isMobile }) {
  const authPermissions = useSelector(selectPermissions);
  const allMenuStatus = useSelector(selectSelectedData);

  return (
    <nav className={`sidebar ${sidebarStatus}`} id={"sidebarElement"}>
      <div className="menu-bar">
        <MenuComponent
          sidebarStatus={sidebarStatus}
          setSidebarStatus={setSidebarStatus}
          isMobile={isMobile}
          menuStatus={allMenuStatus}
        />
      </div>
    </nav>
  );
}
