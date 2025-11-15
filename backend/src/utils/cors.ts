export const getAllowedOrigins = (): string | string[] => {
  const rawOrigin = process.env.CORS_ORIGIN || '*';
  if (rawOrigin === '*') {
    return '*';
  }
  return rawOrigin
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
};
