---
title: "Why Windows 11 Keeps Disconnecting Wi-Fi, and How to Fix It"
description: "Windows 11 Wi-Fi keeps disconnecting every few minutes? Try these 9 fixes, from a driver setting to a full network reset."
pubDate: "Sep 29 2026"
heroimage: "/windows11_wifi_fix_diagram.png"
category: "PC Troubleshooting"
tags: ["Windows", "PC Maintenance", "Troubleshooting", "Networking"]
---

<!-- SEO: title 59/60 chars, description 121/160 chars. Focus keyword: windows 11 wifi keeps disconnecting every few minutes fix -->

Windows 11 can lose the Wi-Fi connection every few minutes. The icon shows "Disconnected" or "No internet". Then the connection comes back on its own. This problem has four common causes: a driver fault, a power setting, a router band, or a damaged adapter.

The fixes below start with the easiest one. Each fix takes 1 to 15 minutes. If one fix does not work, continue to the next fix.

## Before You Start

- Save your open work.
- Save the name and the password of your Wi-Fi network.
- Connect a phone to the same network.
- If the phone disconnects too, restart the router before you repair the computer.

## Fix 1: Run the Network Troubleshooter

Windows 11 has a troubleshooter that repairs common network errors. The Get Help app contains a second troubleshooter.

- Open Settings.
- Select System > Troubleshoot > Other troubleshooters.
- Select Run for Network & Internet.
- Wait for the troubleshooter to finish.
- Test the connection after the troubleshooter closes.

## Fix 2: Restart the Router and the Computer

A router that runs for weeks can stop a stable connection. A restart clears its memory.

- Disconnect the power from the router.
- Wait 30 seconds.
- Connect the power to the router.
- Wait until the router finishes its restart.
- Restart the computer.

## Fix 3: Forget the Network and Connect Again

Windows stores the password and the security type of every network. A wrong stored password stops the connection.

CAUTION: Do not forget a network that uses a certificate for sign-in. The computer needs the certificate to connect again.

- Open Settings.
- Select Network & internet > Wi-Fi.
- Select Manage known networks.
- Select Forget for your Wi-Fi network.
- Select your Wi-Fi network from the list.
- Enter the password and select Connect.

## Fix 4: Stop the Adapter Power Saving

Windows turns off the wireless adapter to save power. This turn off breaks the connection after a few minutes. This fault causes most of the drops.

- Select Search on the taskbar.
- Type Device Manager and select Device Manager.
- Expand Network adapters.
- Right-click your wireless network adapter and select Properties.
- Select the Power Management tab.
- Clear the box for "Allow the computer to turn off this device to save power".
- Select OK.
- Restart the computer.

## Fix 5: Set One Wireless Band

Some routers use the same name for the 2.4 GHz band and the 5 GHz band. An adapter with automatic band selection can then lose the connection.

- Right-click your wireless network adapter in Device Manager and select Properties.
- Select the Advanced tab.
- Find the setting for Wireless Mode or Band.
- Select one band only: 2.4 GHz only or 5 GHz only.
- If the list has the Roaming Aggressiveness setting, select it. Set the value to Lowest.
- Select OK.
- Restart the computer.

## Fix 6: Start the WLAN AutoConfig Service

Every Wi-Fi connection needs the WLAN AutoConfig service. Without this service, the connection drops every few minutes.

- Press Windows + R.
- Type services.msc and select OK.
- Find WLAN AutoConfig in the list.
- Make sure that the Startup type is Automatic.
- Right-click WLAN AutoConfig and select Start.
- Restart the computer.

## Fix 7: Reset the Network

Network reset removes every network setting on the computer. The reset also removes VPN connections and stored Wi-Fi passwords.

CAUTION: Before you run the reset, save your Wi-Fi passwords. The reset removes them.

- Connect the computer to an Ethernet cable.
- Open Settings.
- Select Network & internet > Wi-Fi.
- Select Network reset at the bottom of the Wi-Fi page.
- Follow the instructions. Then restart the computer.

## Fix 8: Update the Driver

A driver fault causes many of the drops. The driver from Windows Update can also be faulty. The driver from the computer manufacturer gives a more stable result.

- Open Device Manager.
- Expand Network adapters.
- Right-click your wireless network adapter.
- Select Update driver.
- Select Search automatically for drivers.
- Restart the computer.
- If the drops continue, download the driver from the website of the computer manufacturer.

## Fix 9: Disable the VPN and the Third-Party Firewall

A VPN or a third-party firewall can close the connection. Windows Defender Firewall does not cause this problem.

- Disable the VPN.
- Disable the firewall of the third-party antivirus software.
- Make sure that the connection stays on for 15 minutes.
- After the test, enable the software again.

## Frequently Asked Questions

### Why does Windows 11 Wi-Fi disconnect every few minutes?

The most common cause is the power saving setting for the wireless adapter. Windows turns off the adapter, and the connection drops. Fix 4 removes this setting.

### Does a VPN stop the Wi-Fi connection?

A VPN can close the connection or change the network route. Test the computer without the VPN. If the drops stop, the VPN causes them.

### Does a Windows update fix the drops?

A new driver can repair a faulty driver. The driver from the computer manufacturer gives a more stable result.

### Does the router cause the problem?

A router that runs for weeks can stop a stable connection. A second computer on the same network shows the result. Fix 2 restarts the router.

## If the Problem Continues

If these fixes do not stop the drops, the adapter hardware can be faulty. Test the same network with a second computer. If the second computer stays online, the fault is in this computer. The firmware of the router can also stop the connection. Microsoft recommends the current firmware from the router manufacturer.

## Related Articles

- [Fix Windows 11 Stuck on Getting Updates Loop in 5 Steps](/blog/how-to-fix-windows-11-stuck-on-getting-updates-loop)
- [How to Repair Corrupted Windows 11 System Files with SFC and DISM](/blog/how-to-repair-corrupted-windows-11-system-files-sfc-dism)
- [Setting up a privacy-first home network with Pi-hole and WireGuard](/blog/setting-up-privacy-first-home-network)

<!-- Add these links when the articles are published:
- [Windows 11 No Sound After Update? 7 Ways to Get It Back](/blog/windows-11-no-sound-after-update)
- [7 Ways to Fix a Fast-Draining Windows 11 Battery](/blog/windows-11-battery-drains-fast)
- [7 Fixes for a Windows 11 Taskbar and Start Menu Missing](/blog/windows-11-taskbar-start-menu-not-showing)
-->
