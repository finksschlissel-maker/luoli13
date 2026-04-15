import React from "react";
import { NavLink } from "react-router-dom";
import { Camera, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border-color pb-safe z-50 print:hidden">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-ink border-t-2 border-ink -mt-[2px]" : "text-gray-400 hover:text-ink"
            )
          }
        >
          <Camera className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-widest font-semibold">错题识别</span>
        </NavLink>
        <NavLink
          to="/mistakes"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-ink border-t-2 border-ink -mt-[2px]" : "text-gray-400 hover:text-ink"
            )
          }
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-widest font-semibold">历史错题本</span>
        </NavLink>
      </div>
    </div>
  );
}
