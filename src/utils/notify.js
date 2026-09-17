import { Howl } from "howler";
import bellUrl from "../assets/sounds/order-bell.wav";

let bell = null;

const getBell = () => {
  if (!bell) {
    bell = new Howl({
      src: [bellUrl],
      volume: 0.9,
      preload: true,
    });
  }
  return bell;
};

export const warmupAudio = () => {
  getBell();
};

export const playOrderBell = () => {
  const b = getBell();
  if (b) {
    if (b.playing()) b.stop();
    b.play();
  }
};

export const requestNotifyPermission = () => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "default") return;
  try {
    Notification.requestPermission().catch(() => {});
  } catch {
    /* qo'llab-quvvatlanmasa jim o'tamiz */
  }
};

export const sendOrderNotify = (order) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const names = (order.items || [])
    .slice(0, 3)
    .map((i) => `${i.quantity}× ${i.name}`)
    .join(", ");
  try {
    new Notification("Yangi buyurtma keldi", {
      body: order.id + (names ? " — " + names : ""),
    });
  } catch {
    /* jim o'tamiz */
  }
};