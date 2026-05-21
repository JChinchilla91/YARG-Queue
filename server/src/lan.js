import os from 'os';

/** Adapters that are not reachable from phones on Wi‑Fi */
const SKIP_ALIAS = /virtualbox|vethernet|wsl|hyper-v|vmware|loopback|bluetooth|nordlynx|openvpn|vpn|tap-|teredo|isatap/i;

function isPreferredLan(ip, alias) {
  if (!/wi-?fi|ethernet/i.test(alias)) return false;
  if (ip.startsWith('192.168.') && !ip.startsWith('192.168.56.')) return true;
  // Home routers sometimes use 10.x; skip NordVPN-style 10.5.0.x
  if (ip.startsWith('10.') && !ip.startsWith('10.5.0.')) return true;
  return false;
}

function isLinkLocal(ip) {
  return ip.startsWith('169.254.');
}

function isLikelyVirtual(ip, alias) {
  if (SKIP_ALIAS.test(alias)) return true;
  // VirtualBox host-only
  if (ip.startsWith('192.168.56.')) return true;
  // WSL / Hyper-V common ranges
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  return false;
}

/**
 * IPv4 addresses phones on the same Wi‑Fi can use to reach this PC.
 * @returns {{ address: string, interface: string, preferred: boolean }[]}
 */
export function getLanAddresses() {
  const nets = os.networkInterfaces();
  const results = [];

  for (const [name, iface] of Object.entries(nets)) {
    for (const net of iface ?? []) {
      if (net.family !== 'IPv4' || net.internal) continue;
      const ip = net.address;
      if (isLinkLocal(ip)) continue;
      if (isLikelyVirtual(ip, name)) continue;

      results.push({
        address: ip,
        interface: name,
        preferred: isPreferredLan(ip, name),
      });
    }
  }

  results.sort((a, b) => {
    if (a.preferred !== b.preferred) return a.preferred ? -1 : 1;
    return a.interface.localeCompare(b.interface);
  });

  return results;
}

export function getJoinUrls() {
  const port = Number(process.env.PORT ?? 3001);
  const devPort = Number(process.env.CLIENT_PORT ?? 5173);
  const production = process.env.NODE_ENV === 'production';
  const ips = getLanAddresses();

  const urls = [];
  for (const { address, interface: iface, preferred } of ips) {
    if (production) {
      urls.push({
        url: `http://${address}:${port}`,
        ip: address,
        port,
        mode: 'production',
        interface: iface,
        preferred,
        hint: 'Use this URL on phones (app + API on one port)',
      });
    } else {
      urls.push({
        url: `http://${address}:${devPort}`,
        ip: address,
        port: devPort,
        mode: 'development',
        interface: iface,
        preferred,
        hint: 'Vite dev server (proxies API to this PC)',
      });
    }
  }

  return urls;
}
