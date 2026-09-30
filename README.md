# 📇 ContactVault — DSA Contact Management System

> A feature-rich, client-side Contact Manager built as a **Data Structures & Algorithms** project, implementing **Hash Table, BST, Doubly Linked List, Quick Sort, Binary Search & Stack** in vanilla JavaScript.

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![DSA](https://img.shields.io/badge/DSA-Project-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 🚀 Live Demo

> Open `index.html` in any modern browser — **no server needed!**

---

## 📸 Features

| Feature | Description |
|---|---|
| ➕ Add / Edit / Delete | Full CRUD with validation |
| 🔍 Real-time Search | Live search across name, phone, email |
| 🔤 Alphabet Quick-Nav | Jump to contacts by first letter |
| 📂 Group Filter | Filter by Work, Family, Friends, etc. |
| 🔀 Sort | Name A→Z, Name Z→A, Phone, Recent, Favorites |
| ⭐ Favorites | Mark and filter favorite contacts |
| ↩️ Undo / Redo | Ctrl+Z / Ctrl+Y history via Stack |
| 🌙 Dark / Light Mode | Theme toggle with persistence |
| 📥 Export JSON | Download all contacts as `.json` |
| 📥 Export CSV | Download contacts as `.csv` |
| 📤 Import JSON | Upload a JSON file to import contacts |
| 💾 Local Storage | Data persists across browser sessions |
| 📱 Responsive | Works on mobile, tablet, and desktop |

---

## 🧠 Data Structures & Algorithms Used

### 1. 🗂️ Hash Table (`js/dsa/HashTable.js`)

- **Purpose:** Primary contact storage (phone → contact object)
- **Collision Resolution:** Separate chaining with linked lists
- **Auto-resize:** Doubles capacity when load factor > 0.75
- **Hash Function:** Polynomial rolling hash

```
Operations | Average | Worst
-----------|---------|------
Insert     |  O(1)   | O(n)
Search     |  O(1)   | O(n)
Delete     |  O(1)   | O(n)
```

### 2. 🌳 Binary Search Tree (`js/dsa/BST.js`)

- **Purpose:** Name index for alphabetical traversal and prefix search
- **Key:** Contact name (lowercased)
- **In-order traversal** returns sorted contact list

```
Operations | Average   | Worst
-----------|-----------|-------
Insert     |  O(log n) | O(n)
Search     |  O(log n) | O(n)
Delete     |  O(log n) | O(n)
In-Order   |  O(n)     | O(n)
```

### 3. 🔗 Doubly Linked List (`js/dsa/LinkedList.js`)

- **Purpose:** Recent contacts list (bounded to 10)
- **O(1)** prepend / tail removal
- **Bi-directional** traversal

### 4. ⚡ Quick Sort (`js/dsa/QuickSort.js`)

- **Purpose:** Sort contacts by name, phone, date, favorites
- **Pivot:** Random pivot (Lomuto partition) — avoids worst case
- **Pre-built comparators** for all sort modes

```
Case    | Complexity
--------|------------
Best    | O(n log n)
Average | O(n log n)
Worst   | O(n²)  [rare]
```

### 5. 🔎 Binary Search (`js/dsa/BinarySearch.js`)

- **Purpose:** Fast lookup on sorted arrays + prefix range search
- **O(log n)** exact search
- **Linear fallback** for general queries

### 6. 📚 Stack (`js/dsa/Stack.js`)

- **Purpose:** Undo / Redo history
- **Bounded** to 50 operations
- `push / pop / peek` all **O(1)**

---

## 📁 Project Structure

```
contact-management/
├── index.html              ← Main HTML entry point
├── css/
│   └── style.css           ← All styles (dark/light theme, responsive)
├── js/
│   ├── dsa/
│   │   ├── HashTable.js    ← Hash Table with chaining
│   │   ├── BST.js          ← Binary Search Tree
│   │   ├── LinkedList.js   ← Doubly Linked List
│   │   ├── Stack.js        ← Stack for undo/redo
│   │   ├── QuickSort.js    ← Quick Sort with comparators
│   │   └── BinarySearch.js ← Binary Search + prefix search
│   ├── ContactStore.js     ← Orchestrates all DSA structures
│   ├── UI.js               ← DOM rendering functions
│   └── app.js              ← Main application controller
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Z` | Undo last action |
| `Ctrl + Y` | Redo |
| `Ctrl + F` | Focus search bar |
| `Esc` | Close modal |

---

## 🛠️ How to Run

### Option 1 — Open directly
```
Double-click index.html
```

### Option 2 — Using VS Code Live Server
1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → **Open with Live Server**

### Option 3 — Python HTTP Server
```bash
python -m http.server 8080
# then open http://localhost:8080
```

---

## 🚀 Deploy to GitHub Pages

1. Push the project to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your site will be live at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

---

## 📋 Sample Data

The app ships with **6 default contacts** so you can explore immediately:

| Name | Group |
|---|---|
| Alice Johnson | Work ⭐ |
| Bob Smith | Friends |
| Carol Williams | Family ⭐ |
| David Brown | Work |
| Eve Davis | Friends |
| Frank Miller | Personal |

---

## 🎓 Academic Context

This project was built as a **DSA (Data Structures & Algorithms)** course project demonstrating:

- Real-world application of foundational data structures
- Separation of concerns (DSA layer vs UI layer)
- Time and space complexity analysis
- Clean, documented, readable code

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

[MIT](LICENSE) © 2024
