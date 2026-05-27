import { Link, useLocation } from "react-router-dom";

export default function AutoBreadcrumb() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link to="/">Dashboard</Link>
        </li>

        {paths.map((path, index) => {
          const to = "/" + paths.slice(0, index + 1).join("/");
          const isLast = index === paths.length - 1;

          return (
            <li
              key={to}
              className={`breadcrumb-item ${isLast ? "active" : ""}`}
            >
              {isLast ? path : <Link to={to}>{path}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
