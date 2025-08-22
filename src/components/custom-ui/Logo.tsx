"use client";
import { useStore } from "@/stores";
import Image from "next/image";

export default function Logo({ href }: { href?: string }) {
  const update = useStore((s) => s.update);
  if (href) {
    return (
      <Image
        src={href}
        alt=""
        width={16}
        height={16}
        className="w-9 cursor-pointer rounded-sm hover:scale-105 transition-transform"
        onClick={() => {}}
      />
    );
  }

  return (
    <svg
      width="250"
      height="150"
      viewBox="0 0 300 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
      </defs>

      <rect width="300" height="200" fill="#ffffff" />

      {/* Stylized car silhouette */}
      <path
        d="M30 100 Q75 40 150 40 T270 100"
        fill="none"
        stroke="#1a365d"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Water droplet */}
      <path
        d="M130 130 Q150 70 170 130 Q150 155 130 130 Z"
        fill="url(#waterGradient)"
      />

      {/* Shine effect on droplet */}
      <path
        d="M140 110 Q150 90 160 110"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Company name */}
      <text
        x="150"
        y="170"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontSize="28"
        fontWeight="700"
        fill="#1a365d"
        textAnchor="middle"
        letterSpacing="2"
      >
        LUXURY WASH
      </text>

      {/* Tagline */}
      <text
        x="150"
        y="190"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontSize="14"
        fontWeight="300"
        fill="#4a5568"
        textAnchor="middle"
        letterSpacing="1"
      >
        PREMIUM CAR CARE
      </text>
    </svg>
  );
}
