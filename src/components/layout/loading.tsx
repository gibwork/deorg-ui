import React from "react";

function Loading() {
  return (
    <div className="pt-20 flex items-center justify-center gap-2">
      <div className="w-4 h-4 rounded-full animate-pulse bg-violet-500" />
      <div className="w-4 h-4 rounded-full animate-pulse bg-violet-500" />
      <div className="w-4 h-4 rounded-full animate-pulse bg-violet-500" />
    </div>
  );
}

export default Loading;
