export default function toSnakeCaseObject(obj: Record<string, any>) {
  const snakeObj: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const snakeKey = key
      // Handle lowercase/number → uppercase transitions
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      // Handle consecutive uppercase followed by lowercase
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
      .toLowerCase();

    const value = obj[key];

    // Recursively convert nested objects inside arrays
    if (Array.isArray(value)) {
      snakeObj[snakeKey] = value.map((item) =>
        typeof item === "object" && item !== null
          ? toSnakeCaseObject(item)
          : item,
      );
    }
    // Recursively convert nested objects
    else if (value && typeof value === "object") {
      snakeObj[snakeKey] = toSnakeCaseObject(value);
    } else {
      snakeObj[snakeKey] = value;
    }
  });

  return snakeObj;
}
