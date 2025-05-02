import React from "react";

function LoaderDots() {
  return (
    <div>
      <div className="loader-dots block relative w-20 h-5 mt-2">
        <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-theme"></div>
        <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-theme"></div>
        <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-theme"></div>
        <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-theme"></div>
      </div>
    </div>
  );
}

export default LoaderDots;
