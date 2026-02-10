export default function toSnakeCaseObject(obj: Record<string, any>) {
  const snakeObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    snakeObj[snakeKey] = obj[key];
  });
  return snakeObj;
}
