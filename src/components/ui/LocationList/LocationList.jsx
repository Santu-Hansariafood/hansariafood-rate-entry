"use client";
import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));

const LocationList = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("/api/location");
        setLocations(response.data.locations || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    if (locations.length === 0) {
      fetchLocations();
    }
  }, [locations.length]);

  const columns = [
    { header: "Location Name", accessor: "name" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = locations.map((location) => ({
    name: location.name,
    actions: <Actions item={{ title: location.name }} />,
  }));

  return (
    <Suspense fallback={<p>Loading...</p>}>
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Location List</h2>
      <Table data={data} columns={columns} />
    </div>
    </Suspense>
  );
};

export default LocationList;
