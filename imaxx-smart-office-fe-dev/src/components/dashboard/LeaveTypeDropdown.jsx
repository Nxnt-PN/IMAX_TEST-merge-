import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function LeaveTypeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const leaveTypes = useMemo(() => [
    { value: "ALL", label: t("common:dashboard.all"), color: "#ffffff" },
    { value: "ABSENCE", label: t("common:leave-type.absence"), color: "#22c55e" },
    { value: "SICK", label: t("common:leave-type.sick"), color: "#ef4444" },
    { value: "ANNUAL", label: t("common:leave-type.annual"), color: "#3b82f6" },
    { value: "OTHER", label: t("common:leave-type.other"), color: "#9ca3af" },
  ], [t]);

  const selected = leaveTypes.find((item) => item.value === value) || leaveTypes[0];

  return (
    <div style={{ position: "relative", width: 180 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          cursor: "pointer",
          background: "white",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: selected.color,
            border: selected.value === "ALL" ? "1px solid #d1d5db" : "none", // เพิ่มขอบให้สีขาวมองเห็นชัดขึ้น
          }}
        />
        <span style={{ flex: 1 }}>{selected.label}</span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            width: "100%",
            background: "white",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(0,0,0,.08)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {leaveTypes.map((item) => {
            const isActive = item.value === value;

            return (
              <div
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  cursor: "pointer",
                  background: isActive ? "#f3f4f6" : "white",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = isActive ? "#f3f4f6" : "white")
                }
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: item.color,
                    border: item.value === "ALL" ? "1px solid #d1d5db" : "none",
                  }}
                />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <span style={{ color: "#10b981" }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}