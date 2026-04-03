import React, { useEffect } from "react";
import classNames from "classnames";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Narrower modals on mobile from bottom sheet feel */
  className?: string;
};

/** Dimmed overlay + stops click propagation on content. */
export const KingdomModalShell: React.FC<Props> = ({
  open,
  onClose,
  title,
  children,
  className,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={classNames(
          "w-full max-w-md max-h-[88dvh] overflow-y-auto rounded-sm shadow-2xl outline-none",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <h2 className="sr-only">{title}</h2>
        ) : null}
        {children}
      </div>
    </div>
  );
};
