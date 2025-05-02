"use client";
import React from "react";

function AnimatedLabel() {
  return (
    <span
      className="animate-fade-up custom-gradient  text-center font-display text-sm font-bold  text-transparent   drop-shadow-sm [text-wrap:balance] "
      style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
    >
      Featured
    </span>
  );
}

export default AnimatedLabel;
