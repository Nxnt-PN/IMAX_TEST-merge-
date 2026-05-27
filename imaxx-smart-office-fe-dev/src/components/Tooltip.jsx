import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingArrow,
  arrow,
} from "@floating-ui/react";
import { useState, useRef, useEffect } from "react";

export default function Tooltip({
  children,
  label,
  placement = "right",
  enabled = true,
}) {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: enabled ? open : false,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { enabled, move: false });
  const focus = useFocus(context, { enabled });
  const dismiss = useDismiss(context, { enabled });
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  // ปิด tooltip ทันทีถ้า disabled
  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </span>

      {enabled && open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="sidebar-tooltip"
            {...getFloatingProps()}
          >
            {label}

            {/* 🔻 Arrow */}
            <FloatingArrow
              ref={arrowRef}
              context={context}
              className="sidebar-tooltip-arrow"
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
