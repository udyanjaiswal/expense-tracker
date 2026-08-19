> This is our internal project notebook. Keep it updated while we build.
> Not client documentation. Not a fancy README. Just enough for us to remember
> what we decided, what exists, why it exists, and what's next.

## 🧠 What are we building?

A very simple internal expense/budget tracker for Dad's company.

The main idea:

- Employees receive money/allocations for company expenses.
- Employees submit expenses from their phone.
- They do NOT have normal accounts/passwords.
- Each employee gets a unique PIN.
- PIN identifies the employee automatically.
- Employees choose what the expense is for, enter amount, and submit.
- Receipt/bill is optional.
- Description is optional.
- Dad can see everything person-wise and category-wise.
- Dad can manage budgets/allocations.
- If someone spends beyond their allocation, the extra amount is tracked.
- Higher office gets clean aggregated Excel reports from Dad.
- We are deliberately NOT building a fancy ERP.

### Core rule

**Employee side = stupidly simple.**

**Dad side = useful and informative.**

---

# 🎯 Product decisions we've locked

## Employee

- 📱 Mobile-first
- ❌ No traditional login
- 🔢 Unique PIN per employee
- PIN is verified by backend
- Employee identity comes from backend, not from a frontend-selected ID
- Department/category is required
- Amount is required
- Description is optional
- Receipt is optional
- `Other` category exists
- If `Other` is selected, custom text can be entered
- Normal categories don't require descriptions

Example:

```text
PIN
 ↓
Hi Rahul 👋
 ↓
Kitchen
 ↓
₹850
 ↓
Submit
```

No need to make someone type:

> "Bought vegetables for kitchen"

if simply selecting **Kitchen** already tells us enough.

---

# 👨‍💼 Dad/Admin

Dad gets proper management features:

- Admin login
- Employee management
- Employee PIN management
- Category management
- Budget/advance allocation
- All expenses
- Person-wise expenses
- Category-wise expenses
- Date/month filtering
- Remaining budget
- Extra spending
- Optional receipt viewing
- Excel export
- Responsive UI so Dad can also use it from phone

🔒 Only Dad/Admin gets management powers

Employees have no management controls.

Only Dad/Admin can:

Add employees

Edit employee details

Activate/deactivate employees

Generate or change employee PINs

Add categories

Edit categories

Activate/deactivate categories

Allocate budgets

View all expenses

Generate reports

Export Excel

Employees can only:

Enter their PIN

Submit an expense

See the submission result

---

**# 🏷️ Category rules

Categories are master data controlled only by Dad/Admin.

Examples:

Kitchen
Transport
Maintenance
Stationery
Sabzi
Ration
Other

Employees can select from the currently active categories when adding or editing their own expenses.

If Dad adds a new category, it becomes available to employees automatically.

If a category is no longer needed, Dad should deactivate it instead of deleting it, so old expenses keep their historical category reference.

Existing expenses should retain their category relationship even if the category name/status changes later.

📊 Reporting**

There are two different reporting needs.

### Dad's internal view

Dad can see:

```text
Employee → Category → Expense
```

Example:

```text
Rahul
  Kitchen     ₹850
  Kitchen     ₹1,200

Amit
  Kitchen     ₹900

Kitchen total = ₹2,950
```

### Higher office

They don't need to see individual employees.

They should receive something like:

```text
Office 1
 ├── Kitchen      ₹2,950
 ├── Transport    ₹4,200
 ├── Maintenance  ₹1,800
 └── Total        ₹8,950
```

Excel export will be designed around the actual format Dad uses.

---

# 💰 Budget logic

Budget/Allocation and actual Expense are separate.

Example:

```text
Allocated = ₹5,000
Spent     = ₹4,200
Remaining = ₹800
Extra     = ₹0
```

If:

```text
Allocated = ₹5,000
Spent     = ₹5,700
Remaining = ₹0
Extra     = ₹700
```

Do NOT treat the allocation itself as an expense.

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- JavaScript
- Bootstrap
- Bootstrap Icons
- Axios
- React Router

## Backend

- Node.js
- Express
- Mongoose
- JWT
- bcrypt/bcryptjs
- CORS
- dotenv

## Database

- MongoDB
- MongoDB Atlas for production

## Excel

- ExcelJS

## API testing

- **Postman** ✅ installed and available

We'll use Postman heavily while developing the backend.

---

# 🏗️ Architecture

```text
             EMPLOYEE PHONE
                    │
                    ▼
             React Frontend
                    │
                    │ Axios
                    ▼
             Express Backend
                    │
             ┌──────┴──────┐
             ▼             ▼
          MongoDB       ExcelJS
             │             │
             ▼             ▼
       Expense Data     Excel Report

               DAD
                │
                ▼
        React Admin UI
                │
                ▼
         Express Backend
                │
                ▼
            MongoDB
```

---

# 📁 Project Structure

Current structure:

```text
ExpenseManager/
│
├── README.md
│
└── frontend/
```

Target structure:

```text
ExpenseManager/
│
├── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── employee/
│   │   │   └── admin/
│   │   ├── pages/
│   │   │   ├── employee/
│   │   │   └── admin/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
└── backend/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── utils/
    ├── .env
    ├── .env.example
    ├── server.js
    └── package.json
```

Don't create every folder just because it's written here.

Create folders when we actually need them.

---

# 🔐 Important security decisions

## Employee PIN

We will NOT store PINs as plain text.

Flow:

```text
Employee enters PIN
        ↓
Backend hashes/checks PIN
        ↓
Find matching active employee
        ↓
Backend knows employee
        ↓
Create expense with that employee
```

The frontend should NOT be able to say:

```text
employeeId = "some-other-employee"
```

and successfully submit an expense.

Backend is the authority.

## Admin

Dad gets proper authentication.

Admin passwords are hashed.

Admin APIs are protected.

JWT will be used for admin authentication.

---

# 🧩 Main database models

## Employee

```text
Employee
├── name
├── employeeCode
├── pinHash
├── category
├── status
├── createdAt
└── updatedAt
```

## Department

```text
Department
├── name
├── status
├── createdAt
└── updatedAt
```

## BudgetAllocation

```text
BudgetAllocation
├── employee
├── category
├── amount
├── period
├── notes
├── createdAt
└── updatedAt
```

## Expense

```text
Expense
├── expenseId
├── employee
├── category
├── amount
├── description
├── receipt
├── expenseDate
├── createdAt
└── updatedAt
```

---

# 🖥️ UI philosophy

## Employee

Think:

> "Can a non-tech employee understand this in 5 seconds?"

Use:

- Big buttons
- Big inputs
- Very little text
- Clear labels
- Mobile-first layout
- Minimal typing
- Immediate success message

We can use Chrome DevTools responsive mode while coding so the mobile screen stays visible beside the code.

## Dad

Dad needs information more than minimalism.

Dashboard should eventually show:

```text
Total Allocated
Total Spent
Remaining
Extra
```

Then:

- Person-wise
- Department-wise
- Filters
- Reports
- Export Excel

Still responsive.

---

# 📦 Dependencies

## Already installed in frontend

Current frontend dependencies include:

- React
- Vite
- Axios
- React Router
- Bootstrap
- Bootstrap Icons

Check `frontend/package.json` if unsure.

## Backend dependencies — planned

```text
express
mongoose
cors
dotenv
bcryptjs
jsonwebtoken
exceljs
```

Development dependency:

```text
nodemon
```

We will install these when creating the backend.

---

# 🧪 Development tools

Installed:

- VS Code ✅
- Node.js ✅
- npm ✅
- Git ✅
- Postman ✅
- Chrome ✅

MongoDB Shell:

- `mongosh` is NOT installed.
- That's okay.
- We can use MongoDB Atlas/Mongoose without needing `mongosh`.

---

# 🌐 Deployment

Not deciding this yet.

First:

```text
Build locally
 ↓
Test
 ↓
Finish features
 ↓
Security check
 ↓
Deploy
 ↓
Decide final URL/access
```

Possible architecture later:

```text
Frontend hosting
       ↓
Express API
       ↓
MongoDB Atlas
```

We will decide hosting/domain/access method at the end.

---

# 📋 Progress

## Setup

- [x] Laptop revived
- [x] Node installed
- [x] npm installed
- [x] Git installed
- [x] VS Code installed
- [x] Postman available
- [x] React/Vite frontend created
- [x] Frontend running

## Backend

- [ ] Create backend folder
- [ ] Initialize npm
- [ ] Install dependencies
- [ ] Create Express server
- [ ] Test server in browser
- [ ] Test server in Postman
- [ ] Connect MongoDB
- [ ] Create models

## Authentication

- [ ] Admin login
- [ ] Employee PIN system
- [ ] PIN hashing
- [ ] Protected admin routes
- [ ] Employee identity verification

## Expense system

- [ ] Categories
- [ ] Employees
- [ ] Budget allocation
- [ ] Expense submission
- [ ] Optional receipt
- [ ] Remaining calculation
- [ ] Extra calculation

## Admin

- [ ] Dashboard
- [ ] Employee management
- [ ] Category management
- [ ] Expense list
- [ ] Person-wise filter
- [ ] Category-wise filter
- [ ] Date/month filter

## Reports

- [ ] ExcelJS
- [ ] Person-wise Excel
- [ ] Category-wise Excel
- [ ] Higher-office Excel format

## Final

- [ ] Responsive testing
- [ ] Security testing
- [ ] Production environment variables
- [ ] Deployment
- [ ] Final URL
- [ ] Employee access/QR
- [ ] Admin access

---

# 🚦 CURRENT TASK

We have finished the frontend setup.

### NEXT:

Create the backend.

```text
ExpenseManager/
├── frontend/
└── backend/
```

Then:

```text
backend
 ↓
npm init
 ↓
install Express + dependencies
 ↓
server.js
 ↓
GET /api/hello
 ↓
test in Postman
```

After that we connect MongoDB.

---

# 📝 Notes for future us

- Don't overengineer.
- Don't add features just because we can.
- Employee experience is the priority.

Only Dad/Admin gets management powers; employees never manage master data.
- Dad needs useful accounting, not fancy analytics.
- Backend calculates financial values; don't trust frontend calculations.
- Optional means actually optional.
- Keep the README updated when an important decision changes.
- Test APIs in Postman before connecting them to React.
- Don't use real company/employee/financial data in development.
- Don't decide hosting too early.
- Build → test → polish → deploy.

---