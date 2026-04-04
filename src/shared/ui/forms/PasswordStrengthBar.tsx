interface PasswordStrengthBarProps {
  passwordStrength: number;
}

export default function PasswordStrengthStrengthBar({
  passwordStrength,
}: PasswordStrengthBarProps) {
  const levels = [
    { min: 0, label: "", bars: 0 },
    { min: 1, label: "Very weak", bars: 1 },
    { min: 2, label: "Weak", bars: 2 },
    { min: 3, label: "Fair", bars: 3 },
    { min: 5, label: "Strong", bars: 4 },
    { min: 6, label: "Very strong", bars: 5 },
  ];

  const level = [...levels].reverse().find((l) => passwordStrength >= l.min)!;

  const colors = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-lime-500",
    "bg-green-500",
  ];

  const textColors = [
    "",
    "text-red-500",
    "text-orange-400",
    "text-yellow-500",
    "text-lime-600",
    "text-green-600",
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < level.bars ? colors[level.bars] : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {level.label && (
        <p className={`text-xs font-medium ${textColors[level.bars]}`}>
          {level.label}
        </p>
      )}
    </div>
  );
}
