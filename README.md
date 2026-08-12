# Excel Grid View

A fast, web-based spreadsheet that looks and works like Microsoft Excel. It is built using **TypeScript** and HTML5 **Canvas**, which means it draws cells directly on the screen instead of creating thousands of heavy web elements. This keeps the app smooth and responsive.

The engine easily handles a huge grid of **100,000 rows** and **500 columns** by only drawing the cells you can actually see on your screen at any given moment.

---

## 🚀 Key Features

*   **Virtual Screen Drawing:** Avoids browser slowdowns by painting gridlines, words, and headers directly onto a canvas. It only renders what fits inside your current view window.
*   **Built for Massive Data:** Built to manage 100,000 rows, 500 columns, and pre-load 50,000 data records with zero lag.
*   **Easy Cell Selection:** Click, drag, or use your keyboard to highlight single cells, blocks of cells, entire rows, or entire columns.
*   **Typing Inside Cells:** Double-click or press Enter to open a typing box right over a cell. It stays locked to the cell even if you scroll while typing.
*   **Click-and-Drag Resizing:** Adjust row heights and column widths by grabbing their borders with your mouse.
*   **Live Status Bar:** Instantly calculates the `Count`, `Sum`, `Average`, `Minimum`, and `Maximum` value of whatever cells you currently have highlighted.
*   **Undo and Redo:** Tracks your changes so you can press `Ctrl + Z` to fix mistakes or `Ctrl + Y` to re-apply an action.

---

## 🛠️ Tech Stack

*   **Language:** TypeScript
*   **Visuals:** HTML5 Canvas, HTML, CSS
*   **Build Tool:** Vite
*   **Coding Patterns:** Object-Oriented Programming (OOP) and Command-based action tracking.

---

## 📂 Project Structure

```text
src/
├── core/
│   └── Grid.ts                      # The central hub that connects everything
├── data/
│   ├── CellModel.ts                 # Holds single cell info (text, numbers, or empty)
│   ├── CellType.ts                  # Defines the kinds of data a cell can hold
│   ├── ColumnModel.ts               # Keeps track of column sizes and numbers
│   ├── GridDataStore.ts             # The main database saving cell data
│   ├── JsonDataLoader.ts            # Generates mock data to fill the grid
│   └── RowModel.ts                  # Keeps track of row sizes and numbers
├── render/
│   ├── GridRenderer.ts              # Hand-draws lines, numbers, and colors on screen
│   └── ViewportManager.ts           # Figures out exactly what is visible on screen
├── selection/
│   ├── SelectionManager.ts          # Tracks what cells the user highlighted
│   └── SelectionType.ts             # Labels the selection (single cell, range, row)
├── edit/
│   └── EditManager.ts               # Controls the popup box you type into
├── commands/
│   ├── ICommand.ts                  # The rulebook for creating undoable actions
│   ├── CommandManager.ts            # The history tracker for undo/redo operations
│   ├── EditCellCommand.ts           # Saves cell text changes for undoing
│   ├── ResizeColumnCommand.ts       # Saves column width changes for undoing
│   └── ResizeRowCommand.ts          # Saves row height changes for undoing
├── summary/
│   ├── SummaryCalculator.ts         # Runs the math on highlighted cells
│   ├── SummaryResult.ts             # Holds the calculated math answers
│   └── StatusBar.ts                 # Shows the math text at the bottom of the screen
├── main.ts                          # Starts the application
└── style.css                        # Basic layout styles
```

---

## 🧱 How the Code Works Together

Instead of parts of the app blindly changing things, everything talks directly through a central system leader called `Grid.ts`.

### The Flow of Data
*   **Grid.ts** listens to your mouse clicks, scrolls, and key presses.
*   It passes those movements to the **SelectionManager** or **EditManager**.
*   If you change data or resize a line, a "Command" is sent to the **CommandManager** to log it in history.
*   The **ViewportManager** calculates exactly which cells are moved into view.
*   Finally, the **GridRenderer** wipes the canvas clean and draws the updated view instantly.

---

## ⌨️ Controls & Keyboard Shortcuts

| Action | How to Do It | What Happens |
| :--- | :--- | :--- |
| **Move Around** | `Arrow Keys` | Moves your selected cell box. The screen auto-scrolls if you hit the edge. |
| **Start Typing** | `Double-Click` / `F2` / `Enter` | Opens a text input box exactly over the cell. |
| **Save Changes** | `Enter` | Saves what you typed, adds it to undo history, and targets the grid again. |
| **Cancel Typing** | `Escape` | Closes the typing box without saving anything. |
| **Undo** | `Ctrl + Z` | Reverts your last edit or line resize. |
| **Redo** | `Ctrl + Y` | Re-does the action you just undid. |
| **Resize Lines** | `Mouse Drag` on header borders | Changes row height or column width dynamically. |

---

## ⚙️ How to Run the Project

### What You Need
*   [Node.js](https://nodejs.org) installed on your computer.

### Step-by-Step Setup

1. Open your terminal, download the project, and move into the folder:
   ```bash
   git clone https://github.com
   cd excel-grid-view
   ```

2. Install the project components:
   ```bash
   npm install
   ```

3. Start the local server to run it in your browser:
   ```bash
   npm run dev
   ```

4. Bundle up the files into a clean package for a live website:
   ```bash
   npm run build
   ```
