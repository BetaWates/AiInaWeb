// ============================================================
// REUSABLE: LoadingSpinner
// ============================================================

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullPage?: boolean;
}

const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label = "Loading...",
  fullPage = false,
}) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeMap[size]} animate-spin rounded-full border-2 border-muted border-t-primary`} />
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
};
