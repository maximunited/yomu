"use client";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "./Button";

interface DarkModeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function DarkModeToggle({ 
  variant = "ghost", 
  size = "sm", 
  showText = false,
  className = ""
}: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleDarkMode}
      className={className}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      )}
      {showText && (
        <span className="mr-2">
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </Button>
  );
} 