"use client";

import { Spinner } from "./ui/spinner";

type DbInteractionOverlayProps = {
  open: boolean;
  label?: string;
};

export const DbInteractionOverlay = ({
  open,
  label = "데이터베이스 요청 처리 중...",
}: DbInteractionOverlayProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/35"
      role="status"
      aria-live="polite"
      aria-busy
    >
      <div
        className="bg-background flex items-center gap-2 rounded-lg border px-4
          py-3 shadow-lg"
      >
        <Spinner />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
};
