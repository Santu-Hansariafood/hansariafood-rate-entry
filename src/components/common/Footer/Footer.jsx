const Footer = () => {
  return (
    <footer className="bg-black text-white text-center py-6 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
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
          © {new Date().getFullYear()}
        </p>
        <div className="flex gap-6 text-sm">
          <a
            href="https://hansariafood.shop"
            target="_blank"
            className="hover:text-green-400 transition"
          >
            Click to Generate Bill and Bids
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
