---
title: "Setting up a privacy-first home network with Pi-hole + WireGuard"
description: "My home network used to be a factory-default router with no thought given to privacy. Now every device on it has DNS-level ad blocking, and I can tunn..."
pubDate: "Jul 17 2026"
heroImage: "/blog-placeholder-3.jpg"
---

My home network used to be a factory-default router with no thought given to privacy. Now every device on it has DNS-level ad blocking, and I can tunnel into it from anywhere. Here’s how I got there.

## Part 1: Pi-hole on a Raspberry Pi

Pi-hole is a DNS sinkhole — it intercepts DNS requests for known ad/tracking domains and blocks them before they reach your browser. Install it with one command:

```
curl -sSL https://install.pi-hole.net | bash
```

Then set your router’s DNS server to your Pi’s IP address. Every device on the network gets ad-blocking automatically — including phones, smart TVs, and game consoles.

## Part 2: WireGuard VPN

WireGuard is the modern VPN protocol — faster and simpler than OpenVPN. I run it on the same Pi, which means when I’m on public WiFi, I can tunnel back to my home network and route through Pi-hole.

```
# Generate keys
wg genkey | tee private.key | wg pubkey > public.key

# wg0.conf example
[Interface]
Address = 10.0.0.1/24
ListenPort = 51820
PrivateKey = <your-private-key>
```

> Running your own VPN means the only one who can see your traffic is you.

The whole setup took about 3 hours including troubleshooting. The result: zero ads on every device, a personal VPN I trust, and a deeper understanding of how DNS works.
