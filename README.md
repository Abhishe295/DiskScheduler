# DiskScheduler

DiskScheduler is a React + Vite web app for visualizing and comparing classic disk scheduling algorithms used in operating systems.

## Basics

The app lets you:

- Enter a request queue, head position, disk size, and head direction.
- Run scheduling simulation for:
  - FCFS (First Come First Serve)
  - SSTF (Shortest Seek Time First)
  - SCAN
  - C-SCAN
- View:
  - Total seek time
  - Access sequence
  - Movement chart
  - Comparison table across all algorithms

## Tech Stack

- React
- Vite
- ESLint
- Framer Motion

## Installation

### Prerequisites

- Node.js 20+ (recommended)
- npm

### Setup

```bash
git clone git@github.com:yashwantB/DiskScheduler.git
cd DiskScheduler
npm install
```

### Run in Development

```bash
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`).

## Available Scripts

```bash
npm run dev      # Start local dev server
npm run build    # Create production build in dist/
npm run preview  # Preview production build locally
npm run lint     # Run ESLint checks
```

## How to Use

1. Enter request queue values (comma-separated integers).
2. Enter head position and disk size.
3. Pick direction (`left` or `right`) for SCAN/C-SCAN behavior.
4. Select algorithm.
5. Click **Run Simulation**.
6. Explore the Result, Chart, and Compare tabs.

## Project Structure

```text
src/
  algorithms/    # FCFS, SSTF, SCAN, C-SCAN logic
  components/    # UI components
  App.jsx        # Main app shell and flow
```
