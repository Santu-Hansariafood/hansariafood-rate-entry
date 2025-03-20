"use client";
import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/companies");
        setCompanies(response.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [companies.length]);

  const columns = [
    { header: "Company Name", accessor: "name" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = companies.map((company) => ({
    name: company.name,
    actions: <Actions item={{ title: company.name }} />,
  }));

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Company List" />
        <Table data={data} columns={columns} />
      </div>
    </Suspense>
  );
};

export default CompanyList;
