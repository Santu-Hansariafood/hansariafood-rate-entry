"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
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

  const formatName = useCallback((str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);

      const companyResponse = await axiosInstance.get(
        `/user-companies?mobile=${encodeURIComponent(effectiveMobile)}`
      );

      const sessionName = session?.user?.name;
      if (sessionName) {
        const formatted = formatName(sessionName);
        setName(formatted);
        localStorage.setItem("userName", formatted);
      } else {
        try {
          const userResponse = await axiosInstance.get("/auth/register");
          const users = Array.isArray(userResponse.data?.users)
            ? userResponse.data.users
            : [];
          const userData = users.find(
            (u) => u.mobile?.toString() === effectiveMobile?.toString()
          );
          if (userData?.name) {
            const formatted = formatName(userData.name);
            setName(formatted);
            localStorage.setItem("userName", formatted);
          } else {
            const storedName = localStorage.getItem("userName");
            setName(storedName || "Guest");
          }
        } catch {
          const storedName = localStorage.getItem("userName");
          setName(storedName || "Guest");
        }
      }

      if (effectiveMobile) localStorage.setItem("mobile", effectiveMobile);
      setAssignedCompanies(companyResponse.data?.companies ?? []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setName("Guest");
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
        <div className="relative min-h-screen bg-gray-100 dark:bg-gray-950 pb-12">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none" />
          
          <div className="relative pt-8 px-6 text-center">
             <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent">
              Welcome Back, {name} 👋
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Here is your administrative dashboard overview
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

          <AdminDashboard />
          <div className="w-full max-w-7xl mx-auto px-4 mt-8">
            <TeamTasksPreview mobile={effectiveMobile} />
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

const AdminDashboard = () => (
  <div className="space-y-8 mt-12 w-full max-w-7xl mx-auto px-4">
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
        axiosInstance.get("/auth/register"),
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
    <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg p-6">
      <div className="flex items-center justify-between gap-4">
        <Title text="Team Tasks" />
        <button
          type="button"
          onClick={fetchTasks}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
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

