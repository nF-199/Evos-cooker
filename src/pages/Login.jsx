import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheckCircle,
  FiZap,
  FiTrendingUp,
} from "react-icons/fi";
import { GiChefToque } from "react-icons/gi";
import Logo from "../components/Logo";
import { getUser, isAllowedRole, setUser } from "../utils/auth";

const highlights = [
  {
    icon: FiZap,
    title: "Jonli oqim",
    text: "Kassadan kelgan buyurtmalar soniyalar ichida oshxonada ko'rinadi",
  },
  {
    icon: GiChefToque,
    title: "Statusni bosing",
    text: "Yangi → Tayyorlanmoqda → Tayyor — bir tap bilan",
  },
  {
    icon: FiTrendingUp,
    title: "Smena statistikasi",
    text: "Bugun nechta zakaz tayyorlaganingizni kuzatib boring",
  },
];

const demoAccounts = [
  { role: "Egasi", phone: "+998901111111", password: "owner123" },
  { role: "Oshpaz", phone: "+998901222333", password: "cooker123" },
];

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (user && isAllowedRole(user.role)) navigate("/", { replace: true });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone.trim() || !password.trim()) {
      toast.warning("Telefon raqam va parolni kiriting");
      return;
    }

    setLoading(true);
    try {
      const request = await fetch("http://localhost:3000/workers");
      const workers = await request.json();
      const user = workers.find(
        (item) => item.phone === phone.trim() && item.password === password
      );

      if (!user) {
        toast.error("Telefon raqam yoki parol noto'g'ri");
        return;
      }

      if (!isAllowedRole(user.role)) {
        toast.error("Bu akkaunt oshxona tizimi uchun emas");
        return;
      }

      // eslint-disable-next-line no-unused-vars
      const { password: _pw, ...safeUser } = user;
      setUser(safeUser);
      toast.success(`Xush kelibsiz, ${user.firstName}!`);
      navigate("/", { replace: true });
    } catch {
      toast.error("Serverga ulanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-base-200 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Chap — brend panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 lg:flex lg:flex-col">
        <div className="dot-grid-light absolute inset-0 opacity-60" />
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-amber-300/40 blur-3xl" />
        <div className="absolute -bottom-48 -right-32 h-[28rem] w-[28rem] rounded-full bg-rose-400/30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
          <Logo size="md" inverted subtitle="Cooker POS" />

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur">
              <span className="live-dot h-2 w-2 rounded-full bg-success" />
              Oshxona monitori
            </span>
            <h2 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-white xl:text-6xl">
              Buyurtmalar
              <span className="block bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-100 bg-clip-text text-transparent">
                oshxonada yashaydi.
              </span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/55">
              Kassir qabul qilgan har bir zakaz shu yerda paydo bo'ladi. Siz shunchaki
              holatni boshqarasiz — qolganini bizga qoldiring.
            </p>

            <div className="mt-12 flex flex-col gap-4">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur transition-all hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                    <Icon />
                  </div>
                  <div>
                    <p className="font-bold text-white">{title}</p>
                    <p className="text-sm text-white/45">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/35">
            <span>© {new Date().getFullYear()} Evos. Ichki tizim</span>
            <span className="h-1 w-1 rounded-full bg-white/25" />
            <span>v1.2 — Cooker</span>
          </div>
        </div>
      </div>

      {/* O'ng — forma */}
      <div className="dot-grid relative flex items-center justify-center p-6 sm:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <div className="rounded-[var(--radius-box)] border border-base-300/80 bg-base-100/90 p-8 shadow-2xl shadow-base-300/40 backdrop-blur sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl text-white shadow-lg shadow-primary/25">
                <GiChefToque />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                  Oshxona kabineti
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight">Xush kelibsiz!</h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-base-content/55">
              Oshpaz yoki ega akkauntingiz bilan tizimga kiring va smenani boshlang.
            </p>

            <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-5">
              <div className="form-control w-full">
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-base-content/80">
                  Telefon raqam
                </label>
                <div className="flex h-13 items-center gap-3 rounded-[var(--radius-field)] border-2 border-base-300/80 bg-base-100 px-4 transition-all focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/10">
                  <span className="text-lg text-base-content/35">
                    <FiPhone />
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="h-12 w-full grow bg-transparent text-sm font-medium outline-none placeholder:text-base-content/35"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-base-content/80">
                  Parol
                </label>
                <div className="flex h-13 items-center gap-3 rounded-[var(--radius-field)] border-2 border-base-300/80 bg-base-100 px-4 transition-all focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/10">
                  <span className="text-lg text-base-content/35">
                    <FiLock />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full grow bg-transparent text-sm font-medium outline-none placeholder:text-base-content/35"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="shrink-0 text-base-content/35 transition-colors hover:text-base-content"
                    aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group btn btn-primary mt-1 h-13 w-full items-center gap-2 rounded-[var(--radius-field)] text-base font-bold shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    Kirish
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-base-300/80 bg-base-100/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-base-content/45">
              Sinov akkauntlari
            </p>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {demoAccounts.map((acc) => (
                <div key={acc.phone} className="flex items-center justify-between rounded-lg bg-base-200/60 px-3 py-2">
                  <span className="text-xs font-semibold text-base-content/70">{acc.role}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhone(acc.phone);
                      setPassword(acc.password);
                      toast.info(`${acc.role} hisobi to'ldirildi`, { autoClose: 1000 });
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/70"
                  >
                    <FiCheckCircle className="text-sm" />
                    {acc.phone}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;