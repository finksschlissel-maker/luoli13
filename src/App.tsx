/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { RecognizePage } from "./pages/RecognizePage";
import { MistakeBookPage } from "./pages/MistakeBookPage";
import { BottomNav } from "./components/BottomNav";
import { cn } from "./lib/utils";

function Header() {
  return (
    <header className="hidden lg:flex bg-surface border-b border-border-color px-10 py-6 justify-between items-center sticky top-0 z-50 print:hidden">
      <div className="font-serif text-2xl font-bold tracking-tight text-ink">智学·错题宝</div>
      <nav className="flex gap-8">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "text-[14px] font-semibold uppercase tracking-widest pb-1 transition-colors",
            isActive ? "text-ink border-b-2 border-ink" : "text-gray-400 hover:text-ink"
          )}
        >
          拍照识别
        </NavLink>
        <NavLink 
          to="/mistakes" 
          className={({ isActive }) => cn(
            "text-[14px] font-semibold uppercase tracking-widest pb-1 transition-colors",
            isActive ? "text-ink border-b-2 border-ink" : "text-gray-400 hover:text-ink"
          )}
        >
          历史错题本
        </NavLink>
      </nav>
      <div className="text-[13px] font-medium text-ink">用户：学习者</div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col lg:h-[calc(100vh-81px)]">
          <Routes>
            <Route path="/" element={<RecognizePage />} />
            <Route path="/mistakes" element={<MistakeBookPage />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
