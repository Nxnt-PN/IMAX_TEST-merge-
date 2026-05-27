import { hasAllPermissions, hasAnyPermission, hasPermission } from "@/utils/helpers";
import PropTypes from "prop-types";

Can.propTypes = {
  permissions: PropTypes.array,
  children: PropTypes.node,
  required: PropTypes.array,
  isAll: PropTypes.bool
}

export default function Can({permissions,  children, required = [], isAll = true}) {
  if (isAll && required.length > 0 && !hasAllPermissions(permissions, required)) {
    return null;
  }
  if (!isAll && required.length > 0 && !hasAnyPermission(permissions, required)) {
    return null;
  }
  return children;
}
