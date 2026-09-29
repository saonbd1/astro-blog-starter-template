---
title: "7 Ways to Fix a Fast-Draining Windows 11 Battery"
description: "Windows 11 battery drains fast? Find the apps that use the most power and stop them. Run 7 fixes, from battery saver to a battery report."
pubDate: "Sep 28 2026"
heroImage: "/article-media/7-ways-to-fix-draining-laptop-windows.png"
category: "PC Troubleshooting"
tags: ["Windows", "PC Maintenance", "Troubleshooting", "Beginner Guide"]
---

<!-- SEO: title 48/60 chars, description 137/160 chars. Focus keyword: windows 11 battery drains fast fix -->

A Windows 11 laptop can lose its full charge in a few hours. The battery icon drops quickly, and the laptop shuts down early. This problem has four common causes: a bright screen, a power-hungry app, a changed power plan, or an old battery.

The fixes below start with the easiest one. Each fix takes 1 to 10 minutes. If one fix does not work, continue to the next fix.

## Before You Start

- Connect the charger before you start the fixes.
- Make sure that the charger works. The battery icon must show a charge.
- Write down the battery percentage at the start of the day.

## Fix 1: Lower the Brightness and Turn On Battery Saver

The screen uses the most power on a laptop. Battery saver reduces the power use of every app.

- Open Settings.
- Select System > Power & battery.
- Move the Brightness slider to 50 percent or lower.
- Select Battery saver.
- Set "Turn battery saver on at" to 20 percent.

## Fix 2: Find the Apps That Use the Most Power

Windows shows the power use for every app. One app can drain the battery by itself.

- Open Settings.
- Select System > Power & battery.
- Select Battery usage.
- Find the app at the top of the list. This app uses the most power.
- Select that app.
- If the app runs in the background, set "Let this app run in background" to Never.
- Repeat these steps for the next app in the list.

## Fix 3: Shorten the Screen and Sleep Times

Windows keeps the screen on for the time that you set. The screen uses power the whole time.

- Open Settings.
- Select System > Power & battery.
- Select Screen and sleep.
- Set "Turn off my screen after" to 5 minutes on battery.
- Set "Put my device to sleep after" to 15 minutes on battery.

## Fix 4: Disable the Startup Apps

Startup apps start with Windows. These apps use the battery before you open them.

- Right-click the Start button.
- Select Task Manager.
- Select Startup apps.
- Disable every app that you do not need at sign-in.
- Restart the computer.

## Fix 5: Turn Off the Radio Connections and Syncing

The Wi-Fi and the Bluetooth connections use power in the background. Sync services such as OneDrive also use the battery.

- Select the network icon on the taskbar.
- If you do not need the internet, select the Wi-Fi button to turn it off.
- If no device needs Bluetooth, turn off the Bluetooth button.
- Select the OneDrive icon in the taskbar.
- Select Pause syncing and select 2 hours.

## Fix 6: Restore the Default Power Schemes

A changed power plan can increase the power use. Windows stores three default power schemes.

CAUTION: If you accept the loss of your custom settings, run this command. The command removes every custom power setting.

- Select Search on the taskbar.
- Type cmd and open Command Prompt as administrator.
- Run this command:

```
powercfg -restoredefaultschemes
```

- Restart the computer.
- Watch the battery use for one day.

## Fix 7: Read the Battery Report

Windows generates a battery report. The report shows the design capacity and the full charge capacity of the battery.

- Select Search on the taskbar.
- Type cmd and open Command Prompt as administrator.
- Run this command:

```
powercfg /batteryreport
```

- Open the file `C:\Windows\System32\battery-report.html`.
- Find DESIGN CAPACITY and FULL CHARGE CAPACITY in the report.

An old battery holds less charge than its design capacity. If full charge capacity is less than half of design capacity, a new battery restores the run time.

## Frequently Asked Questions

### Why does the battery drain fast on Windows 11?

A bright screen and the background apps use the most power. Windows shows the power use for every app. Fix 2 finds the app with the highest use.

### Does battery saver protect the battery?

Battery saver reduces the power use of every app. The run time between two charges then becomes longer.

### How long does a laptop battery last?

A new laptop battery gives 4 to 8 hours of work. The run time becomes shorter as the battery ages.

### Does a Windows update use the battery?

A big update can use the battery for one day. The power use returns to normal after the update completes.

## If the Problem Continues

If these fixes do not slow the drain, the battery or the hardware is faulty. A USB device can draw power from the battery. A damaged drive can also increase the power use. A repair technician can measure the power use of the laptop.

## Related Articles

- [Fix Windows 11 Stuck on Getting Updates Loop in 5 Steps](/blog/how-to-fix-windows-11-stuck-on-getting-updates-loop)
- [Windows 11 No Sound After Update? 7 Ways to Get It Back](/blog/windows-11-no-sound-after-update)
- [Simple Tips to Solve Your PC Startup and Shutdown Problems](/blog/simple-tips-to-solve-your-pc-startup-and-shutdown-problems)

<!-- Add this link when the article is published:
- [7 Fixes for a Windows 11 Taskbar and Start Menu Missing](/blog/windows-11-taskbar-start-menu-not-showing)
-->
