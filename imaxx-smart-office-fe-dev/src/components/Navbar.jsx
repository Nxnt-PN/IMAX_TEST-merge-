import { useDispatch, useSelector } from "react-redux";
import {
  selectUsername,
  selectFullname,
  logoutUser,
} from "@/stores/slices/authSlice";
import ProfileViewer from "@/components/ProfileViewer";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next"
import NotificationUnreads from "./NotificationUnread";
import { selectAllUnreadData } from "@/stores/slices/notificationSlice";
import { saveTranslationToLocalStorage, getTranslationFromLocalStorage } from "../utils/helpers";
import { useEffect } from "react";

const onLogout = (navigate, dispatch) => {
  dispatch(logoutUser({ navigate })).then(() => {
    toast.success("Logout Successfully");
  });
};

Navbar.propTypes = {
  onOpenProfile: PropTypes.func,
};




export default function Navbar({ onOpenProfile, sidebarStatus, onClickSidebar, isMobile }) {
  const { t, i18n } = useTranslation();
  const username = useSelector(selectUsername);
  const fullname = useSelector(selectFullname);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allUnreadNotifications = useSelector(selectAllUnreadData);

  // ============ Function ================
  const onClickProfile = () => {
    onOpenProfile(true);
  };

  const onClickNotification = () => {
    navigate("/notifications");
  }

  const switchLanguage =  (lang) => {
    const newLang = lang == 'th' ? 'en': 'th'
    i18n.changeLanguage(newLang)
    saveTranslationToLocalStorage(newLang)
  }

  useEffect(() => {
    const curLang = getTranslationFromLocalStorage()
    if (curLang) {
      i18n.changeLanguage(curLang)
    }
  }, [])




  return (
    <div className="d-flex align-items-center w-100 p-0 justify-content-between pe-3 ">
      <header>
        <div className="logo user-select-none" >
          <NavLink to={{pathname:"/", state:null}} >
            <div className="logo-company">
              <span className="fw-bold first">iMAXX</span>
              <span className="second"> Solution</span>
            </div>
            <span className="logo-system">Smart Office</span>
          </NavLink>
        </div>
        <button
          className="btn toggle"
          onClick={onClickSidebar}
        >
          <FontAwesomeIcon
            icon={faBars}
            className=""
          />
        </button>
      </header>
      <div className="d-flex justify-content-end align-items-center">
        <div className="lang-switch me-2">
          <button onClick={() => switchLanguage(i18n.language)} className="btn text-uppercase">{ i18n.language }</button>

        </div>
        <button
          className="btn me-2 px-2 py-1 position-relative d-block d-md-none"
          type="button"
          onClick={onClickNotification}
        >
          <FontAwesomeIcon icon={faBell} />
          <span className={allUnreadNotifications?.length > 0 ? 'nav-noti-danger-pill' : 'nav-noti-pill'}></span>
        </button>
        <div className="dropdown notification-unread d-none d-md-block">
          <button
          className="btn me-2 px-2 py-1 position-relative"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <FontAwesomeIcon icon={faBell} />
          <span className={allUnreadNotifications?.length > 0 ? 'nav-noti-danger-pill' : 'nav-noti-pill'}></span>
        </button>
          <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: '350px' }}>
            <NotificationUnreads />
            <li><hr className="dropdown-divider"/></li>
            <li><NavLink to={'/notifications'} className="dropdown-item text-center bg-white text-dark fs-6" end>{ t("common:label.view-all-notification") }</NavLink></li>
          </ul>
        </div>
        <div className="user-button btn-group">
          <button
            type="button"
            className="btn navbar-btn dropdown-toggle nav-user-avatar"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <ProfileViewer name={fullname} filePath={null} size={10} className="" profileFor="me" />
            <div className="text-capitalize mx-1 username d-none d-md-block">{username}</div>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={() => onClickProfile()}>
                { t('common:menu.my-profile')}
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => onLogout(navigate, dispatch)}
              >
                { t("common:menu.logout") }
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
