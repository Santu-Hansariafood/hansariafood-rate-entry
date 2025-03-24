"use client";
import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Loading from "@/components/common/Loading/Loading";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Table = dynamic(() => import("@/components/common/Tables/Tables"));
const Actions = dynamic(() => import("@/components/common/Actions/Actions"));

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length]);

  const columns = [
    { header: "Category Name", accessor: "name" },
    { header: "Actions", accessor: "actions" },
  ];

  const data = categories.map((category) => ({
    name: category.name,
    actions: <Actions item={{ title: category.name }} />,
  }));

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-4">
        <Title text="Category List" />
        <Table data={data} columns={columns} />
      </div>
    </Suspense>
  );
};

export default CategoryList;
