import { PASSWORD_RULES } from "../../utils/validators";
import LazyIcon from "./LazyIcon";

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.filter((r) => r.label !== "At most 128 characters").map(
        (rule) => {
          const met = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`flex items-center gap-1.5 text-xs ${
                met ? "text-green-600" : "text-gray-400"
              }`}
            >
              <LazyIcon
                name={met ? "CircleCheck" : "Circle"}
                className="w-3.5 h-3.5 shrink-0"
              />
              {rule.label}
            </li>
          );
        },
      )}
    </ul>
  );
}
