import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiGrid, FiBell } from "react-icons/fi";
import { GiChefToque } from "react-icons/gi";
import { toast } from "react-toastify";
import Logo from "./Logo";
import { getUser, removeUser } from "../utils/auth";
import { useOrders } from "../context/OrdersContext";

const links = [
  { to: "/", label: "Buyurtmalar", icon: FiGrid, end: true },
  { to: "/profile", label: "Profil", icon: FiUser },
];

const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
});
const timeFormatter = new Intl.DateTimeFormat("uz-UZ", {
  hour: "2-digit",
  minute: "2-digit",
});

const Sidebar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const { liveCount } = useOrders();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    removeUser();
    toast.info("Tizimdan chiqdingiz");
    navigate("/login", { replace: true });
  };

  const initials = `${user?.firstName?.[0] ?? "U"}${user?.lastName?.[0] ?? ""}`;
  const roleLabel = user?.role === "owner" ? "Egasi" : "Oshpaz";

  return (
    <aside className="relative flex h-screen w-60 shrink-0 flex-col border-r border-base-300/80 bg-base-100">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative z-10 px-5 py-5">
        <Logo size="sm" />
      </div>

      {/* Smena kartasi */}
      <div className="relative z-10 mx-5 mb-4 rounded-2xl border border-base-300/80 bg-base-200/60 p-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-success" />
            Oshxona ochiq
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/35">
            Smena
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="font-mono text-xl font-bold tabular-nums tracking-tight">
            {timeFormatter.format(now)}
          </p>
          <p className="text-[10px] capitalize text-base-content/45">
            {dateFormatter.format(now)}
          </p>
        </div>
      </div>

      {/* Navigatsiya */}
      <nav className="relative z-10 flex flex-1 flex-col gap-0.5 px-3">
        <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/30">
          Asosiy
        </p>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-content shadow-md shadow-primary/25"
                  : "text-base-content/55 hover:bg-base-200 hover:text-base-content"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`text-lg transition-colors ${
                    isActive ? "" : "text-base-content/35 group-hover:text-base-content/70"
                  }`}
                />
                {label}
                {to === "/" && liveCount > 0 && (
                  <span
                    className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black tabular-nums ${
                      isActive ? "bg-white/25 text-white" : "bg-warning text-warning-content"
                    }`}
                  >
                    {liveCount}
                  </span>
                )}
                {to === "/" && liveCount === 0 && (
                  <FiBell className="ml-auto text-sm text-base-content/20" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Foydalanuvchi + chiqish */}
      <div className="relative z-10 border-t border-base-300/80 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl px-1.5 py-2">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-xs font-black uppercase text-white shadow-md shadow-primary/25">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-base-100 bg-success" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="flex items-center gap-1 truncate text-[10px] text-base-content/40">
              <GiChefToque className="text-[10px]" />
              {roleLabel}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-xs h-9 w-full justify-start gap-2 rounded-xl text-xs font-semibold text-base-content/45 transition-colors hover:bg-error/10 hover:text-error"
        >
          <FiLogOut />
          Chiqish
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-base-300/80 px-4 py-3 text-[9px] font-semibold text-base-content/25">
        <GiChefToque className="text-xs" />
        Evos Oshxona
      </div>
    </aside>
  );
};

export default Sidebar;