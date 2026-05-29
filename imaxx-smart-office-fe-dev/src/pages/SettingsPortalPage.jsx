import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faDatabase,
  faFileInvoiceDollar,
  faFileLines,
  faGear,
  faLocationDot,
  faSitemap,
} from "@fortawesome/free-solid-svg-icons";
import AutoBreadcrumb from "@/components/AutoBreadcrumb";

export default function SettingsPortalPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const systems = [
    {
      title: t("common:settings-portal.core.title"),
      description: t("common:settings-portal.core.description"),
      icon: faGear,
      accent: "primary",
      items: [
        { name: t("common:menu.workflow"), path: "/settings/workflow", icon: faSitemap },
        { name: t("common:menu.system"), path: "/settings/systems", icon: faDatabase },
      ],
    },
    {
      title: t("common:settings-portal.leave.title"),
      description: t("common:settings-portal.leave.description"),
      icon: faFileLines,
      accent: "success",
      items: [
        { name: t("common:menu.leave-quota"), path: "/settings/leave-quotas", icon: faFileLines },
      ],
    },
    {
      title: t("common:settings-portal.pettycash.title"),
      description: t("common:settings-portal.pettycash.description"),
      icon: faFileInvoiceDollar,
      accent: "info",
      items: [
        { name: t("common:menu.pettycash-projects"), path: "/pettycash/projects", icon: faFileInvoiceDollar },
        { name: t("common:menu.pettycash-reasons"), path: "/pettycash/reasons", icon: faFileLines },
        { name: t("common:menu.locations"), path: "/settings/locations", icon: faLocationDot },
      ],
    },
  ];

  return (
    <>
      <div className="breadcrumb">
        <AutoBreadcrumb />
      </div>

      <div className="content-wrapper">
        <div className="page-header">
          <div>
            <h1>{t("common:titles.setting.name")}</h1>
            <p>{t("common:titles.setting.subtitle")}</p>
          </div>
        </div>

        <div className="row g-3">
          {systems.map((system) => (
            <div className="col-12 col-lg-4" key={system.title}>
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className={`settings-portal-icon text-${system.accent}`}>
                      <FontAwesomeIcon icon={system.icon} />
                    </div>
                    <div>
                      <h5 className="card-title mb-1">{system.title}</h5>
                      <p className="card-text text-muted mb-0">
                        {system.description}
                      </p>
                    </div>
                  </div>

                  <div className="list-group list-group-flush">
                    {system.items.map((item) => (
                      <button
                        className="list-group-item list-group-item-action d-flex align-items-center gap-3 px-0"
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        type="button"
                      >
                        <FontAwesomeIcon icon={item.icon} className="text-muted" />
                        <span className="fw-semibold">{item.name}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="ms-auto text-muted" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
