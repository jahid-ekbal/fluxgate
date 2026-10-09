const regionFromLocale = (acceptLanguage: string | null) => {
  if (!acceptLanguage) {
    return "Unknown";
  }
  const first = acceptLanguage.split(",")[0]?.trim() ?? "";
  const parts = first.split("-");
  const region = parts.length > 1 ? parts[1] : null;
  if (region && /^[A-Za-z]{2}$/.test(region)) {
    return region.toUpperCase();
  }
  return "Unknown";
};

export const looksLikeProxy = (headers: Headers) => {
  const via = headers.get("via");
  const proxyAuth = headers.get("proxy-authorization");
  const proxyConnection = headers.get("proxy-connection");
  const forwarded = headers.get("forwarded") ?? "";
  const hops = headers.get("x-forwarded-for")?.split(",") ?? [];
  return (
    via !== null ||
    proxyAuth !== null ||
    proxyConnection !== null ||
    forwarded !== "" ||
    hops.length > 2
  );
};

export const describeVisit = (headers: Headers, ip: string, path: string) => ({
  ip,
  country: regionFromLocale(headers.get("accept-language")),
  vpn: looksLikeProxy(headers),
  path,
});
