import React, { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiPlayCircle,
  FiDollarSign,
  FiCreditCard,
  FiArrowLeft,
  FiUser,
  FiTrendingUp,
  FiShoppingBag,
  FiLayers as FiSplitIcon,
  FiSmartphone,
} from "react-icons/fi";
import { GiChefToque, GiChiliPepper, GiCheeseWedge } from "react-icons/gi";
import { useOrders } from "../context/OrdersContext";
import { getUser } from "../utils/auth";
import {
  ORDER_STATUSES,
  STATUS_NEXT,
  STATUS_PREV,
  formatOrderTime,
  formatPrice,
  getOrderStatus,
  isToday,
} from "../utils/orders";

const STATUS_STYLE = {
  pending: {
    bar: "from-violet-500 to-purple-600",
    chip: "bg-violet-500/10 text-violet-600 ring-violet-500/20",
    dot: "bg-violet-500",
    header: "from-violet-500 to-purple-500",
    button: "btn-info",
    glow: "shadow-violet-500/10",
  },
  preparing: {
    bar: "from-amber-400 to-orange-500",
    chip: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
    dot: "bg-amber-500",
    header: "from-amber-400 to-orange-500",
    button: "btn-warning",
    glow: "shadow-amber-500/10",
  },
  ready: {
    bar: "from-emerald-400 to-green-600",
    chip: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
    dot: "bg-emerald-500",
    header: "from-emerald-400 to-green-600",
    button: "btn-success",
    glow: "shadow-emerald-500/10",
  },
};

const paymentMeta = {
  cash: { label: "Naqd", icon: FiDollarSign },
  card: { label: "Karta", icon: FiCreditCard },
  mobile: { label: "P/C", icon: FiSmartphone },
  split: { label: "Bo'lib", icon: FiSplitIcon },
};
const getPaymentMeta = (method) =>
  paymentMeta[method] || { label: method, icon: FiCreditCard };

const serviceLabel = (type) => (type === "takeaway" ? "Olib ketish" : "Zalda");

const formatElapsed = (createdAt, now) => {
  const diff = Math.max(0, now - new Date(createdAt).getTime());
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    return `${h} soat ${mins % 60} min`;
  }
  return `${mins} daq ${String(secs).padStart(2, "0")} sek`;
};

const waitTone = (createdAt, now, status) => {
  const minutes = (now - new Date(createdAt).getTime()) / 60000;
  if (status === "pending") {
    if (minutes > 12) return "text-red-500 bg-red-500/10 ring-red-500/20";
    if (minutes > 6) return "text-amber-600 bg-amber-500/10 ring-amber-500/20";
    return "text-base-content/50 bg-base-200/80 ring-base-300/60";
  }
  return "text-base-content/50 bg-base-200/80 ring-base-300/60";
};

const OrderCard = ({ order, onMove, now }) => {
  const meta = getOrderStatus(order.status);
  const st = STATUS_STYLE[order.status];
  const next = STATUS_NEXT[order.status];
  const prev = STATUS_PREV[order.status];
  const Payment = getPaymentMeta(order.paymentMethod);
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0;

  return (
    <div
      className={`card-lift relative overflow-hidden rounded-3xl border border-base-300/80 bg-base-100 shadow-sm hover:shadow-lg hover:shadow-base-300/40`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${st.bar}`} />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-sm font-bold tracking-tight text-base-content">
                {order.id}
              </span>
              <span className="text-[11px] font-medium text-base-content/40">
                {formatOrderTime(order.createdAt)}
              </span>
            </div>
            <span
              className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${waitTone(
                order.createdAt,
                now,
                order.status
              )}`}
            >
              <FiClock className="text-[11px]" />
              {formatElapsed(order.createdAt, now)}
            </span>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${st.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
            {meta.label}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-base-200 to-base-300 text-base-content/45 shadow-inner">
            <GiChefToque />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            {(order.items || []).slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <span className="flex h-4 min-w-5 items-center justify-center rounded-md bg-primary/10 px-1 text-[10px] font-black tabular-nums text-primary">
                  {item.quantity}
                </span>
                <span className="truncate font-medium text-base-content/80">{item.name}</span>
                {item.isSpicy && <GiChiliPepper className="shrink-0 text-[11px] text-red-500" />}
                {item.hasExtraCheese && (
                  <GiCheeseWedge className="shrink-0 text-[11px] text-amber-500" />
                )}
                <span className="ml-auto shrink-0 font-semibold tabular-nums text-base-content/45">
                  {formatPrice(item.totalPrice ?? item.finalItemPrice * item.quantity)}
                </span>
              </div>
            ))}
            {(order.items?.length || 0) > 4 && (
              <p className="text-[10px] font-semibold text-base-content/40">
                + yana {order.items.length - 4} turdagi mahsulot
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-base-content/50">
          <span className="rounded-lg bg-base-200 px-1.5 py-1">{itemCount} ta mahsulot</span>
          <span className="rounded-lg bg-base-200 px-1.5 py-1">{serviceLabel(order.serviceType)}</span>
          <span className="flex items-center gap-1 rounded-lg bg-base-200 px-1.5 py-1">
            <Payment.icon className="text-[11px]" />
            {Payment.label}
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-base-200 px-1.5 py-1">
            <FiUser className="text-[10px]" />
            {order.workerName || "Kassir"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-base-200 pt-3">
          <span className="text-base font-black tabular-nums text-base-content">
            {formatPrice(order.total)}
          </span>
          <div className="flex items-center gap-1.5">
            {prev && (
              <button
                type="button"
                onClick={() => onMove(order, prev)}
                title={`Orqaga: ${getOrderStatus(prev).label}`}
                className="btn btn-ghost btn-xs h-8 min-h-0 gap-1 rounded-xl border border-base-300 px-2.5 text-[11px] font-bold text-base-content/55 hover:bg-base-200"
              >
                <FiArrowLeft className="text-xs" />
              </button>
            )}
            {next && (
              <button
                type="button"
                onClick={() => onMove(order, next)}
                className={`btn btn-xs h-8 min-h-0 gap-1 rounded-xl px-3 text-[11px] font-black text-white shadow-md ${st.button}`}
              >
                {next === "preparing" ? (
                  <>
                    <FiPlayCircle className="text-sm" />
                    Boshlash
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="text-sm" />
                    Tayyor
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ColumnHeader = ({ status, count }) => {
  const st = STATUS_STYLE[status];
  const meta = getOrderStatus(status);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r p-[1px] shadow-sm ${st.header}`}
    >
      <div className="flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide">
          <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
          {meta.label}
        </span>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-2 text-xs font-black tabular-nums text-white shadow-md">
          {count}
        </span>
      </div>
    </div>
  );
};

const SkeletonBoard = () => (
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <div className="h-12 animate-pulse rounded-2xl bg-base-300/60" />
        {Array.from({ length: 3 }).map((_, j) => (
          <div key={j} className="h-52 animate-pulse rounded-3xl border border-base-200 bg-base-100/70" />
        ))}
      </div>
    ))}
  </div>
);

const Orders = () => {
  const { orders, loading, refresh, handleMove } = useOrders();
  const currentUserId = getUser()?.id != null ? String(getUser().id) : null;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(id);
  }, []);

  const countByStatus = useMemo(
    () =>
      ORDER_STATUSES.reduce((acc, st) => {
        acc[st.id] = orders.filter((o) => o.status === st.id).length;
        return acc;
      }, {}),
    [orders]
  );

  const myCookedToday = useMemo(
    () =>
      orders.filter(
        (o) => o.status === "ready" && String(o.cookedBy) === currentUserId && isToday(o.cookedAt)
      ).length,
    [orders, currentUserId]
  );
  const myCookedTotal = useMemo(
    () => orders.filter((o) => String(o.cookedBy) === currentUserId && o.status === "ready").length,
    [orders, currentUserId]
  );

  const summaryCards = [
    {
      title: "Yangi",
      value: countByStatus.pending,
      icon: FiShoppingBag,
      gradient: "from-violet-500 to-purple-600",
      hint: "kutmoqda",
    },
    {
      title: "Jarayonda",
      value: countByStatus.preparing,
      icon: GiChefToque,
      gradient: "from-amber-400 to-orange-500",
      hint: "tayyorlanmoqda",
    },
    {
      title: "Tayyor",
      value: countByStatus.ready,
      icon: FiCheckCircle,
      gradient: "from-emerald-400 to-green-600",
      hint: "berishga tayyor",
    },
    {
      title: "Bugun tayyorladim",
      value: myCookedToday,
      icon: FiTrendingUp,
      gradient: "from-primary to-secondary",
      hint: `jami ${myCookedTotal} ta`,
    },
  ];

  return (
    <div className="-m-6 flex min-h-full flex-col p-6 lg:-m-8 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-2xl text-white shadow-lg shadow-primary/25">
            <GiChefToque />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
              Oshxona
            </p>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Buyurtmalar taxtasi
              </h1>
              <span className="hidden items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success sm:inline-flex">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-success" />
                Jonli
              </span>
            </div>
            <p className="mt-0.5 text-sm text-base-content/55">
              Kassir qabul qilgan buyurtmalar avtomatik shu yerda paydo bo'ladi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refresh()}
          disabled={loading}
          className="btn btn-outline btn-sm h-10 gap-2 rounded-xl border-base-300 px-4 text-sm font-bold shadow-sm hover:border-primary hover:bg-primary hover:text-primary-content"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Yangilash
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaryCards.map(({ title, value, icon: Icon, gradient, hint }) => (
          <div
            key={title}
            className="card-lift flex items-center gap-4 rounded-3xl border border-base-300/80 bg-base-100 p-4 shadow-sm hover:shadow-md hover:shadow-base-300/40"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg text-white shadow-lg ${gradient}`}
            >
              <Icon />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold uppercase tracking-wide text-base-content/50">
                {title}
              </p>
              <p className="text-2xl font-black tabular-nums">{value}</p>
              <p className="truncate text-[10px] font-medium text-base-content/40">{hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex-1">
        {loading && orders.length === 0 ? (
          <SkeletonBoard />
        ) : orders.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-[var(--radius-box)] border-2 border-dashed border-base-300 bg-base-100/60 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-base-200 to-base-300 text-4xl text-base-content/30 shadow-inner">
              <GiChefToque />
            </div>
            <p className="mt-5 text-xl font-extrabold text-base-content/75">Hali buyurtma yo'q</p>
            <p className="mt-1 text-sm text-base-content/50">
              Kassada buyurtma rasmiylashtirilishi bilanoq shu yerda paydo bo'ladi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
            {ORDER_STATUSES.map((st) => {
              const list = orders.filter((o) => o.status === st.id);
              return (
                <section
                  key={st.id}
                  className="rounded-[var(--radius-box)] border border-base-300/70 bg-base-200/40 p-3 backdrop-blur-sm"
                >
                  <ColumnHeader status={st.id} count={countByStatus[st.id]} />
                  <div className="scrollbar-thin mt-3 space-y-3 pb-1 xl:max-h-[calc(100vh-340px)] xl:overflow-y-auto xl:pr-1.5">
                    {list.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-base-300 bg-base-100/50 px-4 py-10 text-center">
                        <span className="text-2xl text-base-content/20">
                          <FiCheckCircle />
                        </span>
                        <p className="text-xs font-semibold text-base-content/35">
                          Bu yerda hozir bo'sh
                        </p>
                      </div>
                    ) : (
                      list.map((order) => (
                        <OrderCard key={order.id} order={order} onMove={handleMove} now={now} />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;