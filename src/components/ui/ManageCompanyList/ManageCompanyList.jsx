"use client";
import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));

const ManageCompanyList = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/managecompany");
        setCompanies(response.data.companies || []);
      } catch (error) {
        console.error("Error fetching managed companies:", error);
      }
    };

    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [companies.length]);

  const columns = [
    { header: "Company Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "Locations", accessor: "locations" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = companies.map((company) => ({
    name: company.name,
    category: company.category,
    locations: company.location.join(", "),
    actions: <Actions item={{ title: company.name }} />,
  }));

  return (
    <Suspense fallback={<p>Loading..</p>}>
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Manage Company List</h2>
        <Table data={data} columns={columns} />
      </div>
    </Suspense>
  );
};

export default ManageCompanyList;
