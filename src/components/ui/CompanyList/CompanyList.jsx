"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "@/components/common/Tables/Tables";
import Actions from "@/components/common/Actions/Actions";

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
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Company List</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default CompanyList;
