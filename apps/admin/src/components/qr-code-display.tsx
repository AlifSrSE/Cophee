"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface QRCodeDisplayProps {
  tableId: string;
  url: string;
}

export default function QRCodeDisplay({ tableId, url }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 128,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }).then((url) => {
      setQrCodeUrl(url);
    }).catch((err) => {
      console.error("Error generating QR code:", err);
    });
  }, [url]);

  if (!qrCodeUrl) {
    return <div className="w-32 h-32 bg-gray-100 animate-pulse rounded" />;
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <img src={qrCodeUrl} alt={`QR Code for Table ${tableId}`} className="w-32 h-32" />
      <span className="text-xs text-gray-500">Table {tableId}</span>
    </div>
  );
}
