# JGLOVR-OS 3.11 Desktop Edition & Floppy Disk Collector Guide

The **Downloaded / Desktop Version** of **JGLOVR-OS 3.11** is an Electron desktop app wrapper designed for enthusiasts and physical floppy disk collectors. It runs locally as a native desktop workstation with zero-click physical USB floppy drive auto-detection.

---

## 🛠️ Step-by-Step Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- A USB Floppy Disk Drive & 3.5" High-Density Floppy Disks *(optional, for physical floppy collectors)*

---

### Step 1: Navigate to the Desktop App Subfolder
Open your terminal (PowerShell, Command Prompt, or Terminal) and change to the `desktop-app` directory inside your repository:

```bash
cd desktop-app
```

---

### Step 2: Install Dependencies
Run `npm install` to download Electron and the required build utilities:

```bash
npm install
```

---

### Step 3: Run the Application Locally
Launch the workstation app on your computer:

```bash
npm start
```

The retro workstation window will open.

---

### Step 4: Building Standalone Executable Apps *(Optional)*
If you want to package the app into a standalone Windows `.exe` or macOS `.app` installer that can be launched without terminal commands, run:

```bash
npm run build
```

The packaged installers will be generated inside the `desktop-app/dist/` directory.

---

## 💾 Physical Floppy Disk Support & Distribution

### How Physical Floppy Auto-Detection Works
1. When you insert a physical 3.5" USB Floppy Disk into drive **`A:\`** on Windows (or **/Volumes/** on macOS / Linux), the desktop app process scans the drive every 1.5 seconds.
2. When a floppy disk containing a game file (`CODYFROG.EXE`, `TRAIN.EXE`, `GNOMES.EXE`, `SYS_VOID.EXE`, or `GRIDMIX.EXE`) is detected, the app:
   - Plays an authentic randomized mechanical floppy drive head seek sound.
   - Pops up the **Physical Floppy Disk Detected** dialog.
   - Offers to **Run directly off the physical disk (`A:\`)** or **Copy & Install to local AppData (`C:\GAMES`)** so the game persists across restarts even after ejecting the disk.

---

## 💾 Creating Physical Floppy Disks for Collectors

You can burn any game from the repository's `disks/` folder onto actual 3.5" USB Floppy Disks:

1. Insert a blank 3.5" Floppy Disk into your USB Floppy Drive (`A:\`).
2. Format the disk as **FAT / FAT16** (1.44 MB).
3. Copy any executable file from `disks/` onto the root of the floppy disk:
   - `disks/CODYFROG.EXE` (Cody Frog - Mac II System 7 Edition)
   - `disks/CODY26.EXE` (Cody Frog '26 - Original Modern 3D Edition)
   - `disks/TRAIN.EXE` (Train Game - 3D Rail Sim & Covered Bridge Sheds)
   - `disks/GNOMES.EXE` (Gnomes in the Tall Grass - 3D Meadow Sim)
   - `disks/SYS_VOID.EXE` (S Y S T E M _ V O I D - Vector Arcade Shooter)
   - `disks/GRIDMIX.EXE` (Music Grid Synth - 16-Step Audio Sequencer)
4. Insert the floppy disk into your computer while running `npm start` — the desktop workstation will automatically detect the physical disk!
