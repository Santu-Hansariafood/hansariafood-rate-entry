// "use client";

// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function Dashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/login");
//     }
//   }, [status, router]);

//   if (status === "loading") return <p>Loading...</p>;

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}!</h1>
//       <p className="text-gray-600">Mobile: {session?.user?.mobile}</p>
//       <button
//         onClick={() => signOut()}
//         className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
//       >
//         Logout
//       </button>
//     </div>
//   );
// }
import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page