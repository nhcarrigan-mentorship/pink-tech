import { Link } from "react-router-dom";

// SVG logo matching the favicon
const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className="w-8 h-8 md:w-10 md:h-10"
  >
    <defs>
      <linearGradient
        id="nav-grad"
        x1="0"
        y1="0"
        x2="64"
        y2="64"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="12" fill="url(#nav-grad)" />
    <text
      x="32"
      y="45"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="32"
      fontWeight="700"
      fill="white"
      textAnchor="middle"
    >
      PT
    </text>
  </svg>
);

export default function HomeNavigation() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
    >
      <Logo />
      <span className="text-lg md:text-xl font-bold text-gray-900">
        PinkTech
      </span>
    </Link>
  );
}
