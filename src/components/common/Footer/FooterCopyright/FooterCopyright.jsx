import React from "react";

const FooterCopyright = () => {
  return (
    <p className="text-sm mb-2 md:mb-0">
      Developed by
      <a
        href="https://www.hansariafood.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-400 hover:underline ml-1"
      >
        Hansaria Food Private Limited
      </a>
      <span> © {new Date().getFullYear()}</span>
    </p>
  );
};

export default FooterCopyright;
