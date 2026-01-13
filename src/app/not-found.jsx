"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { MapPin, Mail, Building2, ArrowLeft, QrCode } from "lucide-react";

export default function NotFound() {
  const [qrUrl, setQrUrl] = useState("");
  const APPOINTMENT_URL = "https://forms.gle/gyjespdMQfxVhhFx8";

  useEffect(() => {
    QRCode.toDataURL(APPOINTMENT_URL, { width: 180, margin: 2 })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error("QR error:", err));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-6">
      <div className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo/logo1.png"
            alt="Hansaria Food Logo"
            width={96}
            height={96}
            className="ml-2"
          />
        </div>
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-600 mb-2">
          Hansaria Food Private Limited
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This application is for <strong>internal use only</strong>.
          <br />
          You do not have access to this page or the link is incorrect.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-3 mb-6">
          <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
            <MapPin size={18} className="mt-0.5 text-green-600" />
            <span>
              <strong>Office:</strong> Primarc Square, Plot No.1, Salt Lake
              Bypass, LA Block, Sector: 3, Bidhannagar, Kolkata, West Bengal
              700106
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <Mail size={18} className="text-green-600" />
            <span>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:info@hansariafood.com"
                className="text-green-600 hover:underline"
              >
                info@hansariafood.com
              </a>
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          If you believe you should have access, please contact the office or
          visit us directly for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            <ArrowLeft size={16} />
            Go to Home
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Login Again
          </Link>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <QrCode size={18} />
            Scan to take appointment
          </div>

          {qrUrl && (
            <img
              src={qrUrl}
              alt="Appointment QR Code"
              className="w-40 h-40 rounded-lg border border-gray-300 dark:border-gray-700 bg-white p-2"
            />
          )}

          <a
            href={APPOINTMENT_URL}
            target="_blank"
            className="text-xs text-blue-600 hover:underline"
          >
            Open appointment link
          </a>
        </div>
      </div>
    </div>
  );
}
