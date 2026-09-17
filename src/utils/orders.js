export const API_URL = "http://localhost:3000";

export const ORDER_STATUSES = [
  { id: "pending", label: "Yangi", badge: "bg-info/15 text-info", dot: "bg-info" },
  { id: "preparing", label: "Tayyorlanmoqda", badge: "bg-warning/20 text-warning-content", dot: "bg-warning" },
  { id: "ready", label: "Tayyor", badge: "bg-success/15 text-success", dot: "bg-success" },
];
export const DEFAULT_ORDER_STATUS = "pending";

export const getOrderStatus = (statusId) =>
  ORDER_STATUSES.find((st) => st.id === statusId) || ORDER_STATUSES[0];

export const STATUS_NEXT = {
  pending: "preparing",
  preparing: "ready",
  ready: null,
};
export const STATUS_PREV = {
  ready: "preparing",
  preparing: "pending",
  pending: null,
};

export const formatPrice = (value) =>
  new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
export const formatOrderTime = (iso) =>
  new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
export const formatOrderDate = (iso) =>
  new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });

export const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};