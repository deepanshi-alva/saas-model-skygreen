export function getFilePath(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  // Return as-is if already a full URL (http/https)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Otherwise, assume it's a relative path from Strapi
  return `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${url}`;
}