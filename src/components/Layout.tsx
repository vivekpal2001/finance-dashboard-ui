import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  toggleTheme,
  setRole,
  toggleSidebar,
  setSidebarOpen,
} from "../store/slices/uiSlice";
import {
  Home,
  CreditCard,
  PieChart,
  Target,
  Bell,
  LogOut,
  Moon,
  Sun,
  Shield,
  ShieldAlert,
  Menu,
  X,
  FileText,
  BarChart2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import QuickAdd from "./QuickAdd";

export default function Layout() {
  const dispatch = useAppDispatch();
  const { theme, role, sidebarOpen } = useAppSelector((state) => state.ui);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Close menus on route change
  useEffect(() => {
    dispatch(setSidebarOpen(false));
    setMobileMenuOpen(false);
  }, [location.pathname, dispatch]);

  const sidebarIcons = [
    { icon: Home, path: "/", label: "Home" },
    { icon: CreditCard, path: "/transactions", label: "Transactions" },
    { icon: PieChart, path: "/insights", label: "Insights" },
    { icon: Target, path: "/goals", label: "Goals" },
  ];

  const topNav = [
    { label: "Dashboard", path: "/" },
    { label: "Transaction", path: "/transactions" },
    { label: "Report", path: "/insights" },
    { label: "Goals", path: "/goals" },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#f4f5f7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-3 sm:p-4 md:p-6 lg:p-8 lg:pl-[7.5rem] flex gap-4 md:gap-6 transition-colors duration-300 font-sans pb-20 lg:pb-8">

      {/* Desktop Floating Sidebar — hidden on mobile */}
      <aside
        className={cn(
          "fixed inset-y-4 left-4 z-50 w-20 bg-white dark:bg-gray-900 rounded-[40px] py-8 shadow-sm border border-gray-100 dark:border-gray-800 flex-col items-center transform transition-transform duration-300 ease-in-out hidden lg:flex lg:fixed lg:inset-y-8 lg:left-8",
        )}
      >
        <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center mb-8 shadow-md">
          <Home className="w-6 h-6 text-white dark:text-gray-900" />
        </div>

        <nav className="flex-1 flex flex-col gap-4 relative">
          {sidebarIcons.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 z-10",
                  isActive
                    ? "text-orange-500 dark:text-orange-400"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-orange-50 dark:bg-orange-500/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5" />
              </NavLink>
            );
          })}
        </nav>

        <div className="flex flex-col gap-4 mt-auto">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header — only visible on sm+ (tablet/desktop) */}
        <div className="w-full max-w-7xl mx-auto hidden sm:block">
          <header className="flex flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              {/* Top Nav Pill */}
              <div className="bg-white dark:bg-gray-900 rounded-full p-1.5 flex shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto hide-scrollbar relative">
                {topNav.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/" &&
                      location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "relative px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap z-10",
                        isActive
                          ? "text-white"
                          : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="topnav-active"
                          className="absolute inset-0 bg-[#FF6B4A] rounded-full shadow-md shadow-orange-500/20 -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Right Header Actions — Desktop/Tablet */}
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-full p-1.5 pr-4 shadow-sm border border-gray-100 dark:border-gray-800 shrink-0">
              <button
                onClick={() =>
                  dispatch(setRole(role === "admin" ? "viewer" : "admin"))
                }
                className="flex items-center px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                {role === "admin" ? (
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-[#FF6B4A]" />
                ) : (
                  <Shield className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                )}
                {role === "admin" ? "Admin" : "Viewer"}
              </button>
              <div className="flex items-center gap-2 px-3 border-x border-gray-100 dark:border-gray-800">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  12
                </span>
              </div>
              <div className="flex items-center gap-3 pl-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="hidden md:block text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white leading-none">
                    Vivek Kumar
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">Co-Founder</p>
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* Mobile Header — Quick Add left, hamburger right */}
        <div className="sm:hidden flex items-center justify-between mb-4 px-1">
          <QuickAdd />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar pb-4 sm:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] mobile-bottom-nav">
        <div className="flex items-center justify-around px-2 py-2">
          {sidebarIcons.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[64px]",
                  isActive
                    ? "text-[#FF6B4A]"
                    : "text-gray-400",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomnav-active"
                    className="absolute inset-0 bg-orange-50 dark:bg-orange-500/10 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Mobile Floating Dark Mode Toggle */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="lg:hidden fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-transform"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>

      {/* Floating Quick Add — Tablet (sm to lg) */}
      <div className="hidden sm:block lg:hidden fixed bottom-8 right-8 z-40">
        <QuickAdd />
      </div>
      {/* Floating Quick Add — Desktop (lg+) */}
      <div className="hidden lg:block fixed bottom-8 right-8 z-40">
        <QuickAdd />
      </div>

      {/* Mobile Hamburger Menu Popup */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed top-4 right-4 z-[61] w-72 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Section */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Rahul Sharma</p>
                    <p className="text-xs text-gray-400 font-medium">Co-Founder</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                {/* Role Toggle */}
                <button
                  onClick={() => {
                    dispatch(setRole(role === "admin" ? "viewer" : "admin"));
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {role === "admin" ? (
                    <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-[#FF6B4A]" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {role === "admin" ? "Admin Mode" : "Viewer Mode"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">Tap to switch role</p>
                  </div>
                </button>

                {/* Notifications */}
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center relative">
                    <Bell className="w-4 h-4 text-red-500" />
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">12</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                    <p className="text-[10px] text-gray-400 font-medium">12 unread alerts</p>
                  </div>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    {theme === "light" ? (
                      <Moon className="w-4 h-4 text-violet-500" />
                    ) : (
                      <Sun className="w-4 h-4 text-violet-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">Switch appearance</p>
                  </div>
                </button>

                {/* Logout */}
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Logout</p>
                    <p className="text-[10px] text-gray-400 font-medium">Sign out of account</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
