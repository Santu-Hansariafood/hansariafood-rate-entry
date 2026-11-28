"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  FileText,
  KeyRound,
  ListTodo,
  Package,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import Loading from "@/components/common/Loading/Loading";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ADMINS } from "@/config/navigation";
import { useSession } from "next-auth/react";

const Title = dynamic(() => import("@/components/common/Title/Title"));

const ViewRate = dynamic(
  () => import("@/components/common/ViewRate/ViewRate"),
  { loading: () => <Loading /> }
);
const RateEntryList = dynamic(
  () => import("@/components/ui/RateEntryList/RateEntryList"),
  { loading: () => <Loading /> }
);
const SaudaEntryList = dynamic(
  () => import("@/components/ui/SaudaEntryList/SaudaEntryList"),
  { loading: () => <Loading /> }
);
const TopSaudaList = dynamic(
  () => import("@/components/ui/TopSaudaList/TopSaudaList"),
  { loading: () => <Loading /> }
);
const RateCalendar = dynamic(
  () => import("@/components/common/RateCalendar/RateCalendar"),
  { loading: () => <Loading /> }
);
const SaudaTonsChart = dynamic(
  () => import("@/components/common/SaudaTonsChart/SaudaTonsChart"),
  { loading: () => <Loading /> }
);
const RateTakenSection = dynamic(
  () => import("@/components/ui/Welcome/RateTakenSection"),
  { loading: () => <Loading /> }
);

export default function Welcome() {
  const { mobile } = useUser();
  const { data: session } = useSession();
  const [name, setName] = useState("Guest");
  const [assignedCompanies, setAssignedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const effectiveMobile = useMemo(() => {
    return mobile || session?.user?.mobile || "";
  }, [mobile, session?.user?.mobile]);

  const isAdmin = useMemo(() => {
    return effectiveMobile && ADMINS.includes(effectiveMobile.toString());
  }, [effectiveMobile]);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const formatName = useCallback((str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const fetchUserData = useCallback(async () => {
    setLoading(true);

    const fetchName = async () => {
      let userName =
        typeof session?.user?.name === "string"
          ? session.user.name.trim()
          : "";

      if (!userName) {
        try {
          const userResponse = await axiosInstance.get(
            `/auth/register?mobile=${encodeURIComponent(effectiveMobile)}`
          );
          userName = userResponse.data?.user?.name?.trim() || "";
        } catch (error) {
          console.error("Failed to fetch dashboard user name:", error);
        }
      }

      if (!userName) {
        const savedMobile = localStorage.getItem("userNameMobile");
        if (savedMobile === String(effectiveMobile)) {
          userName = localStorage.getItem("userName") || "";
        }
      }

      const formattedName = userName ? formatName(userName) : "Guest";
      setName(formattedName);
      if (userName) {
        localStorage.setItem("userName", formattedName);
        localStorage.setItem("userNameMobile", String(effectiveMobile));
      }
    };

    const fetchAssignedCompanies = async () => {
      try {
        const response = await axiosInstance.get(
          `/user-companies?mobile=${encodeURIComponent(effectiveMobile)}`
        );
        setAssignedCompanies(response.data?.companies ?? []);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Failed to fetch assigned companies:", error);
        }
        setAssignedCompanies([]);
      }
    };

    try {
      if (effectiveMobile) localStorage.setItem("mobile", effectiveMobile);
      await Promise.all([fetchName(), fetchAssignedCompanies()]);
    } finally {
      setLoading(false);
    }
  }, [effectiveMobile, formatName, session?.user?.name]);

  useEffect(() => {
    if (effectiveMobile) fetchUserData();
  }, [effectiveMobile, fetchUserData]);

  const assignedCompaniesList = useMemo(() => {
    if (assignedCompanies.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 mt-6">
          No assigned companies found.
        </p>
      );
    }

    return (
      <div className="mt-8 text-left">
        <Title text="Assigned Companies" />
        <div className="space-y-5 mt-4">
          {assignedCompanies.map((company) => {
            if (!company?.companyId) return null;

            return (
              <motion.div
                key={company.companyId._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100
                           dark:from-gray-800 dark:to-gray-900
                           border border-gray-200 dark:border-gray-700
                           rounded-lg shadow-md hover:shadow-lg p-5"
              >
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                  {company.companyId.name}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                  {company.locations.map((loc, idx) => (
                    <span
                      key={`${company.companyId._id}-${idx}`}
                      className="bg-blue-100 dark:bg-blue-900/40
                                 text-blue-800 dark:text-blue-200
                                 text-xs px-3 py-1 rounded-full
                                 text-center font-medium shadow-sm"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }, [assignedCompanies]);

  if (loading) return <Loading />;

  if (isAdmin) {
    return (
      <Suspense fallback={<Loading />}>
        <div className="relative min-h-screen overflow-hidden bg-slate-50 pb-16 dark:bg-gray-950">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-48 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-600/10"
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
            <AdminHero name={name} today={today} />

            <section role="region" aria-label="Overview metrics" className="mt-6">
              <AdminKpiRow companiesCount={assignedCompanies.length} />
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <section role="region" aria-label="Rate Taken Tracker">
                  <RateTakenSection />
                </section>
              </div>
              <div className="lg:col-span-1">
                <TeamTasksPreview mobile={effectiveMobile} />
              </div>
            </div>

            <AdminSections />
          </div>
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gray-100 dark:bg-gray-950">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl rounded-3xl border border-white/20
                   bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
                   shadow-2xl p-8 md:p-12"
      >
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">
            Welcome, {name} 👋
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Here are the companies assigned to your account
          </p>

          <Link
            href="/resetpassword"
            className="inline-flex mt-4 px-5 py-2 rounded-full text-sm font-semibold
                       bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                       shadow-lg hover:shadow-xl transition"
          >
            Reset Password
          </Link>
        </div>
        <div className="mt-12">
          <Title text="Assigned Companies" />

          {assignedCompanies.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
              No assigned companies found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {assignedCompanies.map((company, index) => {
                if (!company?.companyId) return null;

                return (
                  <motion.div
                    key={company.companyId._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group rounded-2xl border border-white/20
                               bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg
                               shadow-lg hover:shadow-2xl transition-all p-6"
                  >
                    <h3 className="font-bold text-lg bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                      {company.companyId.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {company.locations.map((loc, idx) => (
                        <span
                          key={`${company.companyId._id}-${idx}`}
                          className="px-3 py-1 rounded-full text-xs font-semibold
                                     bg-gradient-to-r from-blue-100 to-teal-100
                                     dark:from-blue-900/40 dark:to-teal-900/40
                                     text-blue-800 dark:text-blue-200
                                     shadow-sm hover:scale-105 transition"
                        >
                          {loc}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-12">
          <TeamTasksPreview mobile={effectiveMobile} />
        </div>
      </motion.div>
    </div>
  </Suspense>
);
}

const KPI_ACCENTS = {
  indigo:{
    glow: "from-indigo-400/25",
    tile: "from-indigo-500 to-violet-600 shadow-indigo-500/30",
  },
  emerald: {
    glow: "from-emerald-400/25",
    tile: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  },
  amber: {
    glow: "from-amber-400/25",
    tile: "from-amber-500 to-orange-600 shadow-amber-500/30",
  },
  violet: {
    glow: "from-fuchsia-400/25",
    tile: "from-fuchsia-500 to-purple-600 shadow-fuchsia-500/30",
  },
};

const AdminHero = ({ name, today }) => {
  const initial = (name || "A").trim().charAt(0).toUpperCase();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-gray-900/60 dark:shadow-black/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-500/20 blur-3xl dark:from-indigo-500/20 dark:to-violet-600/10"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-black text-white shadow-lg shadow-indigo-500/30">
            {initial}
          </span>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">
              <ShieldCheck size={12} />
              Administrator
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Welcome back, {name} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {today}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <BarChart3 size={16} />
            Analytics Dashboard
          </Link>
          <Link
            href="/resetpassword"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300"
          >
            <KeyRound size={16} />
            Reset Password
          </Link>
        </div>
      </div>
    </section>
  );
};

const AdminKpiRow = ({ companiesCount }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchSummary = async () => {
      try {
        const { data } = await axiosInstance.get(
          "/analytics/weekly-summary?period=7days"
        );
        if (active && data?.success) setSummary(data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSummary();
    return () => {
      active = false;
    };
  }, []);

  const totalTons = summary?.summary?.totalTonsDone;
  const days = summary?.dailyData?.length || 0;
  const avgTons = days ? (Number(totalTons) / days).toFixed(1) : 0;

  const cards = [
    {
      label: "Rate Entries",
      sub: "Last 7 days",
      value: summary?.summary?.totalRateEntries ?? 0,
      Icon: FileText,
      accent: "indigo",
    },
    {
      label: "Sauda Tons",
      sub: "Last 7 days",
      value: totalTons ?? 0,
      Icon: Package,
      accent: "emerald",
    },
    {
      label: "Avg Daily Tons",
      sub: "Last 7 days",
      value: avgTons,
      Icon: TrendingUp,
      accent: "amber",
    },
    {
      label: "My Companies",
      sub: "Assigned to you",
      value: companiesCount ?? 0,
      Icon: Building2,
      accent: "violet",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {cards.map(({ label, sub, value, Icon, accent }, index) => {
        const tone = KPI_ACCENTS[accent];
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60 dark:shadow-black/30"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${tone.glow} to-transparent blur-2xl`}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {loading ? (
                    <span className="inline-block h-7 w-16 animate-pulse rounded-md bg-slate-200 dark:bg-white/10" />
                  ) : (
                    value
                  )}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {sub}
                </p>
              </div>
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${tone.tile}`}
              >
                <Icon size={20} />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const AdminSections = () => (
  <div className="mt-6 space-y-6">
    <section role="region" aria-label="View Rate Section">
      <ViewRate />
    </section>
    <section role="region" aria-label="Rate Entry List">
      <RateEntryList />
    </section>
    <section role="region" aria-label="Sauda Entry List">
      <SaudaEntryList />
    </section>
    <section role="region" aria-label="Sauda Tons Chart">
      <SaudaTonsChart />
    </section>
    <section role="region" aria-label="Top Sauda List">
      <TopSaudaList />
    </section>
    <section role="region" aria-label="Rate Calendar">
      <RateCalendar />
    </section>
  </div>
);

const TeamTasksPreview = ({ mobile }) => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [usersByMobile, setUsersByMobile] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const myMobile = mobile || session?.user?.mobile || "";

  const fetchTasks = useCallback(async () => {
    if (!myMobile) return;
    try {
      setIsRefreshing(true);
      const [tasksRes, usersRes] = await Promise.all([
        axiosInstance.get(`/tasks?mobile=${encodeURIComponent(myMobile)}`),
        axiosInstance.get("/auth/register?minimal=true"),
      ]);

      const taskList = tasksRes?.data;
      setTasks(Array.isArray(taskList) ? taskList : []);

      const usersPayload = usersRes?.data;
      const users = Array.isArray(usersPayload?.users)
        ? usersPayload.users
        : Array.isArray(usersPayload)
        ? usersPayload
        : [];
      const map = {};
      for (const u of users) {
        if (u?.mobile == null) continue;
        const key = String(u.mobile);
        if (!map[key] && typeof u.name === "string") map[key] = u.name;
      }
      setUsersByMobile(map);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      setTasks([]);
      setUsersByMobile({});
    } finally {
      setIsRefreshing(false);
    }
  }, [myMobile]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const pendingAssignedToMe = useMemo(() => {
    if (!myMobile) return [];
    return tasks
      .filter((t) =>
        t?.receivers?.some((r) => String(r.mobile) === String(myMobile))
      )
      .filter((t) => t.status === "pending")
      .slice(0, 6);
  }, [tasks, myMobile]);

  return (
    <div className="h-full rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60 dark:shadow-black/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
            <ListTodo size={17} />
          </span>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Team Tasks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pending, assigned to you
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchTasks}
          className="shrink-0 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          disabled={isRefreshing || !myMobile}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {pendingAssignedToMe.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          No pending tasks assigned to you.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {pendingAssignedToMe.map((t) => (
            <div
              key={t._id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/40 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  From: {usersByMobile[String(t.sender)] || t.senderName || t.sender}
                </p>
                <span className="text-[10px] text-gray-400">
                  {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-2">
                {t.content}
              </p>
            </div>
          ))}
          <p className="text-[11px] text-gray-400">
            Use the Team Tasks button (bottom-right) to assign and close tasks.
          </p>
        </div>
      )}
    </div>
  );
};

