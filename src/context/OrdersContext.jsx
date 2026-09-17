import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { FiBell } from "react-icons/fi";
import { getUser } from "../utils/auth";
import { API_URL, DEFAULT_ORDER_STATUS, getOrderStatus } from "../utils/orders";
import {
  playOrderBell,
  requestNotifyPermission,
  sendOrderNotify,
  warmupAudio,
} from "../utils/notify";

/* eslint-disable react-refresh/only-export-components */

const OrdersContext = createContext(null);
export const useOrders = () => useContext(OrdersContext);

const POLL_INTERVAL = 4000;
const ACTIVE_STATUSES = ["pending", "preparing"];

export const OrdersProvider = ({ children }) => {
  const currentUser = getUser();
  const currentUserId = currentUser?.id != null ? String(currentUser.id) : null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const knownIdsRef = useRef(new Set());
  const armedRef = useRef(false);

  const notifyIncoming = useCallback((order) => {
    playOrderBell();
    sendOrderNotify(order);
    const names = (order.items || [])
      .slice(0, 3)
      .map((i) => `${i.quantity}× ${i.name}`)
      .join(", ");
    toast.success(
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 animate-pulse items-center justify-center rounded-2xl bg-primary/15 text-xl text-primary">
          <FiBell />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black">Yangi buyurtma: {order.id}</p>
          <p className="truncate text-xs text-base-content/55">
            {names || "Mahsulotlar"}
          </p>
        </div>
      </div>,
      { autoClose: 6000, icon: false }
    );
  }, []);

  const fetchOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`${API_URL}/orders`);
        if (!res.ok) throw new Error("Buyurtmalarni yuklab bo'lmadi");
        const data = await res.json();
        const list = (Array.isArray(data) ? data : [])
          .map((o) => ({ ...o, status: o.status || DEFAULT_ORDER_STATUS }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!armedRef.current) {
          list.forEach((o) => knownIdsRef.current.add(o.id));
        } else {
          const fresh = list.filter(
            (o) => ACTIVE_STATUSES.includes(o.status) && !knownIdsRef.current.has(o.id)
          );
          list.forEach((o) => knownIdsRef.current.add(o.id));
          fresh.forEach(notifyIncoming);
        }
        setOrders(list);
      } catch (err) {
        if (!silent) toast.error("Buyurtmalarni yuklashda xatolik yuz berdi");
        console.error(err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [notifyIncoming]
  );

  useEffect(() => {
    requestNotifyPermission();
    const unlock = () => warmupAudio();
    window.addEventListener("pointerdown", unlock, { once: true });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders({ silent: true }).finally(() => {
      armedRef.current = true;
    });

    const timer = setInterval(() => fetchOrders({ silent: true }), POLL_INTERVAL);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pointerdown", unlock);
    };
  }, [fetchOrders]);

  const handleMove = useCallback(
    async (order, nextStatus) => {
      if (!nextStatus || nextStatus === order.status) return;
      const prevStatus = order.status;
      const enteredReady = nextStatus === "ready";
      const now = new Date().toISOString();
      const meta = enteredReady
        ? {
            cookedBy: currentUserId,
            cookedByName: `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim(),
            cookedAt: now,
          }
        : { cookedBy: null, cookedByName: null, cookedAt: null };

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus, ...meta } : o))
      );
      try {
        const res = await fetch(`${API_URL}/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus, updatedAt: now, ...meta }),
        });
        if (!res.ok) throw new Error("Statusni yangilab bo'lmadi");
        toast.success(`${order.id}: ${getOrderStatus(nextStatus).label}`, { autoClose: 1200 });
      } catch (err) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: prevStatus } : o))
        );
        toast.error("Buyurtma statusini o'zgartirishda xatolik");
        console.error(err);
      }
    },
    [currentUser, currentUserId]
  );

  const liveCount = useMemo(
    () => orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    [orders]
  );

  const value = useMemo(
    () => ({ orders, loading, liveCount, refresh: fetchOrders, handleMove }),
    [orders, loading, liveCount, fetchOrders, handleMove]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};