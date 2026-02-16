"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Info, X, IndianRupee, Clock, History } from "lucide-react";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));

export default function LandingCost() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("Feed Mills");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* ---------------- FETCH COMPANIES ---------------- */
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get("/managecompany?category=Feed Mills&limit=1000");
        setCompanies(res.data?.companies || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch companies.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  /* ---------------- NORMALIZER ---------------- */
  const normalize = (str) =>
    String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  /* ---------------- VARIANT RESOLVER ---------------- */
  const getCommodityVariants = (commodity) => {
    const norm = normalize(commodity);

    if (norm.includes("soya") || norm.includes("sbm")) {
      return [
        "Soya",
        "Soyabean",
        "SBM 46%",
        "SBM 47%",
        "SBM 48%",
        "SBM 49%",
        "SBM 50%",
        "SBM 51%",
      ];
    }

    return [commodity];
  };

  /* ---------------- FETCH RATES ---------------- */
  useEffect(() => {
    const fetchRates = async () => {
      if (!selectedCommodity) {
        setRates([]);
        return;
      }

      try {
        setRatesLoading(true);

        const dateStr = new Date().toISOString().split("T")[0];
        const variants = getCommodityVariants(selectedCommodity);

        const fetchCommodity = async (commodityLabel) => {
          const params = new URLSearchParams({
            commodity: commodityLabel,
            date: dateStr,
          });

          if (selectedLocation)
            params.set("destination", selectedLocation);

          const res = await axiosInstance.get(
            `/ratehistory/by-commodity?${params.toString()}`
          );

          return Array.isArray(res.data) ? res.data : [];
        };

        const responses = await Promise.all(
          variants.map((v) => fetchCommodity(v).catch(() => []))
        );

        let all = responses.flat();

        /* remove duplicates */
        const seen = new Set();
        all = all.filter((r) => {
          const key = `${r.companyId}|${r.location}|${r.commodity}|${r.date}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        /* filter valid */
        all = all.filter((r) => {
          const base = Number(r.newRate) || Number(r.oldRate) || 0;
          const temp =
            Array.isArray(r.tempRates) &&
            r.tempRates.some((t) => Number(t.rate) > 0);
          return base > 0 || temp;
        });

        /* sort */
        all.sort((a, b) => {
          const A =
            Number(a.landedRate) ||
            Number(a.newRate) ||
            Number(a.oldRate) ||
            0;
          const B =
            Number(b.landedRate) ||
            Number(b.newRate) ||
            Number(b.oldRate) ||
            0;
          return A - B;
        });

        setRates(all);
      } catch (err) {
        console.error(err);
        setRates([]);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, [selectedCommodity, selectedLocation]);

  /* ---------------- FETCH HISTORY ---------------- */
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedCompany || !selectedCommodity || !selectedLocation) {
        setHistory([]);
        return;
      }

      try {
        setHistoryLoading(true);

        const company = companies.find((c) => c.name === selectedCompany);
        if (!company) return;

        const res = await axiosInstance.get(
          `/ratehistory/${company._id}?fullHistory=true`
        );

        const data = res.data || [];

        const match = data.find(
          (d) =>
            d.location === selectedLocation &&
            normalize(d.commodity).includes(normalize(selectedCommodity))
        );

        if (match?.history) {
          const sorted = [...match.history].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setHistory(sorted);
        } else setHistory([]);
      } catch (err) {
        console.error(err);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [selectedCompany, selectedCommodity, selectedLocation, companies]);

  /* ---------------- RESET LOGIC ---------------- */
  useEffect(() => {
    setSelectedCommodity("");
    setSelectedLocation("");
  }, [selectedCompany]);

  useEffect(() => {
    setSelectedLocation("");
  }, [selectedCommodity]);

  /* ---------------- OPTIONS ---------------- */
  const VALID_COMMODITIES = ["soya", "ddgs", "mdoc", "sbm"];

  const categoryOptions = [{ label: "Feed Mills", value: "Feed Mills" }];

  const companyOptions = useMemo(() => {
    return companies
      .filter((c) =>
        c.commodities?.some((comm) =>
          VALID_COMMODITIES.some((v) =>
            comm.toLowerCase().includes(v)
          )
        )
      )
      .map((c) => ({ label: c.name, value: c.name }));
  }, [companies]);

  const commodityOptions = useMemo(() => {
    if (!selectedCompany) return [];
    const company = companies.find((c) => c.name === selectedCompany);
    if (!company?.commodities) return [];

    return company.commodities
      .filter((comm) =>
        VALID_COMMODITIES.some((v) =>
          comm.toLowerCase().includes(v)
        )
      )
      .map((c) => ({ label: c, value: c }));
  }, [selectedCompany, companies]);

  const locationOptions = useMemo(() => {
    if (!selectedCompany) return [];
    const company = companies.find((c) => c.name === selectedCompany);
    if (!company?.location) return [];
    return company.location.map((l) => ({ label: l, value: l }));
  }, [selectedCompany, companies]);

  const isSelectionComplete =
    selectedCompany && selectedCommodity && selectedLocation;

  /* ---------------- UI ---------------- */
  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">

        <div className="text-center mb-12">
          <Title text="Landing Cost" />
          <p className="text-gray-500 mt-4">
            Select category, buyer company, commodity, and location.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border p-6 md:p-10 mb-8">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <Dropdown
              label="1. Select Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />

            <Dropdown
              label="2. Buyer company"
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              disabled={loading}
            />

            <Dropdown
              label="3. Select Commodity"
              options={commodityOptions}
              value={selectedCommodity}
              onChange={setSelectedCommodity}
              disabled={!selectedCompany}
            />

            <Dropdown
              label="4. Select Location"
              options={locationOptions}
              value={selectedLocation}
              onChange={setSelectedLocation}
              disabled={!selectedCommodity}
            />

          </div>

          {/* RESULT SECTION */}
          <AnimatePresence mode="wait">

            {error ? (
              <div className="mt-12 text-center text-red-600">{error}</div>
            ) : ratesLoading ? (
              <div className="mt-12 flex justify-center"><Loading/></div>
            ) : selectedCommodity && rates.length > 0 ? (

              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mt-12">

                <h3 className="text-xl font-bold mb-4">
                  Latest {selectedCommodity} Market Rates
                </h3>

                <Table
                  data={rates.map(r=>({
                    companyName:r.companyName,
                    location:r.location,
                    commodity:r.commodity,
                    destination:r.destinationLocation||"",
                    base:Number(r.newRate)||Number(r.oldRate)||0,
                    freight:Number(r.freightRate)||0,
                    landed:Number(r.landedRate)||0,
                    previous:Number(r.oldRate)||0,
                    date:r.date
                  }))}

                  columns={[
                    {header:"Company",accessor:"companyName"},
                    {header:"Location",accessor:"location"},
                    {header:"Commodity",accessor:"commodity"},
                    {header:"Destination",cell:r=>r.destination||"—"},
                    {header:"Base",cell:r=>`₹${r.base}`},
                    {header:"Freight",cell:r=>r.freight?`₹${r.freight}`:"—"},
                    {header:"Landed",cell:r=>`₹${r.landed}`},
                    {header:"Previous",cell:r=>r.previous?`₹${r.previous}`:"—"},
                    {header:"Date",cell:r=>new Date(r.date).toLocaleDateString("en-IN")}
                  ]}
                />

              </motion.div>

            ) : selectedCommodity ? (
              <div className="mt-12 text-center text-gray-400">
                No rate available.
              </div>
            ) : (
              <div className="mt-12 text-center text-gray-400">
                Please complete selection.
              </div>
            )}

          </AnimatePresence>
        </div>

        {/* HISTORY */}
        {isSelectionComplete && (
          <div className="mb-8 p-6 bg-white rounded-3xl border">

            <h3 className="font-bold mb-4">
              {selectedCommodity} Rate History
            </h3>

            {historyLoading ? (
              <Loading/>
            ) : history.length===0 ? (
              <p>No history</p>
            ) : (
              history.map((h,i)=>{
                const base=Number(h.finalRate??h.oldRate??0);
                const freight=Number(h.freightRate||0);
                const landed=base+freight;

                return(
                  <div key={i} className="flex justify-between border-b py-2">
                    <span>₹{landed}</span>
                    <span>{new Date(h.date).toLocaleDateString("en-IN")}</span>
                  </div>
                );
              })
            )}

          </div>
        )}

        {/* FOOTER */}
        <div className="p-6 bg-gray-50 rounded-3xl border flex justify-between">
          <div className="flex gap-3 items-center">
            <TrendingUp/>
            <div>
              <h4 className="font-bold">Hansaria Food Private Limited</h4>
              <p className="text-sm text-gray-500">
                Reliable procurement through data insights
              </p>
            </div>
          </div>
          <div className="text-xs font-bold">LIVE DATA</div>
        </div>

      </div>
    </Suspense>
  );
}
