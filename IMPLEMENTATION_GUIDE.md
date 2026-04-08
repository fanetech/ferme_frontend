# Farm Management — Frontend Implementation Guide

> Step-by-step plan to rework the existing AvePay admin template into a Farm Management dashboard.
> Each step is self-contained — complete and test one before moving to the next.

---

## Backend Reality Check

> **Backend branch: `origin/koumbem`** — All modules are fully implemented.
> Make sure the backend is running from this branch.

**29 controllers, ~260+ endpoints across 12 modules — ALL READY:**

| Module | Controllers | Endpoints | Key |
|--------|------------|-----------|-----|
| Auth | AuthController | 12 | register, login, refresh, logout, forgot/reset password, PIN |
| Users | UserController | 21 | CRUD, status, search, farm access, primary farm |
| User-Organization | UserOrganizationController | 12 | Add/remove members, roles, primary org |
| Roles | RoleController | 10 | CRUD, search, assign permissions |
| Permissions | PermissionController | 7 | CRUD, by module, search |
| Modules | ModuleController | 14 | CRUD, assign permissions, active/system |
| Organizations | OrganizationController | 13 | CRUD, status, type, province, stats |
| Farms | FarmController | 16 | CRUD, status, type, org, province, stats |
| Crops | CropTypeController, ParcelController, CultivationController | 33 | Crop types, parcels, cultivations, activities, timeline |
| Livestock | AnimalTypeController, LivestockController | 29 | Animal types, animals, vet care, production, genealogy |
| Inventory | InventoryController | 16 | Items, stock movements, low-stock, reorder |
| HR | EmployeeController, TaskController, AttendanceController | 22 | Employees, tasks, attendance |
| Marketplace | CustomerController, ProductController, SaleOrderController | 42 | Customers, products, orders, revenue |
| IoT | IoTSensorController, IoTReadingController | 18 | Sensors, readings, weather, anomalies |
| Notifications | NotificationController, AlertRuleController | 16 | Notifications, alert rules |
| Sync | MobileSyncController | 9 | Upload/download, conflicts |
| System | AuditController, SyncLogController, SystemLogController | 26 | Audit, sync logs, system logs |

**Key auth changes on koumbem:**
- Register now auto-assigns ADMIN role and returns JWT tokens (auto-login)
- Login response includes `currentOrganizationId`, `currentOrganizationName`, `currentFarmId`, `currentFarmName`
- System roles: SUPER_ADMIN, ADMIN, FARM_OWNER, FARM_MANAGER, SUPERVISOR, WORKER, ACCOUNTANT, VIEWER

---

## Current State (What Already Works)

| Layer | File(s) | Status |
|-------|---------|--------|
| API Client (Axios + interceptors) | `data/client/http-client.ts` | Done |
| Endpoints map | `data/client/endpoints.ts` | Done |
| Auth Client (login/logout/forgot/change/pin) | `data/client/index.ts` | Done |
| Auth mutations (React Query) | `data/auth.ts` | Done (login, logout, forgotPassword, changePassword) |
| Auth store (Zustand) | `store/useAuth.ts` | Done (initialize, loginUser, logoutUser, hasPermission, hasRole) |
| Auth guard + hooks | `components/auth/auth-guard.tsx` | Done (AuthGuard, useAuthStatus, useAuthRedirect) |
| Types (ApiResponse, JWT, Auth) | `types/index.ts` | Done |
| Zod validations | `lib/validations/auth.ts` | Done (login, forgotPassword, resetPassword, register, changePassword) |
| Middleware (redirects) | `middleware.ts` | Done |
| Routes constants | `lib/constants/routes.ts` | Done |
| Login page | `app/dashboard/(guest)/login/v2/page.tsx` | Done |
| Forgot password page | `app/dashboard/(guest)/forgot-password/page.tsx` | Done |
| Change password page | `app/dashboard/(guest)/change-password/page.tsx` | Redirect only |

---

## STEP 1 — Cleanup & Branding

**Goal:** Remove AvePay branding, rename to Farm Management.

- [ ] Rename `AvePayLoader` component → `AppLoader` or `FarmLoader`
- [ ] Update `components/auth/auth-guard.tsx` import to use new loader name
- [ ] Update `app/layout.tsx` metadata (title, description) to "Farm Management"
- [ ] Update any logo / favicon files in `public/`
- [ ] Search codebase for "AvePay" / "avepay" references and replace

**Files to touch:**
- `components/avepay-loader.tsx` → rename
- `components/auth/auth-guard.tsx` → update import
- `app/layout.tsx`
- `public/` (logos, favicon)

---

## STEP 2 — Complete Authentication Pages

**Goal:** Build all auth pages that match the backend auth endpoints.

### What exists

| Page | Route | Status |
|------|-------|--------|
| Login | `/dashboard/login/v2` | Done |
| Forgot Password | `/dashboard/forgot-password` | Done |
| Change Password | `/dashboard/change-password` | Redirect only — needs real page |

### What needs to be built

#### 2a — Register Page

Backend endpoint: `POST /api/auth/register`

Payload: `{ phoneNumber, firstName, lastName, password, email? }`

- [ ] Create `app/dashboard/(guest)/register/page.tsx`
- [ ] Use existing `registerSchema` from `lib/validations/auth.ts`
  - **Fix needed:** current schema uses `email` as primary — should use `phoneNumber` as primary, `email` optional
- [ ] Add register API call to `data/client/index.ts` (Client.auth.register)
- [ ] Add `useRegisterMutation()` to `data/auth.ts`
- [ ] On success → redirect to login page with success toast
- [ ] Add link from login page to register page

**Note:** On `koumbem` branch, register now returns JWT tokens (auto-login). Update `LoginResponse` type to include `currentOrganizationId`, `currentOrganizationName`, `currentFarmId`, `currentFarmName`. Create a `RegisterResponse` type that includes `roles`, `accessToken`, `refreshToken`, `tokenType`, `expiresIn`.

**Files to touch:**
- `app/dashboard/(guest)/register/page.tsx` (new)
- `data/client/index.ts` — add `auth.register()`
- `data/auth.ts` — add `useRegisterMutation()`
- `lib/validations/auth.ts` — update `registerSchema` for phone-based registration
- `lib/constants/routes.ts` — verify `AUTH_ROUTES.REGISTER` exists
- `types/index.ts` — update `LoginResponse`, add `RegisterResponse`
- `app/dashboard/(guest)/login/v2/page.tsx` — add "Créer un compte" link

#### 2b — Reset Password Page

Backend endpoint: `POST /api/v1/auth/reset-password`

Payload: `{ token, newPassword }`

- [ ] Create `app/dashboard/(guest)/reset-password/page.tsx`
- [ ] User arrives with token from SMS (from forgot-password flow)
- [ ] Form: token/code input + new password + confirm password
- [ ] Use existing `resetPasswordSchema` from `lib/validations/auth.ts`
  - **Fix needed:** current schema uses `email` — should use `phoneNumber` or just `code` field
- [ ] Add reset-password API call to `data/client/index.ts` (already exists as `auth.resetPassword()`)
- [ ] Add `useResetPasswordMutation()` to `data/auth.ts`
- [ ] On success → redirect to login with success toast
- [ ] Update forgot-password page to link to reset-password page after code is sent

**Files to touch:**
- `app/dashboard/(guest)/reset-password/page.tsx` (new)
- `data/auth.ts` — add `useResetPasswordMutation()`
- `lib/validations/auth.ts` — fix `resetPasswordSchema` (remove email, use code/token)
- `app/dashboard/(guest)/forgot-password/page.tsx` — add link/redirect to reset page

#### 2c — Change Password Page (Real Implementation)

Backend endpoint: `POST /api/v1/auth/change-password`

Payload: `{ currentPassword, newPassword }`

- [ ] Replace redirect in `app/dashboard/(guest)/change-password/page.tsx` with real form
- [ ] Move to `app/dashboard/(auth)/` since user must be logged in
- [ ] Use existing `changePasswordSchema` from `lib/validations/auth.ts`
- [ ] Use existing `useChangePasswordMutation()` from `data/auth.ts`
- [ ] On success → toast + stay on page or redirect to settings

**Files to touch:**
- `app/dashboard/(auth)/settings/change-password/page.tsx` (new — under auth layout)
- `app/dashboard/(guest)/change-password/page.tsx` — keep redirect or remove

#### 2d — PIN Management

Backend endpoints:
- `POST /api/v1/auth/pin/set` — `{ pin, password }`
- `PUT /api/v1/auth/pin/update` — `{ currentPin, newPin }`
- `DELETE /api/v1/auth/pin/remove` — `{ pin }`

- [ ] Add PIN management section to settings/security page
- [ ] Create PIN form validations in `lib/validations/auth.ts`
- [ ] PIN API calls already exist in `data/client/index.ts` (auth.setPin, auth.updatePin, auth.removePin)
- [ ] Add React Query mutations to `data/auth.ts`

**Files to touch:**
- `app/dashboard/(auth)/settings/security/pin/page.tsx` (new)
- `data/auth.ts` — add `useSetPinMutation()`, `useUpdatePinMutation()`, `useRemovePinMutation()`
- `lib/validations/auth.ts` — add PIN schemas

#### 2e — Auth Endpoints Summary (add to `data/client/endpoints.ts` if missing)

Verify all auth endpoints are in `API_ENDPOINTS.auth`:

| Endpoint | Already in endpoints.ts? |
|----------|--------------------------|
| `POST /v1/auth/register` | **Missing** — add `register: '/v1/auth/register'` |
| `POST /v1/auth/login` | Yes |
| `POST /v1/auth/refresh` | Yes |
| `POST /v1/auth/logout` | Yes |
| `POST /v1/auth/logout-all` | Yes |
| `POST /v1/auth/forgot-password` | Yes |
| `POST /v1/auth/reset-password` | Yes |
| `POST /v1/auth/change-password` | Yes |
| `POST /v1/auth/pin/set` | Yes |
| `PUT /v1/auth/pin/update` | Yes |
| `DELETE /v1/auth/pin/remove` | Yes |
| `GET /v1/auth/health` | **Missing** — add `health: '/v1/auth/health'` |

**Files to touch:**
- `data/client/endpoints.ts` — add `register` and `health`

---

## STEP 3 — Routes & Navigation Overhaul

**Goal:** Replace old dashboard routes with Farm Management routes. Update the sidebar/navigation.

### 3a — Update route constants

Replace the old `DASHBOARD_ROUTES` and `APP_ROUTES` in `lib/constants/routes.ts`:

```ts
export const DASHBOARD_ROUTES = {
  DEFAULT: '/dashboard/default',
  // Core (backend ready)
  FARMS: '/dashboard/farms',
  ORGANIZATIONS: '/dashboard/organizations',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
  PERMISSIONS: '/dashboard/permissions',
  // Modules (backend ready later — show as "Coming Soon")
  CROPS: '/dashboard/crops',
  LIVESTOCK: '/dashboard/livestock',
  INVENTORY: '/dashboard/inventory',
  HR: '/dashboard/hr',
  FINANCE: '/dashboard/finance',
  MARKETPLACE: '/dashboard/marketplace',
  // Advanced
  WEATHER: '/dashboard/weather',
  IOT: '/dashboard/iot',
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',
} as const;
```

### 3b — Update sidebar navigation

| Section | Route | Icon | Permission | Backend Status |
|---------|-------|------|------------|----------------|
| Dashboard | `/dashboard/default` | LayoutDashboard | — | Ready |
| Organizations | `/dashboard/organizations` | Building | ORGANIZATIONS_LIST | Ready |
| Farms | `/dashboard/farms` | Tractor | FARMS_LIST | Ready |
| Crops | `/dashboard/crops` | Sprout | PARCELS_LIST | Coming Soon |
| Livestock | `/dashboard/livestock` | PawPrint | LIVESTOCK_LIST | Coming Soon |
| Inventory | `/dashboard/inventory` | Package | INVENTORY_ITEM_VIEW | Coming Soon |
| HR | `/dashboard/hr` | Users | HR_EMPLOYEE_VIEW | Coming Soon |
| Finance | `/dashboard/finance` | Wallet | — | Coming Soon |
| Marketplace | `/dashboard/marketplace` | ShoppingCart | PRODUCTS_VIEW | Coming Soon |
| Notifications | `/dashboard/notifications` | Bell | NOTIFICATIONS_VIEW | Coming Soon |
| --- separator --- | | | | |
| Users | `/dashboard/users` | UserCog | USERS_LIST | Ready |
| Roles | `/dashboard/roles` | Shield | ROLES_LIST | Ready |
| IoT Sensors | `/dashboard/iot` | Cpu | IOT_SENSORS_LIST | Ready |
| Settings | `/dashboard/settings` | Settings | — | — |

### 3c — Clean up old page directories

Old AvePay directories under `app/dashboard/(auth)/` to remove:
- `academy/`, `alerts/`, `apps/`, `audit/`, `catalog/`, `charts/`, `clients/`, `crm/`, `crypto/`, `ecommerce/`, `file-manager/`, `hospital-management/`, `hotel/`, `logistics/`, `project-management/`, `reports/`, `sales/`, `stats/`, `terminals/`, `transactions/`, `website-analytics/`

> Remove one-by-one as you replace them with farm pages.

**Files to touch:**
- `lib/constants/routes.ts`
- Sidebar/navigation component
- `app/dashboard/(auth)/layout.tsx`

---

## STEP 4 — Types Definition

**Goal:** Create TypeScript types for all Farm Management entities.

### 4a — Organization & Farm types

Create `types/organization.ts` (replace old AvePay one):

```ts
// Organization types
type OrganizationType = 'COOPERATIVE' | 'GROUPEMENT' | 'ENTREPRISE' | 'ONG'
type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
interface Organization { id: string; code: string; name: string; type: OrganizationType; status: OrganizationStatus; ... }
```

Create `types/farm.ts`:

```ts
type FarmType = 'CROP' | 'LIVESTOCK' | 'MIXED' | 'AQUACULTURE'
type FarmStatus = 'ACTIVE' | 'INACTIVE' | 'ABANDONED'
type SoilType = 'CLAY' | 'SANDY' | 'LOAM' | 'SILTY' | 'PEATY' | 'CHALKY' | 'OTHER'
interface Farm { id: string; code: string; name: string; type: FarmType; status: FarmStatus; ... }
```

### 4b — User & Role types

Create/update `types/users.ts`:

```ts
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'DELETED'
interface UserDetail { id: string; code: string; firstName: string; lastName: string; phoneNumber: string; email?: string; status: UserStatus; ... }
```

Create/update `types/roles.ts`:

```ts
interface Role { id: string; code: string; name: string; description?: string; level: number; isSystem: boolean; permissions: Permission[]; ... }
interface Permission { id: string; code: string; name: string; module: string; description?: string; ... }
```

### 4c — User-Farm Access types

Create `types/user-farm-access.ts`:

```ts
interface UserFarmAccess { id: string; userId: string; farmId: string; role: string; grantedBy: string; revokedAt?: string; ... }
```

### 4d — All module types

| File | Types |
|------|-------|
| `types/crop.ts` | CropType, CropFamily, Parcel, ParcelStatus, Cultivation, CultivationStatus, AgriculturalActivity |
| `types/livestock.ts` | AnimalType, AnimalCategory, Livestock, LivestockStatus, VeterinaryCare, ProductionRecord |
| `types/inventory.ts` | InventoryItem, StockMovement, MovementType ('IN', 'OUT', 'ADJUSTMENT') |
| `types/hr.ts` | Employee, Attendance, AttendanceStatus, Task, TaskStatus, TaskPriority |
| `types/finance.ts` | RevenueStats, InventoryValuation |
| `types/marketplace.ts` | Customer, CustomerType, Product, ProductType, SaleOrder, OrderItem, OrderStatus, PaymentStatus |
| `types/weather.ts` | WeatherCurrent, WeatherHistory, WeatherForecast |
| `types/iot.ts` | IoTSensor, SensorType, SensorStatus, IoTReading, ReadingStatistics |
| `types/notification.ts` | Notification, NotificationStats, AlertRule |
| `types/module.ts` | SystemModule |
| `types/audit.ts` | AuditLog, SyncLog, SystemLog (replace old AvePay audit types) |
| `types/sync.ts` | SyncData, SyncConflict |

Re-export all from `types/index.ts`.

**Files to touch:**
- `types/organization.ts` (rewrite)
- `types/farm.ts` (new)
- `types/users.ts` (rewrite)
- `types/roles.ts` (rewrite)
- `types/user-farm-access.ts` (new)
- `types/crop.ts` (new)
- `types/livestock.ts` (new)
- `types/inventory.ts` (new)
- `types/hr.ts` (new)
- `types/finance.ts` (new)
- `types/marketplace.ts` (new)
- `types/weather.ts` (new)
- `types/iot.ts` (new)
- `types/notification.ts` (new)
- `types/index.ts` (update exports)

---

## STEP 5 — API Service Layer (data/ modules)

**Goal:** Create service files using `HttpClient` + `API_ENDPOINTS` pattern.

### 5a — Update endpoints.ts

Verify/add missing endpoints to `data/client/endpoints.ts`:

```ts
// Missing from current file:
auth.register: '/v1/auth/register'
auth.health: '/v1/auth/health'

// Organizations (not in current file)
organizations: {
  list: '/v1/organizations',
  get: (id: string) => `/v1/organizations/${id}`,
  getByCode: (code: string) => `/v1/organizations/code/${code}`,
  create: '/v1/organizations',
  update: (id: string) => `/v1/organizations/${id}`,
  delete: (id: string) => `/v1/organizations/${id}`,
  changeStatus: (id: string) => `/v1/organizations/${id}/status`,
  search: '/v1/organizations/search',
  byStatus: (status: string) => `/v1/organizations/status/${status}`,
  byType: (type: string) => `/v1/organizations/type/${type}`,
  byProvinceAndStatus: (province: string, status: string) =>
    `/v1/organizations/province/${province}/status/${status}`,
  countByStatus: '/v1/organizations/stats/count-by-status',
}

// User-Farm Access (not in current file)
userFarmAccess: {
  grant: '/v1/user-farm-access',
  get: (id: string) => `/v1/user-farm-access/${id}`,
  byUser: (userId: string) => `/v1/user-farm-access/user/${userId}`,
  byFarm: (farmId: string) => `/v1/user-farm-access/farm/${farmId}`,
  update: (id: string) => `/v1/user-farm-access/${id}`,
  revoke: (id: string) => `/v1/user-farm-access/${id}/revoke`,
  delete: (id: string) => `/v1/user-farm-access/${id}`,
}

// Permissions (not in current file)
permissions: {
  list: '/v1/permissions',
  get: (id: string) => `/v1/permissions/${id}`,
  getByCode: (code: string) => `/v1/permissions/code/${code}`,
  create: '/v1/permissions',
  update: (id: string) => `/v1/permissions/${id}`,
  delete: (id: string) => `/v1/permissions/${id}`,
  byModule: (module: string) => `/v1/permissions/module/${module}`,
  search: '/v1/permissions/search',
}

// Update farms endpoints — add missing ones:
farms.getByCode: (code: string) => `/v1/farms/code/${code}`,
farms.changeStatus: (id: string) => `/v1/farms/${id}/status`,
farms.search: '/v1/farms/search',
farms.byProvinceAndStatus: (province: string, status: string) =>
  `/v1/farms/province/${province}/status/${status}`,
farms.countByStatus: '/v1/farms/stats/count-by-status',
farms.countByOrganization: (orgId: string) => `/v1/farms/stats/count-by-organization/${orgId}`,

// Update users endpoints — add missing ones:
users.getByPhone: (phone: string) => `/v1/users/phone/${phone}`,
users.getByCode: (code: string) => `/v1/users/code/${code}`,
users.byStatus: (status: string) => `/v1/users/status/${status}`,
users.search: '/v1/users/search',
users.changeStatus: (id: string) => `/v1/users/${id}/status`,
users.countByStatus: (status: string) => `/v1/users/count/status/${status}`,

// IoT sensors — update to match actual backend:
iot.sensors.listByFarm: (farmId: string) => `/v1/farms/${farmId}/iot-sensors`,
iot.sensors.getByFarm: (farmId: string, id: string) => `/v1/farms/${farmId}/iot-sensors/${id}`,
iot.sensors.createForFarm: (farmId: string) => `/v1/farms/${farmId}/iot-sensors`,
iot.sensors.updateForFarm: (farmId: string, id: string) => `/v1/farms/${farmId}/iot-sensors/${id}`,
iot.readings.create: '/iot/readings',
iot.readings.get: (id: string) => `/iot/readings/${id}`,
```

### 5b — Create service files

Pattern (same as `data/auth.ts`):

| File | Module | Backend Status | Key Methods |
|------|--------|----------------|-------------|
| `data/organizations.ts` | Organizations | Ready | list, getById, getByCode, create, update, delete, changeStatus, search, byType, byStatus, countByStatus |
| `data/farms.ts` | Farms | Ready | list, getById, getByCode, create, update, delete, changeStatus, search, byType, byStatus, byOrg, countByStatus |
| `data/users.ts` | Users | Ready | list, getById, getByPhone, getByCode, create, update, delete, changeStatus, search, byStatus, countByStatus |
| `data/roles.ts` | Roles | Ready | list, getById, getByCode, create, update, delete, search, getSystem |
| `data/permissions.ts` | Permissions | Ready | list, getById, getByCode, create, update, delete, byModule, search |
| `data/user-farm-access.ts` | User-Farm Access | Ready | grant, get, byUser, byFarm, update, revoke, delete |
| `data/iot.ts` | IoT Sensors + Readings | Ready | CRUD sensors, readings, latest, statistics, anomalies, weather |
| `data/crops.ts` | CropTypes + Parcels + Cultivations + Activities | Ready | CRUD all, by family, active, timeline, by year |
| `data/livestock.ts` | AnimalTypes + Animals + VetCare + Production | Ready | CRUD all, by category, genealogy, active |
| `data/inventory.ts` | Items + Stock Movements | Ready | CRUD, low-stock, needs-reorder, search, by date range |
| `data/hr.ts` | Employees + Tasks + Attendance | Ready | CRUD, active, overdue tasks, by date range |
| `data/finance.ts` | Finance (from marketplace) | Ready | Revenue, avg order value, inventory valuation |
| `data/marketplace.ts` | Customers + Products + Orders | Ready | CRUD all, search, revenue, pending, overdue, expiring |
| `data/weather.ts` | Weather (from IoT readings) | Ready | Current, history, forecast per farm |
| `data/notifications.ts` | Notifications + Alert Rules | Ready | List, unread, send, stats, CRUD alert rules |
| `data/modules.ts` | System Modules | Ready | CRUD, active, system, assign permissions |
| `data/user-organizations.ts` | User-Organization membership | Ready | Add/remove members, roles, primary org |
| `data/audit.ts` | Audit + Sync Logs + System Logs | Ready | List, by entity, by user, stats |

**Files to create:**
- `data/organizations.ts`
- `data/farms.ts`
- `data/users.ts`
- `data/roles.ts`
- `data/permissions.ts`
- `data/user-farm-access.ts`
- `data/user-organizations.ts`
- `data/modules.ts`
- `data/iot.ts`
- `data/crops.ts`
- `data/livestock.ts`
- `data/inventory.ts`
- `data/hr.ts`
- `data/finance.ts`
- `data/marketplace.ts`
- `data/weather.ts`
- `data/notifications.ts`
- `data/audit.ts`

---

## STEP 6 — Permission Guard Component

**Goal:** Create reusable component that shows/hides content based on user permissions.

```ts
// components/auth/permission-guard.tsx
"use client";
import useAuth from "@/store/useAuth";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;  // default false = any match
  fallback?: React.ReactNode;
}
```

Usage:
```tsx
<PermissionGuard permission="FARMS_CREATE">
  <Button>Add Farm</Button>
</PermissionGuard>
```

**Backend permissions by module:**

| Module | Permissions |
|--------|------------|
| Users | USERS_CREATE, USERS_VIEW, USERS_EDIT, USERS_DELETE, USERS_LIST, USERS_SEARCH, USERS_CHANGE_STATUS |
| Farms | FARMS_CREATE, FARMS_VIEW, FARMS_EDIT, FARMS_DELETE, FARMS_LIST, FARMS_SEARCH, FARMS_VIEW_STATS, FARMS_CHANGE_STATUS |
| Organizations | ORGANIZATIONS_CREATE, ORGANIZATIONS_VIEW, ORGANIZATIONS_EDIT, ORGANIZATIONS_DELETE, ORGANIZATIONS_LIST, ORGANIZATIONS_SEARCH, ORGANIZATIONS_CHANGE_STATUS, ORGANIZATIONS_VIEW_STATS |
| Roles | ROLES_CREATE, ROLES_VIEW, ROLES_EDIT, ROLES_DELETE, ROLES_LIST, ROLES_SEARCH |
| Permissions | PERMISSIONS_VIEW, PERMISSIONS_EDIT, PERMISSIONS_DELETE, PERMISSIONS_LIST, PERMISSIONS_SEARCH |
| User-Farm Access | USER_FARM_ACCESS_GRANT, USER_FARM_ACCESS_VIEW, USER_FARM_ACCESS_EDIT, USER_FARM_ACCESS_REVOKE |
| IoT | IOT_SENSORS_CREATE, IOT_SENSORS_LIST, IOT_SENSORS_VIEW, IOT_SENSORS_EDIT, IOT_READINGS_CREATE, IOT_READINGS_VIEW |
| Crops | PARCELS_CREATE, PARCELS_VIEW, CULTIVATIONS_CREATE, CULTIVATIONS_VIEW |
| Livestock | LIVESTOCK_CREATE, LIVESTOCK_VIEW, LIVESTOCK_EDIT, LIVESTOCK_DELETE |
| Inventory | INVENTORY_ITEM_CREATE, INVENTORY_ITEM_VIEW, INVENTORY_MOVEMENT_CREATE |
| HR | HR_EMPLOYEE_CREATE, HR_EMPLOYEE_VIEW, HR_ATTENDANCE_CREATE, HR_TASK_CREATE |
| Marketplace | ORDERS_CREATE, ORDERS_VIEW, ORDERS_EDIT, PRODUCTS_CREATE, CUSTOMERS_CREATE |
| Notifications | NOTIFICATIONS_VIEW, NOTIFICATIONS_CREATE |

**Files to create:**
- `components/auth/permission-guard.tsx`

---

## STEP 7 — Dashboard Home Page

**Goal:** Replace the old default dashboard with a Farm Management overview.

Summary cards (use available backend endpoints):
- Total farms (from `GET /v1/farms/stats/count-by-status`)
- Total organizations (from `GET /v1/organizations/stats/count-by-status`)
- Total users (from `GET /v1/users/count/status/ACTIVE`)
- Active farms by type chart
- Recent farms list
- Quick actions (create farm, add user, etc.)

> More cards will be added as backend modules become available (crops, livestock, etc.)

**Files to create:**
- `app/dashboard/(auth)/default/page.tsx`
- `app/dashboard/(auth)/default/components/` (summary cards, charts)

---

## STEP 8 — Organizations Module

**Goal:** Full CRUD for organizations (cooperatives, companies, NGOs).

Backend: **Ready** — 12 endpoints

| Page | Route | Description |
|------|-------|-------------|
| Organizations List | `/dashboard/organizations` | DataTable with search, filter by type/status |
| Organization Detail | `/dashboard/organizations/[id]` | Info + linked farms |

Enums:
- Types: `COOPERATIVE`, `GROUPEMENT`, `ENTREPRISE`, `ONG`
- Statuses: `ACTIVE`, `INACTIVE`, `SUSPENDED`

Components:
- `organization-columns.tsx` — DataTable columns
- `organization-form-modal.tsx` — Create/Edit (name, type, province, description)
- `organization-status-badge.tsx`
- `organization-type-badge.tsx`
- `organization-detail.tsx` — Detail view with farms tab
- `organization-delete-dialog.tsx`

Permissions: ORGANIZATIONS_CREATE, ORGANIZATIONS_VIEW, ORGANIZATIONS_EDIT, ORGANIZATIONS_DELETE, ORGANIZATIONS_LIST

**Files to create:**
- `app/dashboard/(auth)/organizations/page.tsx`
- `app/dashboard/(auth)/organizations/[id]/page.tsx`
- `app/dashboard/(auth)/organizations/components/`

---

## STEP 9 — Farms Module

**Goal:** Full CRUD pages for farm management.

Backend: **Ready** — 15 endpoints

| Page | Route | Description |
|------|-------|-------------|
| Farms List | `/dashboard/farms` | DataTable with search, filter by type/status/org |
| Farm Detail | `/dashboard/farms/[id]` | Overview with tabs (info, users, sensors) |

Enums:
- Types: `CROP`, `LIVESTOCK`, `MIXED`, `AQUACULTURE`
- Statuses: `ACTIVE`, `INACTIVE`, `ABANDONED`
- Soil types: `CLAY`, `SANDY`, `LOAM`, `SILTY`, `PEATY`, `CHALKY`, `OTHER`

Components:
- `farm-columns.tsx` — DataTable columns
- `farm-form-modal.tsx` — Create/Edit (name, type, location, area, soilType, organizationId, province)
- `farm-status-badge.tsx`
- `farm-type-badge.tsx`
- `farm-detail-tabs.tsx` — Tabs: info, user access, sensors (parcels/livestock later)
- `farm-delete-dialog.tsx`
- `farm-user-access.tsx` — Manage which users have access to this farm

Permissions: FARMS_CREATE, FARMS_VIEW, FARMS_EDIT, FARMS_DELETE, FARMS_LIST, FARMS_CHANGE_STATUS, FARMS_VIEW_STATS

**Files to create:**
- `app/dashboard/(auth)/farms/page.tsx`
- `app/dashboard/(auth)/farms/[id]/page.tsx`
- `app/dashboard/(auth)/farms/components/`

---

## STEP 10 — Users Management Module

**Goal:** Admin pages for user management.

Backend: **Ready** — 11 endpoints

| Page | Route | Description |
|------|-------|-------------|
| Users List | `/dashboard/users` | DataTable with search, filter by status |
| User Detail | `/dashboard/users/[id]` | Profile, roles, farm access, status management |

Enums:
- Statuses: `ACTIVE`, `INACTIVE`, `BLOCKED`, `DELETED`

Components:
- `user-columns.tsx` — DataTable columns
- `user-form-modal.tsx` — Create/Edit (firstName, lastName, phoneNumber, email, password)
- `user-status-badge.tsx`
- `user-detail-tabs.tsx` — Tabs: profile, roles, farm access
- `user-status-actions.tsx` — Activate/Deactivate/Block
- `user-farm-access-table.tsx` — Manage farm access for this user
- `user-delete-dialog.tsx`

Permissions: USERS_CREATE, USERS_VIEW, USERS_EDIT, USERS_DELETE, USERS_LIST, USERS_CHANGE_STATUS

**Files to create:**
- `app/dashboard/(auth)/users/page.tsx` (rework existing)
- `app/dashboard/(auth)/users/[id]/page.tsx` (rework existing)
- `app/dashboard/(auth)/users/components/`

---

## STEP 11 — Roles & Permissions Module

**Goal:** Admin pages for role and permission management.

Backend: **Ready** — Roles: 8 endpoints, Permissions: 8 endpoints

| Page | Route | Description |
|------|-------|-------------|
| Roles List | `/dashboard/roles` | DataTable with search |
| Role Detail | `/dashboard/roles/[id]` | Role info + permission assignment |
| Permissions | `/dashboard/permissions` | List all permissions by module |

Components:
- `role-columns.tsx`
- `role-form-modal.tsx` — Create/Edit (name, description, level, permissions)
- `role-detail.tsx` — Show assigned permissions
- `permission-list.tsx` — List permissions grouped by module
- `permission-assignment.tsx` — Checkbox grid to assign permissions to role
- `role-delete-dialog.tsx`

Permissions: ROLES_CREATE, ROLES_VIEW, ROLES_EDIT, ROLES_DELETE, PERMISSIONS_VIEW, PERMISSIONS_EDIT

**Files to create:**
- `app/dashboard/(auth)/roles/page.tsx`
- `app/dashboard/(auth)/roles/[id]/page.tsx`
- `app/dashboard/(auth)/permissions/page.tsx`
- `app/dashboard/(auth)/roles/components/`
- `app/dashboard/(auth)/permissions/components/`

---

## STEP 12 — IoT Sensors Module

**Goal:** Manage sensors per farm.

Backend: **Ready** — 18 endpoints (IoTSensorController + IoTReadingController)

| Page | Route | Description |
|------|-------|-------------|
| Sensors by Farm | `/dashboard/iot` | Select farm → list sensors |
| Sensor Detail | `/dashboard/iot/[id]` | Sensor info + readings chart + statistics |

Backend endpoints:
- Sensors: CRUD under `/v1/farms/{farmId}/iot-sensors` (status change, low battery, needs calibration, by type)
- Readings: under `/v1/iot-sensors/{sensorId}/readings` (list, latest, statistics)
- Anomalies: `GET /v1/farms/{farmId}/iot-readings/anomalies`

Components:
- `sensor-columns.tsx`
- `sensor-form-modal.tsx`
- `sensor-readings-chart.tsx`
- `sensor-statistics.tsx`
- `sensor-detail.tsx`

Permissions: IOT_SENSORS_CREATE, IOT_SENSORS_LIST, IOT_SENSORS_VIEW, IOT_SENSORS_EDIT, IOT_READINGS_VIEW

**Files to create:**
- `app/dashboard/(auth)/iot/page.tsx`
- `app/dashboard/(auth)/iot/[id]/page.tsx`
- `app/dashboard/(auth)/iot/components/`

---

## STEP 13 — Crops Module (Parcels + Cultivations)

**Backend: Ready** — 33 endpoints (CropTypeController + ParcelController + CultivationController)

| Page | Route | Description |
|------|-------|-------------|
| Crop Types | `/dashboard/crops/types` | Manage crop types by family |
| Crops Overview | `/dashboard/crops` | List parcels with cultivation status |
| Parcel Detail | `/dashboard/crops/parcels/[id]` | Parcel info + cultivations list |
| Cultivation Detail | `/dashboard/crops/cultivations/[id]` | Timeline, activities |

Backend endpoints:
- Crop types: CRUD under `/v1/crop-types` (by family, search, count)
- Parcels: CRUD under `/v1/farms/{farmId}/parcels` (active, count)
- Cultivations: CRUD under `/v1/parcels/{parcelId}/cultivations` (by farm, active, by year, timeline)
- Activities: CRUD under `/v1/cultivations/{cultivationId}/activities`

Statuses: PLANNING, ACTIVE, COMPLETED, FAILED

**Files to create:**
- `app/dashboard/(auth)/crops/page.tsx`
- `app/dashboard/(auth)/crops/types/page.tsx`
- `app/dashboard/(auth)/crops/parcels/[id]/page.tsx`
- `app/dashboard/(auth)/crops/cultivations/[id]/page.tsx`
- `app/dashboard/(auth)/crops/components/`

---

## STEP 14 — Livestock Module

**Backend: Ready** — 29 endpoints (AnimalTypeController + LivestockController)

| Page | Route | Description |
|------|-------|-------------|
| Animal Types | `/dashboard/livestock/types` | Manage animal types by category |
| Livestock List | `/dashboard/livestock` | Animals with filters (species, status) |
| Animal Detail | `/dashboard/livestock/[id]` | Health, production, genealogy |

Backend endpoints:
- Animal types: CRUD under `/v1/animal-types` (by category, search)
- Animals: CRUD under `/v1/farms/{farmId}/livestock` (active, count, genealogy)
- Veterinary care: CRUD under `/v1/livestock/{id}/veterinary-care`
- Production: CRUD under `/v1/livestock/{id}/production`

Statuses: ACTIVE, SICK, SOLD, DEAD

**Files to create:**
- `app/dashboard/(auth)/livestock/page.tsx`
- `app/dashboard/(auth)/livestock/types/page.tsx`
- `app/dashboard/(auth)/livestock/[id]/page.tsx`
- `app/dashboard/(auth)/livestock/components/`

---

## STEP 15 — Inventory Module

**Backend: Ready** — 16 endpoints (InventoryController)

| Page | Route | Description |
|------|-------|-------------|
| Inventory List | `/dashboard/inventory` | Items + low-stock alerts |
| Item Detail | `/dashboard/inventory/[id]` | Movement history |
| Movements | `/dashboard/inventory/movements` | All movements |

Backend endpoints:
- Items: CRUD under `/inventory/items` (by farm, low-stock, needs-reorder, search, count)
- Movements: CRUD under `/inventory/movements` (by item, by type, by date range)

Movement types: IN, OUT, ADJUSTMENT

**Files to create:**
- `app/dashboard/(auth)/inventory/page.tsx`
- `app/dashboard/(auth)/inventory/[id]/page.tsx`
- `app/dashboard/(auth)/inventory/movements/page.tsx`
- `app/dashboard/(auth)/inventory/components/`

---

## STEP 16 — HR Module (Personnel)

**Backend: Ready** — 22 endpoints (EmployeeController + TaskController + AttendanceController)

| Page | Route | Description |
|------|-------|-------------|
| Employees | `/dashboard/hr` | Employee list |
| Employee Detail | `/dashboard/hr/employees/[id]` | Attendance, tasks |
| Tasks | `/dashboard/hr/tasks` | Task board / list |
| Attendance | `/dashboard/hr/attendance` | Daily recording |

Backend endpoints:
- Employees: CRUD under `/hr/employees` (by farm, active, count)
- Tasks: CRUD under `/hr/tasks` (by employee, by status, overdue)
- Attendance: CRUD under `/hr/attendances` (by employee, by date range)

Attendance statuses: PRESENT, ABSENT, LATE, HALF_DAY
Task priorities: LOW, MEDIUM, HIGH

**Files to create:**
- `app/dashboard/(auth)/hr/page.tsx`
- `app/dashboard/(auth)/hr/employees/[id]/page.tsx`
- `app/dashboard/(auth)/hr/tasks/page.tsx`
- `app/dashboard/(auth)/hr/attendance/page.tsx`
- `app/dashboard/(auth)/hr/components/`

---

## STEP 17 — Finance Module

**Backend: Note** — No dedicated finance controller found on `koumbem` branch. Financial tracking is handled via marketplace orders (revenue endpoints) and inventory (valuation). A dedicated finance module may be added later.

| Page | Route | Description |
|------|-------|-------------|
| Finance Overview | `/dashboard/finance` | Summary from orders revenue + inventory valuation |
| Revenue | `/dashboard/finance/revenue` | Revenue from marketplace orders |

Available data sources:
- `GET /marketplace/orders/farm/{farmId}/revenue` — Revenue stats
- `GET /marketplace/orders/farm/{farmId}/average-value` — Average order value
- `GET /marketplace/products/farm/{farmId}/inventory-value` — Inventory valuation

**Files to create:**
- `app/dashboard/(auth)/finance/page.tsx`
- `app/dashboard/(auth)/finance/components/`

---

## STEP 18 — Marketplace Module

**Backend: Ready** — 42 endpoints (CustomerController + ProductController + SaleOrderController)

| Page | Route | Description |
|------|-------|-------------|
| Marketplace Overview | `/dashboard/marketplace` | Sales summary + revenue |
| Products | `/dashboard/marketplace/products` | Product catalog (available, low-stock, expiring) |
| Customers | `/dashboard/marketplace/customers` | Customer list (active, by type, top revenue, credit limit) |
| Orders | `/dashboard/marketplace/orders` | Order management (by status, payment, date range) |
| Order Detail | `/dashboard/marketplace/orders/[id]` | Order items, status, payment |

Backend endpoints:
- Customers: CRUD under `/marketplace/customers` (by farm, active, by type, search, credit limit, top revenue, count)
- Products: CRUD under `/marketplace/products` (by farm, available, by type, search, expiring, low-stock, inventory value, count)
- Orders: CRUD under `/marketplace/orders` (by farm, customer, status, payment status, date range, search, pending, overdue, revenue, count, avg value)

Order statuses: PENDING, APPROVED, PREPARING, SHIPPED, DELIVERED, CANCELLED
Payment statuses: UNPAID, PARTIAL, PAID

**Files to create:**
- `app/dashboard/(auth)/marketplace/page.tsx`
- `app/dashboard/(auth)/marketplace/products/page.tsx`
- `app/dashboard/(auth)/marketplace/customers/page.tsx`
- `app/dashboard/(auth)/marketplace/orders/page.tsx`
- `app/dashboard/(auth)/marketplace/orders/[id]/page.tsx`
- `app/dashboard/(auth)/marketplace/components/`

---

## STEP 19 — Notifications & Alert Rules

**Backend: Ready** — 16 endpoints (NotificationController + AlertRuleController)

- Notification bell component in header (unread count)
- Notifications page (full list, mark read)
- Alert rules per farm (create, toggle, trigger)

Backend endpoints:
- `GET /v1/notifications` (list, unread, unread-count, stats)
- `PUT /v1/notifications/{id}/read`, `PUT /v1/notifications/mark-all-read`
- `POST /v1/notifications/send`
- Alert rules: CRUD under `/v1/farms/{farmId}/alert-rules` (toggle, trigger)

**Files to create:**
- `components/notifications/notification-bell.tsx`
- `app/dashboard/(auth)/notifications/page.tsx`
- `app/dashboard/(auth)/notifications/alert-rules/page.tsx`
- `app/dashboard/(auth)/notifications/components/`

---

## STEP 20 — Weather Integration

**Backend: Ready** — Weather endpoints are part of IoTReadingController

- Weather widget on dashboard
- Weather page with forecast, history per farm

Backend endpoints:
- `GET /v1/farms/{farmId}/weather/current`
- `GET /v1/farms/{farmId}/weather/history`
- `GET /v1/farms/{farmId}/weather/forecast`

**Files to create:**
- `components/weather/weather-widget.tsx`
- `app/dashboard/(auth)/weather/page.tsx`
- `app/dashboard/(auth)/weather/components/`

---

## STEP 21 — Settings & Profile

**Goal:** User profile editing, app settings, security (change password, PIN).

| Page | Route | Description |
|------|-------|-------------|
| Profile | `/dashboard/settings/profile` | View/edit user info |
| Security | `/dashboard/settings/security` | Change password, PIN management |
| Preferences | `/dashboard/settings/preferences` | Notification preferences, language |

**Files to touch:**
- `app/dashboard/(auth)/settings/profile/page.tsx` (new or rework)
- `app/dashboard/(auth)/settings/security/page.tsx` (rework)
- `app/dashboard/(auth)/settings/security/pin/page.tsx` (new)

---

## STEP 22 — Shared UI Components

**Goal:** Build reusable components used across modules.

Built as-needed during the module steps above:

| Component | Location | Purpose |
|-----------|----------|---------|
| `DataTable` | `components/ui/data-table.tsx` | Probably exists from template |
| `StatusBadge` | `components/ui/status-badge.tsx` | Colored badge for statuses |
| `ConfirmDialog` | `components/ui/confirm-dialog.tsx` | Delete confirmation |
| `FormModal` | `components/ui/form-modal.tsx` | Reusable modal wrapper |
| `EmptyState` | `components/ui/empty-state.tsx` | Empty state placeholder |
| `ComingSoon` | `components/ui/coming-soon.tsx` | "Module coming soon" placeholder page |
| `StatsCard` | `components/ui/stats-card.tsx` | Dashboard summary card |
| `FarmSelector` | `components/farm-selector.tsx` | Global farm context selector |
| `PageHeader` | `components/ui/page-header.tsx` | Consistent page header with breadcrumb |

---

## STEP 23 — Old Code Cleanup

**Goal:** Remove AvePay code that has been fully replaced.

- [ ] Remove old page directories (listed in Step 3c)
- [ ] Remove old type files (`types/clients.ts`, `types/terminal.ts`, `types/catalog.ts`, `types/data-table.ts`, `types/module-permissions.ts`, `types/user-permissions.ts`, `types/user-sessions.ts`, `types/audit.ts`, `types/sessions.ts`, `types/auth.ts`, `types/role-permissions.ts`)
- [ ] Remove old route constants (`APP_ROUTES`, `PAGE_ROUTES`, `EXTERNAL_ROUTES`, `API_ROUTES`)
- [ ] Remove `ignoreBuildErrors: true` from `next.config.ts`
- [ ] Clean up unused dependencies from `package.json`
- [ ] Remove `data/client/index.ts` old Client class (once all methods moved to individual data/ files)

---

## Implementation Order (Recommended)

| Phase | Steps | What |
|-------|-------|------|
| **Phase 1: Foundation** | 1, 2, 3, 4, 5, 6 | Branding, Auth pages, Routes, Types, Services, PermissionGuard |
| **Phase 2: Core Dashboard** | 7, 22 | Dashboard home + shared UI components |
| **Phase 3: Admin** | 8, 9, 10, 11 | Organizations, Farms, Users, Roles & Permissions |
| **Phase 4: Farm Operations** | 13, 14, 15, 16 | Crops, Livestock, Inventory, HR |
| **Phase 5: Commerce** | 17, 18 | Finance, Marketplace |
| **Phase 6: Monitoring** | 12, 19, 20 | IoT Sensors, Notifications & Alerts, Weather |
| **Phase 7: Settings** | 21 | Profile, Security, Preferences |
| **Phase 8: Polish** | 23 | Old code cleanup |

---

## Key Conventions

1. **Use existing infra** — `data/client/http-client.ts` for API calls, `data/client/endpoints.ts` for URLs
2. **React Query everywhere** — No `useEffect` + `useState` for data fetching
3. **Permission-based UI** — Wrap actions with `<PermissionGuard>`
4. **French UI text** — The app targets Burkina Faso; use French for user-facing strings
5. **Farm context** — Many endpoints are farm-scoped; build a `FarmSelector` + Zustand store for selected farm
6. **shadcn/ui components** — Use the existing component library
7. **Form validation** — Use zod schemas with react-hook-form (same pattern as existing code)
8. **UUID IDs** — Backend uses UUID strings, not numeric IDs
9. **Pagination params** — `page` (0-based), `size`, `sortBy` (default "createdAt"), `sortDirection` (default "DESC")
10. **Standard response** — All API responses follow `{ success, status, message, data }` shape
