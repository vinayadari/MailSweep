import dns from "node:dns/promises";
import net from "node:net";

const V4 = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./, /^192\.0\.0\./, /^198\.1[89]\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^2(2[4-9]|[3-5]\d)\./, // multicast + reserved
];

export function isPrivateIp(ip) {
  if (net.isIPv6(ip)) return /^(::1?$|fc|fd|fe[89ab]|::ffff:)/i.test(ip);
  return V4.some((r) => r.test(ip));
}

/** Resolve the hostname and reject if ANY address is non-public. Call before every outbound hop. */
export async function assertPublicHost(hostname) {
  const host = hostname.replace(/^\[|\]$/g, "");
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) {
    throw new Error("host resolves to a non-public address");
  }
}
