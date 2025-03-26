"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dynamic from "next/dynamic";
import Loading from "../Loading/Loading";

const RateGraph = dynamic(() =>
  import("@/components/common/RateGraph/RateGraph")
);

export default function RateCalendar() {
  const [date, setDate] = useState(new Date());
  const [rateData, setRateData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("/api/rate")
      .then((response) => setRateData(response.data))
      .catch((error) => console.error("Error fetching rate data:", error));
  }, []);

  const filteredCompanies = useMemo(() => {
    return [
      ...new Set(
        rateData
          .filter(({ company }) =>
            company.toLowerCase().includes(search.toLowerCase())
          )
          .map(({ company }) => company)
      ),
    ];
  }, [search, rateData]);

  const getRatesForDate = useCallback(
    (date, company, location) => {
      const formattedDate = date.toLocaleDateString("en-GB");
      const data = rateData.find(
        (item) => item.company === company && item.location === location
      );

      if (!data) return null;

      const oldRateEntry = data.oldRates.find((rate) =>
        rate.includes(formattedDate)
      );
      const newRateEntry = data.newRate.includes(formattedDate)
        ? data.newRate
        : "";

      let rate = "No Rate";
      let rateType = "none";

      if (oldRateEntry) {
        rate = oldRateEntry.split(" ")[0];
        rateType = "old";
      } else if (newRateEntry) {
        rate = newRateEntry.split(" ")[0];
        rateType = "new";
      }

      return { rate, rateType };
    },
    [rateData]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <input
          type="text"
          placeholder="Search Company Name..."
          className="w-full p-3 mb-6 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filteredCompanies.map((company) => (
          <div
            key={company}
            className="mb-8 border p-4 sm:p-6 rounded-lg shadow-lg bg-white"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-center text-green-700 mb-6">
              {company} Rate Calendar
            </h1>
            {rateData
              .filter((item) => item.company === company)
              .map(({ location }) => (
                <div
                  key={location}
                  className="mb-6 border p-4 rounded-lg bg-gray-100 shadow-md"
                >
                  <h2 className="text-lg font-semibold text-center text-gray-800 mb-3">
                    {location}
                  </h2>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2 overflow-x-auto">
                      <Calendar
                        onChange={setDate}
                        value={date}
                        tileContent={({ date }) => {
                          const rateData = getRatesForDate(
                            date,
                            company,
                            location
                          );
                          return rateData ? (
                            <div
                              className={`p-3 text-center rounded-md font-semibold min-h-[50px] flex items-center justify-center text-sm sm:text-base ${
                                rateData.rateType === "new"
                                  ? "bg-green-500 text-white"
                                  : rateData.rateType === "old"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {rateData.rate}
                            </div>
                          ) : null;
                        }}
                        tileClassName={({ date }) => {
                          const rateData = getRatesForDate(
                            date,
                            company,
                            location
                          );
                          return rateData && rateData.rateType !== "none"
                            ? "border-2 border-green-400"
                            : "border border-gray-300";
                        }}
                        className="w-full border rounded-lg shadow-lg p-4 bg-white min-w-[320px] sm:min-w-[500px]"
                      />
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center items-center p-4">
                      <div className="w-full max-w-md bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                        <RateGraph
                          rateData={rateData}
                          company={company}
                          location={location}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </Suspense>
  );
}
