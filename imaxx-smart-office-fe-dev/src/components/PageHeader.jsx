import propTypes from "prop-types";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header mb-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 justify-content-center">
        <div>
          <h3 className="mb-1 text-capitalize">{title}</h3>
          {subtitle && (
            <div className="text-muted small">{subtitle}</div>
          )}
        </div>

        {action && (
          <div className="page-header-action ">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

PageHeader.propTypes = {
  title: propTypes.string.isRequired,
  subtitle: propTypes.string,
  action: propTypes.node,
};
