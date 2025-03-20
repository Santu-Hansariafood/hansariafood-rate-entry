"use client";
import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const Title = dynamic(() => import("@/components/common/Title/Title"));
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
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Location List" />
        <Table data={data} columns={columns} />
      </div>
    </Suspense>
  );
};

export default LocationList;
