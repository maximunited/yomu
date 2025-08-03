"use client";

import { useState, useEffect } from "react";

export function DynamicYear() {
  const [year, setYear] = useState(2025); // Default fallback year
  
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  return <>{year}</>;
} 