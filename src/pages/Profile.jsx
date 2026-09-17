import React, { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiTrendingUp,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import { GiChefToque } from "react-icons/gi";
import { toast } from "react-toastify";
import { getUser } from "../utils/auth";
import { API_URL, DEFAULT_ORDER_STATUS, formatOrderDate, isToday } from "../utils/orders";

const infoItems = [
  { label: "Telefon raqam", key: "phone", icon: FiPhone, fallback: "—" },
  { label: "Lavozim", key: "role", icon: FiBriefcase },
  { label: "Ish joyi", key: "place", icon: FiMapPin },
  { label: "Bugungi kun", key: "today", icon: FiClock },
];

const Profile = () => {
  const user = getUser();
  const currentUserId = user?.id != null ? String(user.id) : null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders`);
        if (!res.ok) throw new Error("Buyurtmalarni yuklab bo'lmadi");
        const data = await res.json();
        const mine = (Array.isArray(data) ? data : [])
          .filter((o) => String(o.cookedBy) === currentUserId)
          .map((o) => ({ ...o, status: o.status || DEFAULT_ORDER_STATUS }));
        setOrders(mine);
      } catch (err) {
        toast.error("Statistikani yuklashda xatolik yuz berdi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUserId]);

  const cookedTotal = useMemo(() => orders.filter((o) => o.status === "ready").length, [orders]);
  const todayCount = useMemo(
    () => orders.filter((o) => o.status === "ready" && isToday(o.cookedAt)).length,
    [orders]
  );

  const todayRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "ready" && isToday(o.cookedAt))
        .reduce((sum, o) => sum + (o.total || 0), 0),
    [orders]
  );

  const todayListByDate = useMemo(() => {
    const map = new Map();
    orders
      .filter((o) => o.status === "ready" && o.cookedAt)
      .forEach((o) => {
        const day = formatOrderDate(o.cookedAt);
        map.set(day, (map.get(day) || 0) + 1);
      });
    return [...map.entries()].reverse();
  }, [orders]);
  const todayList = useMemo(
    () => orders.filter((o) => o.status === "ready" && isToday(o.cookedAt)),
    [orders]
  );

  const fullName = `${user?.firstName ?? "Oshpaz"} ${user?.lastName ?? ""}`.trim();
  const initials = `${user?.firstName?.[0] ?? "O"}${user?.lastName?.[0] ?? ""}`;
  const roleLabel = user?.role === "owner" ? "Egasi" : "Oshpaz";

  const todayStr = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const todayDate = new Date().toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const maxDayCount = Math.max(1, ...todayListByDate.map(([, c]) => c));

  const lastReadyTime = todayList[0]?.cookedAt
    ? new Date(todayList[0].cookedAt).toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const stats = [
    {
      title: "Bugungi tayyorlangan",
      value: todayCount,
      label: "shu smenada",
      icon: FiTrendingUp,
      gradient: "from-primary to-secondary",
    },
    {
      title: "Jami tayyorlangan",
      value: cookedTotal,
      label: "akkauntingiz bo'yicha",
      icon: FiCheckCircle,
      gradient: "from-emerald-400 to-green-600",
    },
    {
      title: "Oxirgi tayyor",
      value: lastReadyTime,
      label: "vaqt ko'rsatkichi",
      icon: FiClock,
      gradient: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl text-white shadow-lg shadow-primary/25">
          <FiBriefcase />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
            Profil
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Mening kabinetim</h1>
        </div>
      </div>

      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-[var(--radius-box)] bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 text-white shadow-xl shadow-primary/20 sm:p-8 p-6">
        <div className="dot-grid-light absolute inset-0 opacity-50" />
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-rose-400/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-primary to-secondary text-3xl font-black uppercase text-white shadow-2xl shadow-primary/40 ring-4 ring-white/10">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-orange-400 bg-success">
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{fullName}</h2>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/80 backdrop-blur">
                {roleLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-success" />
                Smenada
              </span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
              <FiCalendar className="text-base" />
              {todayStr} — oshxona faol
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Bugun tayyor
                </p>
                <p className="text-2xl font-black tabular-nums text-white">{todayCount}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Jami tayyor
                </p>
                <p className="text-2xl font-black tabular-nums text-white">{cookedTotal}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Bugun summa
                </p>
                <p className="text-2xl font-black tabular-nums text-white">
                  {new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(todayRevenue) + " so'm"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[var(--radius-box)] border border-base-300/80 bg-base-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold">Shaxsiy ma'lumotlar</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {infoItems.map(({ label, icon: Icon }) => {
              const value =
                label === "Bugungi kun"
                  ? todayDate
                  : label === "Ish joyi"
                  ? "Evos Oshxona"
                  : user?.[label === "Telefon raqam" ? "phone" : "role"] ?? "—";
              return (
                <div
                  key={label}
                  className="card-lift flex items-center gap-4 rounded-2xl border border-base-300/80 bg-base-200/40 p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg text-white shadow-md shadow-primary/20">
                    <Icon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-base-content/45">
                      {label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold capitalize">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="flex flex-col justify-between rounded-[var(--radius-box)] border border-base-300/80 bg-base-100 p-6 shadow-sm">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <GiChefToque className="text-base" />
              Smena holati
            </p>
            <p className="mt-4 text-6xl font-black tracking-tight">
              {todayCount}
              <span className="text-2xl text-base-content/40"> ta</span>
            </p>
            <p className="mt-2 text-sm text-base-content/55">
              bugun tayyorlangan buyurtma. Ajoyib ish, davom eting!
            </p>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-base-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
              style={{ width: `${Math.min(100, (todayCount / (todayCount >= 5 ? todayCount : 5)) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-base-content/45">
            <span>Smena boshlanishi</span>
            <span className="font-black text-success">Kunlik maqsad: 5 ta</span>
          </div>
        </aside>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {stats.map(({ title, value, label, icon: Icon, gradient }) => (
          <div
            key={title}
            className="card-lift flex items-center gap-4 rounded-3xl border border-base-300/80 bg-base-100 p-5 shadow-sm"
          >
            <div
              className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-lg ${gradient}`}
            >
              <Icon />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold uppercase tracking-wide text-base-content/50">
                {title}
              </p>
              <p className="truncate text-2xl font-black tabular-nums" aria-busy={loading}>
                {value}
              </p>
              <p className="truncate text-[10px] font-medium text-base-content/40">{label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[var(--radius-box)] border border-base-300/80 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <FiTrendingUp className="text-lg text-primary" />
              Kunlik hisobot
            </h3>
            <p className="mt-0.5 text-sm text-base-content/55">
              Har tayyorlagan buyurtmangiz akkauntingizga yozib boriladi.
            </p>
          </div>
          <span className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary sm:block">
            {todayListByDate.length} kun
          </span>
        </div>

        {todayListByDate.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-3xl border-2 border-dashed border-base-300 bg-base-200/30 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-base-200 text-3xl text-base-content/30">
              <GiChefToque />
            </div>
            <p className="mt-4 font-bold text-base-content/70">Hisobot hozircha bo'sh</p>
            <p className="mt-1 text-sm text-base-content/50">
              Birinchi buyurtmani tayyorlab, statistika yuritishni boshlang.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {todayListByDate.slice(0, 9).map(([day, count]) => (
              <div
                key={day}
                className="rounded-2xl border border-base-300/80 bg-base-200/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{day}</span>
                  <span className="flex items-center gap-1.5 text-sm font-black tabular-nums text-primary">
                    <GiChefToque className="text-base" />
                    {count} ta
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-base-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${(count / maxDayCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;