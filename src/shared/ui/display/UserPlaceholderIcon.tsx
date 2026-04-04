export default function UserPlaceholderIcon() {
  return (
    <div className="w-full h-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="100%" height="100%" fill="#fce7f3" />
        <circle cx="100" cy="75" r="35" fill="#ec4899" />
        <path
          d="M 100 120 C 65 120 40 145 40 170 L 40 200 L 160 200 L 160 170 C 160 145 135 120 100 120 Z"
          fill="#ec4899"
        />
      </svg>
    </div>
  );
}
