"use client";

import React from "react";

const Title = ({ text }) => {
  return (
    <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
      {text}
    </h2>
  );
};

export default Title;
