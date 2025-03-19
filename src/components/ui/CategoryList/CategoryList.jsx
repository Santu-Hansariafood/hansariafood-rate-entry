"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "@/components/common/Tables/Tables";
import Actions from "@/components/common/Actions/Actions";

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
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Category List</h2>
      <Table data={data} columns={columns} />
    </div>
  );
};

export default CategoryList;
