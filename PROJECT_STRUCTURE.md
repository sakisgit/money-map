# 📁 Money Map - Project Structure Explanation

## 🗂️ Root Level Files

### **package.json**
- **Τι είναι:** Αρχείο διαχείρισης dependencies και scripts
- **Περιέχει:** 
  - Dependencies: React, Bootstrap, SweetAlert2, React Router, FontAwesome
  - Scripts: `dev` (development), `build` (production), `preview`
- **Χρήση:** Καθορίζει τις βιβλιοθήκες που χρησιμοποιεί το project

### **vercel.json**
- **Τι είναι:** Configuration για Vercel deployment
- **Περιέχει:** Rewrite rules για SPA routing (να μην βγάζει 404 στο reload)
- **Χρήση:** Επιτρέπει το React Router να λειτουργεί σωστά στο Vercel

### **vite.config.js**
- **Τι είναι:** Configuration για το Vite build tool
- **Χρήση:** Build tool που μετατρέπει το React code σε production-ready files

---

## 📂 src/ - Main Source Code

### **main.jsx**
- **Τι είναι:** Entry point της εφαρμογής
- **Κάνει:**
  - Φορτώνει Bootstrap CSS/JS
  - Φορτώνει FontAwesome icons
  - Φορτώνει custom CSS
  - Δημιουργεί το React root και render το App component
  - Προσθέτει BrowserRouter για routing

### **App.jsx**
- **Τι είναι:** Κύριο component που ορίζει τις routes
- **Κάνει:**
  - Wraps όλη την εφαρμογή με ThemeProvider και AppProvider
  - Ορίζει routes: `/` (HomePage) και `/work-hours` (WorkHoursPage)

### **index.css**
- **Τι είναι:** Global CSS styling
- **Περιέχει:**
  - Light/Dark theme styles
  - Card, button, form styling
  - Responsive design (media queries)
  - Custom scrollbars
  - Progress bar styling
  - Alert messages styling
  - Search summary cards
  - Date badges styling

---

## 📂 src/context/ - State Management

### **AppContext.jsx**
- **Τι είναι:** Global state management για όλη την εφαρμογή
- **Περιέχει:**
  - **HomePage States:**
    - `incomeItems` - Λίστα με income entries
    - `lossItems` - Λίστα με expense entries
    - `payment` - Μηνιαίος μισθός
    - `filterLoss` - Search filter για expenses
    - `filterProfit` - Search filter για income
    - `totalIncome` - Σύνολο income
    - `totalLoss` - Σύνολο expenses
    - `moneyRemaining` - Υπόλοιπο budget
  - **WorkHoursPage States:**
    - `rateInput` - Ωρομίσθιο
    - `hoursInput` - Ώρες εργασίας
    - `totalHours` - Σύνολο ωρών
    - `hoursList` - Λίστα με τις ώρες
  - **Functions:**
    - `formatMoney()` - Format αριθμών σε χρήμα (€)
  - **Auto-save:** Αποθηκεύει όλα στο localStorage

### **ThemeContext.jsx**
- **Τι είναι:** State management για light/dark theme
- **Κάνει:**
  - Διαχειρίζεται το theme (light/dark)
  - Αποθηκεύει την επιλογή στο localStorage
  - Ανιχνεύει system preference
  - Προσθέτει classes στο body element

---

## 📂 src/pages/ - Main Pages

### **HomePage.jsx**
- **Τι είναι:** Κύριο page (Money Map)
- **Περιέχει:**
  - Header component
  - Stats component (statistics)
  - Filter component (search)
  - Items component (expenses & income lists)

### **WorkHoursPage.jsx**
- **Τι είναι:** Page για καταγραφή ωρών εργασίας
- **Περιέχει:**
  - WorkHeader component
  - RateInput component (ωρομίσθιο)
  - HoursInput component (ώρες)
  - HoursList component (λίστα ωρών)
  - Back button

---

## 📂 src/components/ - Reusable Components

### **Header.jsx**
- **Τι είναι:** Header component για το HomePage
- **Περιέχει:**
  - Title "Money Map"
  - PaymentDropdown button
  - ResetButton
  - Work Hours link
  - Theme toggle button (moon/sun)

### **Stats.jsx**
- **Τι είναι:** Statistics display
- **Εμφανίζει:**
  - Monthly Income (payment)
  - Net Balance
  - Total Income
  - Total Expenses
  - Remaining Budget
  - Progress bar με messages (50%, 80%, 100%)

### **Filter.jsx**
- **Τι είναι:** Search filters
- **Κάνει:**
  - Search box για expenses
  - Search box για income
  - Case-insensitive filtering

### **Items.jsx**
- **Τι είναι:** Container για expenses και income sections
- **Κάνει:**
  - Οργανώνει τις δύο λίστες σε δύο στήλες
  - Προσθέτει headers και "Add" buttons

### **AddMoneyLoss.jsx**
- **Τι είναι:** Component για προσθήκη expenses
- **Κάνει:**
  - Form για προσθήκη expense (text + amount)
  - Εμφανίζει filtered expenses list
  - Scrollable list (max 4 items visible)
  - Scroll indicators (top/bottom)
  - Search summary με totals
  - GIF animations όταν προσθέτει expense
  - Delete functionality

### **AddMoneyProfit.jsx**
- **Τι είναι:** Component για προσθήκη income
- **Κάνει:**
  - Form για προσθήκη income (text + amount)
  - Εμφανίζει filtered income list
  - Scrollable list (max 4 items visible)
  - Scroll indicators (top/bottom)
  - Search summary με totals
  - GIF animations όταν προσθέτει income
  - Delete functionality

### **WorkHeader.jsx**
- **Τι είναι:** Header για Work Hours page
- **Εμφανίζει:**
  - Title "Work Hours"
  - Total Earnings
  - Total Hours
  - Current Date (με glassmorphism styling)

### **RateInput.jsx**
- **Τι είναι:** Input για ωρομίσθιο
- **Κάνει:**
  - Επιτρέπει input ωρομισθίου
  - Confirmation με SweetAlert2
  - Αποθήκευση στο localStorage
  - Change rate functionality

### **HoursInput.jsx**
- **Τι είναι:** Input για ώρες εργασίας
- **Κάνει:**
  - Επιτρέπει input ωρών
  - Validation
  - Προσθήκη στο hoursList
  - Αποθήκευση στο localStorage
  - Success message

### **HoursList.jsx**
- **Τι είναι:** Λίστα με τις καταγεγραμμένες ώρες
- **Εμφανίζει:**
  - Όλες τις ώρες με ημερομηνία
  - Earnings per entry
  - Delete button για κάθε entry
  - Clear All button

### **TotalEarnings.jsx**
- **Τι είναι:** Component που υπολογίζει total earnings
- **Κάνει:**
  - Υπολογίζει: totalHours × hourlyRate
  - Εμφανίζει το σύνολο

---

## 📂 src/buttons/ - Button Components

### **PaymentDropdown.jsx**
- **Τι είναι:** Dropdown για ορισμό μηνιαίου μισθού
- **Κάνει:**
  - Dropdown με input field
  - Validation
  - Αποθήκευση στο localStorage
  - Responsive positioning (fixed για mobile, absolute για desktop)

### **ResetButton.jsx**
- **Τι είναι:** Button για reset όλων των stats
- **Κάνει:**
  - Confirmation με SweetAlert2
  - Καθαρίζει όλα τα data
  - Καθαρίζει localStorage

### **DeleteButton.jsx**
- **Τι είναι:** Reusable delete button
- **Κάνει:**
  - Confirmation με SweetAlert2
  - Καλεί onDelete callback
  - Success message

---

## 📂 src/hooks/ - Custom Hooks

### **useFullDate.jsx**
- **Τι είναι:** Hook που επιστρέφει full date με time
- **Format:** "Monday, 11/15/2024 14:30:45"
- **Updates:** Κάθε δευτερόλεπτο

### **useDateOnly.jsx**
- **Τι είναι:** Hook που επιστρέφει date χωρίς time
- **Format:** "Monday, 11/15/2024"
- **Updates:** Κάθε λεπτό

### **useGiphyGif.jsx**
- **Τι είναι:** Hook για Giphy API integration
- **Κάνει:**
  - Παίρνει GIF από Giphy API
  - Fallback keywords αν δεν βρει
  - Auto-hide μετά από 5 δευτερόλεπτα
  - Random selection

---

## 🎨 Styling Features

### **Responsive Design:**
- Mobile-first approach
- Breakpoints: 576px (sm), 768px (md)
- Flexible layouts με Bootstrap grid

### **Dark/Light Theme:**
- System preference detection
- localStorage persistence
- Smooth transitions
- Custom colors για κάθε theme

### **Modern UI:**
- Gradients
- Glassmorphism effects
- Box shadows
- Smooth animations
- Custom scrollbars

---

## 💾 Data Storage

### **localStorage Keys:**
- `payment` - Μηνιαίος μισθός
- `incomeItems` - Income entries
- `lossItems` - Expense entries
- `hourlyRate` - Ωρομίσθιο
- `hoursList` - Λίστα ωρών
- `totalHours` - Σύνολο ωρών
- `theme` - Light/Dark theme preference

---

## 🔄 Data Flow

1. **User Input** → Component State
2. **Component State** → AppContext
3. **AppContext** → localStorage (auto-save)
4. **localStorage** → AppContext (on load)
5. **AppContext** → Components (display)

---

## 📊 Key Features

✅ Expense & Income tracking
✅ Work hours tracking
✅ Search & filter functionality
✅ Search summary με totals
✅ Progress bar με milestone messages
✅ Scrollable lists με indicators
✅ Dark/Light theme
✅ Responsive design
✅ LocalStorage persistence
✅ GIF animations
✅ SweetAlert2 confirmations
✅ Modern UI/UX

