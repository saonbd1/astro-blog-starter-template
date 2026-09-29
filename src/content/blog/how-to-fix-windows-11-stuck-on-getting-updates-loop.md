---
title: "Fix Windows 11 Stuck on Getting Updates Loop in 5 Steps"
description: "Windows 11 stuck on the Getting updates loop? Run 5 fixes in order, from a simple restart to a full update cache reset. Most take under 30 minutes."
pubDate: "Sep 29 2026"
heroImage: "/windows-11-stuck-getting-updates-loop-cover.png"
category: "PC Troubleshooting"
tags: ["Windows", "PC Maintenance", "Troubleshooting", "Beginner Guide"]
---

<!-- SEO: title 55/60 chars, description 147/160 chars. Focus keyword: how to fix windows 11 stuck on getting updates loop -->

Windows Update sometimes stops at the message "Getting updates" and stays there. The progress bar does not move, and no update installs. This problem has three common causes: a damaged update cache, wrong system time, or a damaged system file.

CAUTION: Do not shut down the computer while an update installs. A power loss can damage Windows.

The steps below start with the easiest method. Each method takes about 5 to 30 minutes. If one method does not work, continue to the next one.

## Before You Start

- Make sure that the computer has at least 10 GB of free disk space.
- Make sure that the computer has a stable network connection.
- Save your open work.

## Method 1: Wait, Then Restart

One update can need up to two hours on a slow network.

- If the message "Getting updates" does not change after 30 minutes, restart the computer.
- Run the update again in Windows Update.

## Method 2: Run the Windows Update Troubleshooter

![other-troubleshoot-windows-11](other-troubleshoot-windows-11.png)
Windows Update includes a troubleshooter for common problems.

- Select Start > Settings > System > Troubleshoot > Other troubleshooters.
- Select Run for "Windows Update".
- Wait for the troubleshooter to finish.
- Run the update again in Windows Update.

## Method 3: Reset the Update Cache

Windows stores downloaded updates in the update cache, the folder `C:\Windows\SoftwareDistribution`. Damaged files in this folder can block the update. If the folder does not exist, Windows creates a new copy after a restart.

CAUTION: Before you rename the folders, stop the update services. If a service still runs, the rename can fail.

- Open Command Prompt as administrator.
- Run these commands to stop the update services:

```
net stop wuauserv
net stop bits
net stop cryptsvc
```

- Rename the cache folders:

```
ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
ren C:\Windows\System32\catroot2 catroot2.old
```

- Run these commands to start the update services:

```
net start wuauserv
net start bits
net start cryptsvc
```

- Restart the computer.
- Run the update again in Windows Update.

## Method 4: Repair System Files

A damaged system file can block Windows Update. Windows includes two repair tools: DISM and System File Checker. For the full repair guide, read [How to Repair Corrupted Windows 11 System Files with SFC and DISM](/blog/how-to-repair-corrupted-windows-11-system-files-sfc-dism).

- Open Command Prompt as administrator.
- Run `DISM /Online /Cleanup-Image /RestoreHealth`.
- Wait until the command finishes.
- Run `sfc /scannow`.
- If the scan finds damaged files, restart the computer.
- Run the update again in Windows Update.

## Method 5: Date, Time, and Network

Windows Update needs a correct system date and time. A VPN or proxy can also block the connection.

- Make sure that the date and time are correct in `Settings > Time & language > Date & time`.
- If you use a VPN, disconnect it.
- If you use a proxy, disable it in `Settings > Network & internet > Proxy`.
- Run the update again in Windows Update.

## If the Problem Continues

If these methods do not fix the problem, the Windows Update components need a deeper repair. You can repair Windows 11 with the Installation Assistant. The assistant downloads Windows 11 and repairs system files. The repair keeps your files and apps.

## Related Articles

- [How to Repair Corrupted Windows 11 System Files with SFC and DISM](/blog/how-to-repair-corrupted-windows-11-system-files-sfc-dism)
- [Simple Tips to Solve Your PC Startup and Shutdown Problems](/blog/simple-tips-to-solve-your-pc-startup-and-shutdown-problems)

<!-- Add these links when the articles are published:
- [Why Windows 11 Keeps Disconnecting Wi-Fi, and How to Fix It](/blog/windows-11-wifi-keeps-disconnecting/)
- [Windows 11 No Sound After Update? 7 Ways to Get It Back](/blog/windows-11-no-sound-after-update/)
- [7 Ways to Fix a Fast-Draining Windows 11 Battery](/blog/windows-11-battery-drains-fast/)
- [7 Fixes for a Windows 11 Taskbar and Start Menu Missing](/blog/windows-11-taskbar-start-menu-not-showing/)
-->
