import React, { useEffect } from "react";
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

export default function Layout() {
  const dispatch = useAppDispatch();
  const { theme, role, sidebarOpen } = useAppSelector((state) => state.ui);
  const location = useLocation();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    dispatch(setSidebarOpen(false));
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
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setSidebarOpen(false))}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Floating Sidebar — hidden on mobile (bottom nav used instead) */}
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
        {/* Header */}
        <div className="w-full max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mobile hamburger — opens sidebar overlay for settings only */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="lg:hidden p-2.5 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {/* Top Nav Pill */}
              <div className="bg-white dark:bg-gray-900 rounded-full p-1 sm:p-1.5 flex shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto hide-scrollbar flex-1 sm:flex-none relative">
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
                        "relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap z-10",
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

            {/* Right Header Actions */}
            <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-gray-900 rounded-full p-1 sm:p-1.5 pr-3 sm:pr-4 shadow-sm border border-gray-100 dark:border-gray-800 shrink-0 self-end sm:self-auto">
              <button
                onClick={() =>
                  dispatch(setRole(role === "admin" ? "viewer" : "admin"))
                }
                className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                {role === "admin" ? (
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-[#FF6B4A]" />
                ) : (
                  <Shield className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                )}
                {role === "admin" ? "Admin" : "Viewer"}
              </button>
              <div className="flex items-center gap-2 px-2 sm:px-3 border-x border-gray-100 dark:border-gray-800">
                <Bell className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  12
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
                  alt="User"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
                <div className="hidden sm:block text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white leading-none">
                    Rahul Sharma
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">Co-Founder</p>
                </div>
              </div>
            </div>
          </header>
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
    </div>
  );
}
