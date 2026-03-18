export default function toSnakeCaseObject(obj: Record<string, any>) {
  const snakeObj: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const snakeKey = key
      // Handle lowercase/number → uppercase transitions (userId → user_id)
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      // Handle consecutive uppercase followed by lowercase (userIDNumber → user_ID_Number)
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
      .toLowerCase();

    snakeObj[snakeKey] = obj[key];
  });

  return snakeObj;
}
