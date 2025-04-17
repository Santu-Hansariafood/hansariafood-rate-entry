import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const baseUrl = "https://hansariafood.site";
  const handleLogout = () => {
    localStorage.clear();
    signOut({ callbackUrl: baseUrl });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}
