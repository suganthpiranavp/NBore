# Borewell Daily Drilling Management Application

A complete full-stack solution for a drilling company operating **4 Rig Vehicles**, managed by **4 Field Managers** (React Native Mobile App) and audited by **6 Fleet Admins** (Next.js Web Dashboard).

---

## 🔑 Default Credentials & Role Assignment

### 1. Admins (Web Dashboard: `http://localhost:3000`)
Password for all admin accounts: **`password123`**

| Username | Admin Name | Department | Role |
| :--- | :--- | :--- | :--- |
| `admin1` | K. Rajesh | Managing Partner | ADMIN |
| `admin2` | S. Kumar | Fleet Director | ADMIN |
| `admin3` | M. Anitha | Finance Controller | ADMIN |
| `admin4` | V. Senthil | Operations Head | ADMIN |
| `admin5` | P. Karthik | Audit & Inventory | ADMIN |
| `admin6` | D. Ramesh | Admin Coordinator | ADMIN |

### 2. Rig Managers (Mobile App: `1 Manager = 1 Locked Rig`)
Password for all manager accounts: **`password123`**

| Username | Manager Name | Assigned Rig | Vehicle Plate Number | Rig ID |
| :--- | :--- | :--- | :--- | :--- |
| `manager1` | Saravanan | Rig 1 (Ashok Leyland 6x4) | **`TN-28-AA-1001`** | `1` |
| `manager2` | Murugan | Rig 2 (Tata Prima 2528) | **`TN-28-AA-1002`** | `2` |
| `manager3` | Selvam | Rig 3 (BharatBenz 2828C) | **`TN-28-AA-1003`** | `3` |
| `manager4` | Ganesan | Rig 4 (Eicher Pro 6028) | **`TN-28-AA-1004`** | `4` |

---

## 📁 Repository Structure

```
d:/NBore/
├── backend/
│   ├── db/
│   │   ├── schema.sql           # Database schema with user roles, vehicle assignments, indexes
│   │   ├── seed.sql             # 4 Vehicles, 6 Admins, 4 Managers, initial reports
│   │   └── index.js             # pg connection pool (127.0.0.1:5433)
│   ├── server.js                # Express app (POST /api/login, GET /api/reports/:vehicleId, etc.)
│   ├── package.json
│   └── .env
│
├── admin-web/                   # Next.js 14 + Tailwind CSS (Admin Web Portal)
│   ├── app/
│   │   ├── page.jsx             # Auth routing between AdminLogin & AdminDashboard
│   │   ├── layout.jsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AdminLogin.tsx       # Secure login with demo admin switcher
│   │   └── AdminDashboard.tsx   # 4 Clickable number plates + time-sorted reports table
│   ├── login.tsx                # Exported component file
│   ├── dashboard.tsx            # Exported component file
│   ├── tailwind.config.js
│   └── package.json
│
└── mobile-app/                  # React Native / Expo (Field Manager Mobile App)
    ├── App.js                   # State flow between LoginScreen and ManagerDashboard
    ├── LoginScreen.js           # Manager credentials entry & quick demo selector
    ├── ManagerDashboard.js      # Locked assigned vehicle banner & daily drilling form
    ├── components/
    │   └── DrillingReportForm.jsx
    └── package.json
```

---

## 🚀 Live Services Status

- **PostgreSQL 18**: Running on `127.0.0.1:5433` (`borewell_db`)
- **Backend API**: Running on `http://localhost:5000`
- **Admin Dashboard**: Running on `http://localhost:3000`
- **Manager Mobile App**: Ready in `mobile-app/` (`npx expo start`)
