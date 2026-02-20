# Next.js Integration Guide — Farm Management API

> **Base URL**: `http://localhost:8081/api`
> **Auth**: Bearer JWT token required on all endpoints except `/v1/auth/**`

---

## Table of Contents

1. [Project Setup](#step-1--project-setup)
2. [Environment Variables](#step-2--environment-variables)
3. [API Client (Axios)](#step-3--api-client-axios-instance)
4. [Standard Response Types](#step-4--standard-response-type)
5. [Authentication Module](#step-5--authentication-module)
6. [Auth Store (Zustand)](#step-6--auth-store-zustand)
7. [Farms Module](#step-7--farms-module)
8. [Crops Module](#step-8--crops-module-parcels--cultivations)
9. [Livestock Module](#step-9--livestock-module)
10. [Inventory Module](#step-10--inventory-module)
11. [HR Module](#step-11--hr-module)
12. [Marketplace Module](#step-12--marketplace-module)
13. [Notifications Module](#step-13--notifications-module)
14. [Users & Roles Module](#step-14--users--roles-module)
15. [Permission Guard Component](#step-15--permission-guard-component)
16. [Organizations Module](#step-16--organizations-module)
17. [IoT Sensors Module](#step-17--iot-sensors-module)
18. [App Layout with Navigation](#step-18--app-layout-with-navigation)
19. [React Query Setup](#step-19--react-query-setup)
20. [Error Handling Utility](#step-20--error-handling-utility)
21. [File Structure Summary](#summary--file-structure)
22. [Key Notes](#key-notes)

---

## STEP 1 — Project Setup

```bash
npx create-next-app@latest farm-frontend --typescript --tailwind --app
cd farm-frontend
npm install axios js-cookie jwt-decode zustand @tanstack/react-query
npm install -D @types/js-cookie
```

---

## STEP 2 — Environment Variables

Create `.env.local` at the root of your project:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_API_VERSION=v1
```

---

## STEP 3 — API Client (Axios Instance)

Create `lib/api.ts`:

```ts
import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = Cookies.get('refresh_token')
      if (refresh) {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
          { refreshToken: refresh }
        )
        Cookies.set('access_token', data.data.accessToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## STEP 4 — Standard Response Type

Create `types/api.ts`:

```ts
export interface ApiResponse<T> {
  success: boolean
  status: number
  message: string
  data: T
}

export interface PagedData<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
```

---

## STEP 5 — Authentication Module

### Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | User registration |
| POST | `/v1/auth/login` | User login |
| POST | `/v1/auth/refresh` | Refresh access token |
| POST | `/v1/auth/logout` | Logout current device |
| POST | `/v1/auth/logout-all` | Logout all devices |
| POST | `/v1/auth/forgot-password` | Request password reset |
| POST | `/v1/auth/reset-password` | Reset password with code |
| POST | `/v1/auth/pin/set` | Set PIN code |
| PUT | `/v1/auth/pin/update` | Update PIN code |
| DELETE | `/v1/auth/pin/remove` | Remove PIN code |
| GET | `/v1/auth/health` | Health check |

### Service: `services/auth.service.ts`

```ts
import api from '@/lib/api'
import Cookies from 'js-cookie'

export const authService = {
  async register(payload: {
    phoneNumber: string
    firstName: string
    lastName: string
    password: string
    email?: string
  }) {
    const { data } = await api.post('/v1/auth/register', payload)
    return data
  },

  async login(credentials: { phoneNumber: string; password: string }) {
    const { data } = await api.post('/v1/auth/login', credentials)
    if (data.success) {
      Cookies.set('access_token', data.data.accessToken, { expires: 1 / 24 })
      Cookies.set('refresh_token', data.data.refreshToken, { expires: 30 })
    }
    return data
  },

  async logout() {
    await api.post('/v1/auth/logout')
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  },

  async logoutAll() {
    await api.post('/v1/auth/logout-all')
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  },

  async forgotPassword(phoneNumber: string) {
    return api.post('/v1/auth/forgot-password', { phoneNumber })
  },

  async resetPassword(payload: { token: string; newPassword: string }) {
    return api.post('/v1/auth/reset-password', payload)
  },

  async setPin(payload: { pin: string; password: string }) {
    return api.post('/v1/auth/pin/set', payload)
  },

  async updatePin(payload: { currentPin: string; newPin: string }) {
    return api.put('/v1/auth/pin/update', payload)
  },

  async removePin(payload: { pin: string }) {
    return api.delete('/v1/auth/pin/remove', { data: payload })
  },
}
```

### Login Page: `app/login/page.tsx`

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ phoneNumber: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await authService.login(form)
      if (res.success) router.push('/dashboard')
      else setError(res.message)
    } catch {
      setError('Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-8 border rounded">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        className="w-full border p-2 mb-4 rounded"
        placeholder="Phone number"
        value={form.phoneNumber}
        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
      />
      <input
        type="password"
        className="w-full border p-2 mb-4 rounded"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
        Login
      </button>
    </form>
  )
}
```

---

## STEP 6 — Auth Store (Zustand)

Create `store/auth.store.ts`:

```ts
import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

interface JwtPayload {
  sub: string
  userId: number
  roles: string[]
  permissions: string[]
  exp: number
}

interface AuthState {
  user: JwtPayload | null
  isAuthenticated: boolean
  hasPermission: (perm: string) => boolean
  initialize: () => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  initialize() {
    const token = Cookies.get('access_token')
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        if (decoded.exp * 1000 > Date.now()) {
          set({ user: decoded, isAuthenticated: true })
        }
      } catch {}
    }
  },

  clear() {
    set({ user: null, isAuthenticated: false })
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  },

  hasPermission(perm: string) {
    return get().user?.permissions?.includes(perm) ?? false
  },
}))
```

### Route Guard: `components/AuthGuard.tsx`

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialize } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    initialize()
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated])

  if (!isAuthenticated) return null
  return <>{children}</>
}
```

---

## STEP 7 — Farms Module

### Endpoints Reference

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/farms` | FARMS_CREATE | Create farm |
| GET | `/v1/farms/{id}` | FARMS_VIEW | Get by ID |
| GET | `/v1/farms/code/{code}` | FARMS_VIEW | Get by code |
| GET | `/v1/farms` | FARMS_LIST | List all (paginated) |
| GET | `/v1/farms/status/{status}` | FARMS_LIST | Get by status |
| GET | `/v1/farms/type/{type}` | FARMS_LIST | Get by type |
| GET | `/v1/farms/organization/{organizationId}` | FARMS_LIST | Get by organization |
| GET | `/v1/farms/search` | FARMS_SEARCH | Search |
| GET | `/v1/farms/{id}/statistics` | FARMS_VIEW_STATS | Get farm statistics |
| PUT | `/v1/farms/{id}` | FARMS_EDIT | Update |
| PATCH | `/v1/farms/{id}/status` | FARMS_CHANGE_STATUS | Change status |
| DELETE | `/v1/farms/{id}` | FARMS_DELETE | Delete |

### Farm Types
- `CROP` — Crop farm
- `LIVESTOCK` — Livestock farm
- `MIXED` — Mixed farm
- `AQUACULTURE` — Aquaculture farm

### Farm Statuses
- `ACTIVE`
- `INACTIVE`
- `ABANDONED`

### Service: `services/farms.service.ts`

```ts
import api from '@/lib/api'

export const farmsService = {
  list: (page = 0, size = 10) =>
    api.get('/v1/farms', { params: { page, size } }).then((r) => r.data),

  getById: (id: number) =>
    api.get(`/v1/farms/${id}`).then((r) => r.data),

  getByCode: (code: string) =>
    api.get(`/v1/farms/code/${code}`).then((r) => r.data),

  getByStatus: (status: string) =>
    api.get(`/v1/farms/status/${status}`).then((r) => r.data),

  getByType: (type: 'CROP' | 'LIVESTOCK' | 'MIXED' | 'AQUACULTURE') =>
    api.get(`/v1/farms/type/${type}`).then((r) => r.data),

  getByOrganization: (orgId: number) =>
    api.get(`/v1/farms/organization/${orgId}`).then((r) => r.data),

  create: (payload: {
    name: string
    type: string
    location?: string
    organizationId?: number
    area?: number
    provinceId?: number
  }) => api.post('/v1/farms', payload).then((r) => r.data),

  update: (id: number, payload: object) =>
    api.put(`/v1/farms/${id}`, payload).then((r) => r.data),

  changeStatus: (id: number, status: string) =>
    api.patch(`/v1/farms/${id}/status`, { status }).then((r) => r.data),

  getStats: (id: number) =>
    api.get(`/v1/farms/${id}/statistics`).then((r) => r.data),

  search: (keyword: string) =>
    api.get('/v1/farms/search', { params: { keyword } }).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/v1/farms/${id}`).then((r) => r.data),
}
```

### Farms Page: `app/dashboard/farms/page.tsx`

```tsx
'use client'
import { useEffect, useState } from 'react'
import { farmsService } from '@/services/farms.service'

export default function FarmsPage() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    farmsService.list().then((res) => {
      if (res.success) setFarms(res.data.content)
      setLoading(false)
    })
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Farms</h1>
      <div className="grid grid-cols-3 gap-4">
        {farms.map((farm: any) => (
          <div key={farm.id} className="border rounded p-4">
            <h2 className="font-semibold">{farm.name}</h2>
            <p className="text-sm text-gray-500">{farm.type}</p>
            <span className={`text-sm font-medium ${farm.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
              {farm.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## STEP 8 — Crops Module (Parcels & Cultivations)

### Endpoints Reference

**Parcels**

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/farms/{farmId}/parcels` | PARCELS_CREATE | Create parcel |
| GET | `/v1/parcels/{id}` | PARCELS_VIEW | Get parcel |
| GET | `/v1/farms/{farmId}/parcels` | PARCELS_LIST | List parcels |
| GET | `/v1/farms/{farmId}/parcels/active` | PARCELS_LIST | Get active parcels |
| PUT | `/v1/parcels/{id}` | PARCELS_EDIT | Update parcel |
| PATCH | `/v1/parcels/{id}/status` | PARCELS_EDIT | Change status |
| DELETE | `/v1/parcels/{id}` | PARCELS_DELETE | Delete parcel |

**Cultivations**

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/parcels/{parcelId}/cultivations` | CULTIVATIONS_CREATE | Create cultivation |
| GET | `/v1/cultivations/{id}` | CULTIVATIONS_VIEW | Get cultivation |
| GET | `/v1/parcels/{parcelId}/cultivations` | CULTIVATIONS_LIST | List by parcel |
| GET | `/v1/farms/{farmId}/cultivations` | CULTIVATIONS_LIST | List by farm |
| GET | `/v1/farms/{farmId}/cultivations/active` | CULTIVATIONS_LIST | Get active |
| GET | `/v1/farms/{farmId}/cultivations/year/{year}` | CULTIVATIONS_LIST | Get by year |
| GET | `/v1/cultivations/{id}/timeline` | CULTIVATIONS_VIEW | Get timeline |
| PUT | `/v1/cultivations/{id}` | CULTIVATIONS_EDIT | Update |
| PATCH | `/v1/cultivations/{id}/status` | CULTIVATIONS_EDIT | Change status |
| DELETE | `/v1/cultivations/{id}` | CULTIVATIONS_DELETE | Delete |

**Agricultural Activities**

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/cultivations/{cultivationId}/activities` | CULTIVATIONS_EDIT | Create activity |
| GET | `/v1/activities/{id}` | CULTIVATIONS_VIEW | Get activity |
| GET | `/v1/cultivations/{cultivationId}/activities` | CULTIVATIONS_VIEW | List activities |
| PUT | `/v1/activities/{id}` | CULTIVATIONS_EDIT | Update |
| DELETE | `/v1/activities/{id}` | CULTIVATIONS_EDIT | Delete |

### Cultivation Statuses
- `PLANNING`
- `ACTIVE`
- `COMPLETED`
- `FAILED`

### Service: `services/crops.service.ts`

```ts
import api from '@/lib/api'

export const cropsService = {
  // --- Parcels ---
  listParcels: (farmId: number) =>
    api.get(`/v1/farms/${farmId}/parcels`).then((r) => r.data),

  getActiveParcels: (farmId: number) =>
    api.get(`/v1/farms/${farmId}/parcels/active`).then((r) => r.data),

  getParcel: (id: number) =>
    api.get(`/v1/parcels/${id}`).then((r) => r.data),

  createParcel: (farmId: number, payload: {
    name: string
    area?: number
    soilType?: string
    location?: string
  }) => api.post(`/v1/farms/${farmId}/parcels`, payload).then((r) => r.data),

  updateParcel: (id: number, payload: object) =>
    api.put(`/v1/parcels/${id}`, payload).then((r) => r.data),

  changeParcelStatus: (id: number, status: string) =>
    api.patch(`/v1/parcels/${id}/status`, { status }).then((r) => r.data),

  deleteParcel: (id: number) =>
    api.delete(`/v1/parcels/${id}`).then((r) => r.data),

  // --- Cultivations ---
  listCultivations: (parcelId: number) =>
    api.get(`/v1/parcels/${parcelId}/cultivations`).then((r) => r.data),

  listCultivationsByFarm: (farmId: number) =>
    api.get(`/v1/farms/${farmId}/cultivations`).then((r) => r.data),

  listActiveCultivations: (farmId: number) =>
    api.get(`/v1/farms/${farmId}/cultivations/active`).then((r) => r.data),

  listCultivationsByYear: (farmId: number, year: number) =>
    api.get(`/v1/farms/${farmId}/cultivations/year/${year}`).then((r) => r.data),

  createCultivation: (parcelId: number, payload: {
    cropTypeId: number
    startDate: string
    expectedEndDate?: string
    notes?: string
  }) => api.post(`/v1/parcels/${parcelId}/cultivations`, payload).then((r) => r.data),

  getTimeline: (cultivationId: number) =>
    api.get(`/v1/cultivations/${cultivationId}/timeline`).then((r) => r.data),

  updateCultivation: (id: number, payload: object) =>
    api.put(`/v1/cultivations/${id}`, payload).then((r) => r.data),

  changeCultivationStatus: (id: number, status: string) =>
    api.patch(`/v1/cultivations/${id}/status`, { status }).then((r) => r.data),

  deleteCultivation: (id: number) =>
    api.delete(`/v1/cultivations/${id}`).then((r) => r.data),

  // --- Activities ---
  listActivities: (cultivationId: number) =>
    api.get(`/v1/cultivations/${cultivationId}/activities`).then((r) => r.data),

  createActivity: (cultivationId: number, payload: {
    type: string
    date: string
    description?: string
    cost?: number
    performedBy?: number
  }) => api.post(`/v1/cultivations/${cultivationId}/activities`, payload).then((r) => r.data),

  updateActivity: (id: number, payload: object) =>
    api.put(`/v1/activities/${id}`, payload).then((r) => r.data),

  deleteActivity: (id: number) =>
    api.delete(`/v1/activities/${id}`).then((r) => r.data),
}
```

---

## STEP 9 — Livestock Module

### Endpoints Reference

**Animals**

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/farms/{farmId}/livestock` | LIVESTOCK_CREATE | Create animal |
| GET | `/v1/livestock/{id}` | LIVESTOCK_VIEW | Get animal |
| GET | `/v1/farms/{farmId}/livestock` | LIVESTOCK_LIST | List animals |
| GET | `/v1/farms/{farmId}/livestock/active` | LIVESTOCK_LIST | Get active |
| GET | `/v1/livestock/{id}/genealogy` | LIVESTOCK_VIEW | Get genealogy |
| PUT | `/v1/livestock/{id}` | LIVESTOCK_EDIT | Update |
| PATCH | `/v1/livestock/{id}/status` | LIVESTOCK_EDIT | Change status |
| DELETE | `/v1/livestock/{id}` | LIVESTOCK_DELETE | Delete |

**Veterinary Care**

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/livestock/{livestockId}/veterinary-care` | LIVESTOCK_EDIT | Create care record |
| GET | `/v1/veterinary-care/{id}` | LIVESTOCK_VIEW | Get care record |
| GET | `/v1/livestock/{livestockId}/veterinary-care` | LIVESTOCK_VIEW | Get history |
| PUT | `/v1/veterinary-care/{id}` | LIVESTOCK_EDIT | Update |
| DELETE | `/v1/veterinary-care/{id}` | LIVESTOCK_EDIT | Delete |

**Production Records**

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/livestock/{livestockId}/production` | LIVESTOCK_EDIT | Create production |
| GET | `/v1/production/{id}` | LIVESTOCK_VIEW | Get production |
| GET | `/v1/livestock/{livestockId}/production` | LIVESTOCK_VIEW | Get history |
| PUT | `/v1/production/{id}` | LIVESTOCK_EDIT | Update |
| DELETE | `/v1/production/{id}` | LIVESTOCK_EDIT | Delete |

### Livestock Statuses
- `ACTIVE`
- `SICK`
- `SOLD`
- `DEAD`

### Service: `services/livestock.service.ts`

```ts
import api from '@/lib/api'

export const livestockService = {
  // --- Animals ---
  list: (farmId: number) =>
    api.get(`/v1/farms/${farmId}/livestock`).then((r) => r.data),

  getActive: (farmId: number) =>
    api.get(`/v1/farms/${farmId}/livestock/active`).then((r) => r.data),

  getById: (id: number) =>
    api.get(`/v1/livestock/${id}`).then((r) => r.data),

  create: (farmId: number, payload: {
    animalTypeId: number
    tagNumber?: string
    name?: string
    birthDate?: string
    weight?: number
    gender?: 'MALE' | 'FEMALE'
    parentId?: number
  }) => api.post(`/v1/farms/${farmId}/livestock`, payload).then((r) => r.data),

  update: (id: number, payload: object) =>
    api.put(`/v1/livestock/${id}`, payload).then((r) => r.data),

  getGenealogy: (id: number) =>
    api.get(`/v1/livestock/${id}/genealogy`).then((r) => r.data),

  changeStatus: (id: number, status: 'ACTIVE' | 'SICK' | 'SOLD' | 'DEAD') =>
    api.patch(`/v1/livestock/${id}/status`, { status }).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/v1/livestock/${id}`).then((r) => r.data),

  // --- Veterinary Care ---
  getVeterinaryCare: (livestockId: number) =>
    api.get(`/v1/livestock/${livestockId}/veterinary-care`).then((r) => r.data),

  addVeterinaryCare: (livestockId: number, payload: {
    type: string
    date: string
    description: string
    veterinarianName?: string
    cost?: number
    nextScheduledDate?: string
  }) => api.post(`/v1/livestock/${livestockId}/veterinary-care`, payload).then((r) => r.data),

  updateVeterinaryCare: (id: number, payload: object) =>
    api.put(`/v1/veterinary-care/${id}`, payload).then((r) => r.data),

  deleteVeterinaryCare: (id: number) =>
    api.delete(`/v1/veterinary-care/${id}`).then((r) => r.data),

  // --- Production ---
  getProduction: (livestockId: number) =>
    api.get(`/v1/livestock/${livestockId}/production`).then((r) => r.data),

  addProduction: (livestockId: number, payload: {
    productType: string
    quantity: number
    unit: string
    recordedDate: string
    notes?: string
  }) => api.post(`/v1/livestock/${livestockId}/production`, payload).then((r) => r.data),

  updateProduction: (id: number, payload: object) =>
    api.put(`/v1/production/${id}`, payload).then((r) => r.data),

  deleteProduction: (id: number) =>
    api.delete(`/v1/production/${id}`).then((r) => r.data),
}
```

---

## STEP 10 — Inventory Module

### Endpoints Reference

**Inventory Items** (`/inventory/items`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/inventory/items` | INVENTORY_ITEM_CREATE | Create item |
| GET | `/inventory/items/{id}` | INVENTORY_ITEM_VIEW | Get item |
| GET | `/inventory/items/farm/{farmId}` | INVENTORY_ITEM_VIEW | List by farm |
| GET | `/inventory/items/farm/{farmId}/low-stock` | INVENTORY_ITEM_VIEW | Get low stock |
| GET | `/inventory/items/farm/{farmId}/needs-reorder` | INVENTORY_ITEM_VIEW | Get reorder items |
| GET | `/inventory/items/search` | INVENTORY_ITEM_VIEW | Search |
| PUT | `/inventory/items/{id}` | INVENTORY_ITEM_UPDATE | Update |
| DELETE | `/inventory/items/{id}` | INVENTORY_ITEM_DELETE | Delete |

**Stock Movements** (`/inventory/movements`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/inventory/movements` | INVENTORY_MOVEMENT_CREATE | Create movement |
| GET | `/inventory/movements/{id}` | INVENTORY_MOVEMENT_VIEW | Get movement |
| GET | `/inventory/movements/item/{inventoryItemId}` | INVENTORY_MOVEMENT_VIEW | Get by item |
| GET | `/inventory/movements/type/{movementType}` | INVENTORY_MOVEMENT_VIEW | Get by type |
| GET | `/inventory/movements/date-range` | INVENTORY_MOVEMENT_VIEW | Get by date range |
| DELETE | `/inventory/movements/{id}` | INVENTORY_MOVEMENT_DELETE | Delete |

### Movement Types
- `IN` — Stock entry
- `OUT` — Stock exit
- `ADJUSTMENT` — Manual adjustment

### Service: `services/inventory.service.ts`

```ts
import api from '@/lib/api'

export const inventoryService = {
  // --- Items ---
  listItems: (farmId: number) =>
    api.get(`/inventory/items/farm/${farmId}`).then((r) => r.data),

  getItem: (id: number) =>
    api.get(`/inventory/items/${id}`).then((r) => r.data),

  getLowStock: (farmId: number) =>
    api.get(`/inventory/items/farm/${farmId}/low-stock`).then((r) => r.data),

  getNeedsReorder: (farmId: number) =>
    api.get(`/inventory/items/farm/${farmId}/needs-reorder`).then((r) => r.data),

  searchItems: (keyword: string) =>
    api.get('/inventory/items/search', { params: { keyword } }).then((r) => r.data),

  createItem: (payload: {
    farmId: number
    name: string
    category: string
    unit: string
    currentStock: number
    minimumStock?: number
    reorderPoint?: number
    unitPrice?: number
  }) => api.post('/inventory/items', payload).then((r) => r.data),

  updateItem: (id: number, payload: object) =>
    api.put(`/inventory/items/${id}`, payload).then((r) => r.data),

  deleteItem: (id: number) =>
    api.delete(`/inventory/items/${id}`).then((r) => r.data),

  // --- Stock Movements ---
  createMovement: (payload: {
    inventoryItemId: number
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
    quantity: number
    unitPrice?: number
    notes?: string
    referenceId?: string
  }) => api.post('/inventory/movements', payload).then((r) => r.data),

  listMovementsByItem: (itemId: number) =>
    api.get(`/inventory/movements/item/${itemId}`).then((r) => r.data),

  listMovementsByType: (type: string) =>
    api.get(`/inventory/movements/type/${type}`).then((r) => r.data),

  listMovementsByDateRange: (startDate: string, endDate: string) =>
    api.get('/inventory/movements/date-range', {
      params: { startDate, endDate },
    }).then((r) => r.data),

  deleteMovement: (id: number) =>
    api.delete(`/inventory/movements/${id}`).then((r) => r.data),
}
```

---

## STEP 11 — HR Module

### Endpoints Reference

**Employees** (`/hr/employees`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/hr/employees` | HR_EMPLOYEE_CREATE | Create employee |
| GET | `/hr/employees/{id}` | HR_EMPLOYEE_VIEW | Get employee |
| GET | `/hr/employees/farm/{farmId}` | HR_EMPLOYEE_VIEW | List by farm |
| GET | `/hr/employees/farm/{farmId}/active` | HR_EMPLOYEE_VIEW | Get active |
| PUT | `/hr/employees/{id}` | HR_EMPLOYEE_UPDATE | Update |
| DELETE | `/hr/employees/{id}` | HR_EMPLOYEE_DELETE | Delete |

**Attendance** (`/hr/attendance`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/hr/attendance` | HR_ATTENDANCE_CREATE | Record attendance |
| GET | `/hr/attendance/{id}` | HR_ATTENDANCE_VIEW | Get record |

**Tasks** (`/hr/tasks`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/hr/tasks` | HR_TASK_CREATE | Create task |
| GET | `/hr/tasks/{id}` | HR_TASK_VIEW | Get task |

### Attendance Statuses
- `PRESENT`
- `ABSENT`
- `LATE`
- `HALF_DAY`

### Task Priorities
- `LOW`
- `MEDIUM`
- `HIGH`

### Service: `services/hr.service.ts`

```ts
import api from '@/lib/api'

export const hrService = {
  // --- Employees ---
  listEmployees: (farmId: number) =>
    api.get(`/hr/employees/farm/${farmId}`).then((r) => r.data),

  getActiveEmployees: (farmId: number) =>
    api.get(`/hr/employees/farm/${farmId}/active`).then((r) => r.data),

  getEmployee: (id: number) =>
    api.get(`/hr/employees/${id}`).then((r) => r.data),

  createEmployee: (payload: {
    farmId: number
    firstName: string
    lastName: string
    phoneNumber?: string
    position?: string
    salary?: number
    hireDate?: string
    contractType?: string
  }) => api.post('/hr/employees', payload).then((r) => r.data),

  updateEmployee: (id: number, payload: object) =>
    api.put(`/hr/employees/${id}`, payload).then((r) => r.data),

  deleteEmployee: (id: number) =>
    api.delete(`/hr/employees/${id}`).then((r) => r.data),

  // --- Attendance ---
  recordAttendance: (payload: {
    employeeId: number
    date: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'
    checkInTime?: string
    checkOutTime?: string
    notes?: string
  }) => api.post('/hr/attendance', payload).then((r) => r.data),

  getAttendance: (id: number) =>
    api.get(`/hr/attendance/${id}`).then((r) => r.data),

  // --- Tasks ---
  createTask: (payload: {
    employeeId: number
    farmId: number
    title: string
    description?: string
    dueDate: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    cultivationId?: number
    livestockId?: number
  }) => api.post('/hr/tasks', payload).then((r) => r.data),

  getTask: (id: number) =>
    api.get(`/hr/tasks/${id}`).then((r) => r.data),
}
```

---

## STEP 12 — Marketplace Module

### Endpoints Reference

**Customers** (`/marketplace/customers`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/marketplace/customers` | CUSTOMERS_CREATE | Create customer |
| GET | `/marketplace/customers/{id}` | CUSTOMERS_VIEW | Get customer |
| GET | `/marketplace/customers/farm/{farmId}` | CUSTOMERS_VIEW | List by farm |

**Products** (`/marketplace/products`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/marketplace/products` | PRODUCTS_CREATE | Create product |
| GET | `/marketplace/products/{id}` | PRODUCTS_VIEW | Get product |
| GET | `/marketplace/products/farm/{farmId}` | PRODUCTS_VIEW | List by farm |

**Orders** (`/marketplace/orders`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/marketplace/orders` | ORDERS_CREATE | Create order |
| GET | `/marketplace/orders/{id}` | ORDERS_VIEW | Get order |
| GET | `/marketplace/orders/farm/{farmId}` | ORDERS_VIEW | List by farm |
| GET | `/marketplace/orders/customer/{customerId}` | ORDERS_VIEW | Get by customer |
| GET | `/marketplace/orders/farm/{farmId}/status/{status}` | ORDERS_VIEW | Get by status |
| GET | `/marketplace/orders/farm/{farmId}/payment-status/{paymentStatus}` | ORDERS_VIEW | Get by payment status |
| GET | `/marketplace/orders/farm/{farmId}/date-range` | ORDERS_VIEW | Get by date range |
| GET | `/marketplace/orders/farm/{farmId}/pending-approval` | ORDERS_VIEW | Get pending |
| GET | `/marketplace/orders/farm/{farmId}/overdue-deliveries` | ORDERS_VIEW | Get overdue |
| GET | `/marketplace/orders/farm/{farmId}/revenue` | ORDERS_VIEW | Get revenue |
| PUT | `/marketplace/orders/{id}` | ORDERS_EDIT | Update |
| PUT | `/marketplace/orders/{id}/status` | ORDERS_EDIT | Update status |
| DELETE | `/marketplace/orders/{id}` | ORDERS_DELETE | Delete |

### Order Statuses
- `PENDING`
- `APPROVED`
- `PREPARING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

### Payment Statuses
- `UNPAID`
- `PARTIAL`
- `PAID`

### Service: `services/marketplace.service.ts`

```ts
import api from '@/lib/api'

export const marketplaceService = {
  // --- Customers ---
  listCustomers: (farmId: number) =>
    api.get(`/marketplace/customers/farm/${farmId}`).then((r) => r.data),

  getCustomer: (id: number) =>
    api.get(`/marketplace/customers/${id}`).then((r) => r.data),

  createCustomer: (payload: {
    farmId: number
    firstName: string
    lastName: string
    phoneNumber?: string
    email?: string
    address?: string
    type?: string
  }) => api.post('/marketplace/customers', payload).then((r) => r.data),

  // --- Products ---
  listProducts: (farmId: number) =>
    api.get(`/marketplace/products/farm/${farmId}`).then((r) => r.data),

  getProduct: (id: number) =>
    api.get(`/marketplace/products/${id}`).then((r) => r.data),

  createProduct: (payload: {
    farmId: number
    name: string
    category?: string
    unit: string
    price: number
    availableStock?: number
  }) => api.post('/marketplace/products', payload).then((r) => r.data),

  // --- Orders ---
  listOrders: (farmId: number) =>
    api.get(`/marketplace/orders/farm/${farmId}`).then((r) => r.data),

  getOrder: (id: number) =>
    api.get(`/marketplace/orders/${id}`).then((r) => r.data),

  getOrdersByStatus: (farmId: number, status: string) =>
    api.get(`/marketplace/orders/farm/${farmId}/status/${status}`).then((r) => r.data),

  getOrdersByPaymentStatus: (farmId: number, paymentStatus: string) =>
    api
      .get(`/marketplace/orders/farm/${farmId}/payment-status/${paymentStatus}`)
      .then((r) => r.data),

  getPendingOrders: (farmId: number) =>
    api.get(`/marketplace/orders/farm/${farmId}/pending-approval`).then((r) => r.data),

  getOverdueDeliveries: (farmId: number) =>
    api.get(`/marketplace/orders/farm/${farmId}/overdue-deliveries`).then((r) => r.data),

  getOrdersByDateRange: (farmId: number, startDate: string, endDate: string) =>
    api
      .get(`/marketplace/orders/farm/${farmId}/date-range`, {
        params: { startDate, endDate },
      })
      .then((r) => r.data),

  getRevenue: (farmId: number, startDate: string, endDate: string) =>
    api
      .get(`/marketplace/orders/farm/${farmId}/revenue`, {
        params: { startDate, endDate },
      })
      .then((r) => r.data),

  createOrder: (payload: {
    farmId: number
    customerId: number
    items: { productId: number; quantity: number; unitPrice: number }[]
    deliveryDate?: string
    notes?: string
  }) => api.post('/marketplace/orders', payload).then((r) => r.data),

  updateOrder: (id: number, payload: object) =>
    api.put(`/marketplace/orders/${id}`, payload).then((r) => r.data),

  updateOrderStatus: (id: number, status: string) =>
    api.put(`/marketplace/orders/${id}/status`, { status }).then((r) => r.data),

  deleteOrder: (id: number) =>
    api.delete(`/marketplace/orders/${id}`).then((r) => r.data),
}
```

---

## STEP 13 — Notifications Module

### Endpoints Reference

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| GET | `/v1/notifications` | NOTIFICATIONS_VIEW | List notifications |
| GET | `/v1/notifications/unread` | NOTIFICATIONS_VIEW | Get unread |
| GET | `/v1/notifications/unread-count` | NOTIFICATIONS_VIEW | Count unread |
| GET | `/v1/notifications/{id}` | NOTIFICATIONS_VIEW | Get notification |
| PUT | `/v1/notifications/{id}/read` | NOTIFICATIONS_VIEW | Mark as read |
| PUT | `/v1/notifications/mark-all-read` | NOTIFICATIONS_VIEW | Mark all read |
| DELETE | `/v1/notifications/{id}` | NOTIFICATIONS_VIEW | Delete |
| POST | `/v1/notifications/send` | NOTIFICATIONS_CREATE | Send custom notification |
| GET | `/v1/notifications/stats` | NOTIFICATIONS_VIEW | Get statistics |

### Service: `services/notifications.service.ts`

```ts
import api from '@/lib/api'

export const notificationsService = {
  list: () => api.get('/v1/notifications').then((r) => r.data),

  getUnread: () => api.get('/v1/notifications/unread').then((r) => r.data),

  getUnreadCount: () =>
    api.get('/v1/notifications/unread-count').then((r) => r.data),

  getById: (id: number) =>
    api.get(`/v1/notifications/${id}`).then((r) => r.data),

  markRead: (id: number) =>
    api.put(`/v1/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.put('/v1/notifications/mark-all-read').then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/v1/notifications/${id}`).then((r) => r.data),

  send: (payload: {
    userId: number
    title: string
    message: string
    type?: string
  }) => api.post('/v1/notifications/send', payload).then((r) => r.data),

  getStats: () =>
    api.get('/v1/notifications/stats').then((r) => r.data),
}
```

### Notification Bell Component: `components/NotificationBell.tsx`

```tsx
'use client'
import { useEffect, useState } from 'react'
import { notificationsService } from '@/services/notifications.service'

export function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  const fetchCount = () =>
    notificationsService.getUnreadCount().then((res) => {
      if (res.success) setCount(res.data)
    })

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleOpen = async () => {
    setOpen((prev) => !prev)
    if (!open) {
      const res = await notificationsService.getUnread()
      if (res.success) setNotifications(res.data)
    }
  }

  const handleMarkRead = async (id: number) => {
    await notificationsService.markRead(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setCount((c) => Math.max(0, c - 1))
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative">
        <span className="text-2xl">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold">Notifications</span>
            <button
              className="text-xs text-blue-500"
              onClick={() => notificationsService.markAllRead().then(() => { setCount(0); setNotifications([]) })}
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-4 text-center text-gray-400">No unread notifications</li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className="p-3 border-b hover:bg-gray-50 flex justify-between">
                  <div>
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </div>
                  <button
                    className="text-xs text-green-500 ml-2"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    ✓
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
```

---

## STEP 14 — Users & Roles Module

### Endpoints Reference

**Users** (`/v1/users`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/users` | USERS_CREATE | Create user |
| GET | `/v1/users/{id}` | USERS_VIEW | Get by ID |
| GET | `/v1/users/phone/{phoneNumber}` | USERS_VIEW | Get by phone |
| GET | `/v1/users/code/{code}` | USERS_VIEW | Get by code |
| GET | `/v1/users` | USERS_LIST | List all (paginated) |
| GET | `/v1/users/status/{status}` | USERS_LIST | Get by status |
| GET | `/v1/users/search` | USERS_SEARCH | Search |
| PUT | `/v1/users/{id}` | USERS_EDIT | Update |
| PATCH | `/v1/users/{id}/status` | USERS_CHANGE_STATUS | Change status |
| DELETE | `/v1/users/{id}` | USERS_DELETE | Delete |

**Farm Access**

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/users/{userId}/farms/{farmId}/access` | USER_FARM_ACCESS_GRANT | Grant access |
| GET | `/v1/users/{userId}/farms` | USER_FARM_ACCESS_VIEW | Get user's farms |
| PUT | `/v1/users/{userId}/farms/{farmId}/access` | USER_FARM_ACCESS_EDIT | Update access |
| PATCH | `/v1/users/{userId}/farms/{farmId}/revoke` | USER_FARM_ACCESS_REVOKE | Revoke access |
| PATCH | `/v1/users/{userId}/farms/{farmId}/set-primary` | USER_FARM_ACCESS_EDIT | Set primary farm |

**Roles** (`/v1/roles`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/roles` | ROLES_CREATE | Create role |
| GET | `/v1/roles/{id}` | ROLES_VIEW | Get role |
| GET | `/v1/roles/code/{code}` | ROLES_VIEW | Get by code |
| GET | `/v1/roles` | ROLES_LIST | List all |
| GET | `/v1/roles/system` | ROLES_LIST | Get system roles |
| GET | `/v1/roles/search` | ROLES_SEARCH | Search |
| PUT | `/v1/roles/{id}` | ROLES_EDIT | Update |
| POST | `/v1/roles/{id}/permissions` | ROLES_EDIT | Add permissions |
| DELETE | `/v1/roles/{id}` | ROLES_DELETE | Delete |

**Permissions** (`/v1/permissions`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| GET | `/v1/permissions/{id}` | PERMISSIONS_VIEW | Get permission |
| GET | `/v1/permissions/code/{code}` | PERMISSIONS_VIEW | Get by code |
| GET | `/v1/permissions` | PERMISSIONS_LIST | List all |
| GET | `/v1/permissions/module/{module}` | PERMISSIONS_LIST_BY_MODULE | Get by module |
| GET | `/v1/permissions/search` | PERMISSIONS_SEARCH | Search |
| PUT | `/v1/permissions/{id}` | PERMISSIONS_EDIT | Update |
| DELETE | `/v1/permissions/{id}` | PERMISSIONS_DELETE | Delete |

### Service: `services/users.service.ts`

```ts
import api from '@/lib/api'

export const usersService = {
  list: (page = 0, size = 10) =>
    api.get('/v1/users', { params: { page, size } }).then((r) => r.data),

  getById: (id: number) =>
    api.get(`/v1/users/${id}`).then((r) => r.data),

  getByPhone: (phoneNumber: string) =>
    api.get(`/v1/users/phone/${phoneNumber}`).then((r) => r.data),

  create: (payload: {
    phoneNumber: string
    firstName: string
    lastName: string
    email?: string
    password: string
    roleIds?: number[]
  }) => api.post('/v1/users', payload).then((r) => r.data),

  update: (id: number, payload: object) =>
    api.put(`/v1/users/${id}`, payload).then((r) => r.data),

  changeStatus: (id: number, status: string) =>
    api.patch(`/v1/users/${id}/status`, { status }).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/v1/users/${id}`).then((r) => r.data),

  search: (keyword: string) =>
    api.get('/v1/users/search', { params: { keyword } }).then((r) => r.data),

  grantFarmAccess: (userId: number, farmId: number, payload: {
    accessLevel: string
    isPrimary?: boolean
  }) => api.post(`/v1/users/${userId}/farms/${farmId}/access`, payload).then((r) => r.data),

  getUserFarms: (userId: number) =>
    api.get(`/v1/users/${userId}/farms`).then((r) => r.data),

  revokeFarmAccess: (userId: number, farmId: number) =>
    api.patch(`/v1/users/${userId}/farms/${farmId}/revoke`).then((r) => r.data),

  setPrimaryFarm: (userId: number, farmId: number) =>
    api.patch(`/v1/users/${userId}/farms/${farmId}/set-primary`).then((r) => r.data),
}

export const rolesService = {
  list: () =>
    api.get('/v1/roles').then((r) => r.data),

  getSystemRoles: () =>
    api.get('/v1/roles/system').then((r) => r.data),

  getById: (id: number) =>
    api.get(`/v1/roles/${id}`).then((r) => r.data),

  create: (payload: {
    name: string
    code: string
    description?: string
    level?: number
  }) => api.post('/v1/roles', payload).then((r) => r.data),

  update: (id: number, payload: object) =>
    api.put(`/v1/roles/${id}`, payload).then((r) => r.data),

  addPermissions: (roleId: number, permissionIds: number[]) =>
    api.post(`/v1/roles/${roleId}/permissions`, { permissionIds }).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/v1/roles/${id}`).then((r) => r.data),

  search: (keyword: string) =>
    api.get('/v1/roles/search', { params: { keyword } }).then((r) => r.data),
}

export const permissionsService = {
  list: () =>
    api.get('/v1/permissions').then((r) => r.data),

  getById: (id: number) =>
    api.get(`/v1/permissions/${id}`).then((r) => r.data),

  listByModule: (module: string) =>
    api.get(`/v1/permissions/module/${module}`).then((r) => r.data),

  search: (keyword: string) =>
    api.get('/v1/permissions/search', { params: { keyword } }).then((r) => r.data),

  update: (id: number, payload: object) =>
    api.put(`/v1/permissions/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/v1/permissions/${id}`).then((r) => r.data),
}
```

---

## STEP 15 — Permission Guard Component

Create `components/PermissionGuard.tsx`:

```tsx
'use client'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: Props) {
  const { hasPermission } = useAuthStore()
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}
```

### Permission Constants Reference

| Module | Sample Permissions |
|--------|-------------------|
| Users | `USERS_CREATE`, `USERS_VIEW`, `USERS_EDIT`, `USERS_DELETE`, `USERS_LIST` |
| Farms | `FARMS_CREATE`, `FARMS_VIEW`, `FARMS_EDIT`, `FARMS_DELETE`, `FARMS_LIST`, `FARMS_VIEW_STATS` |
| Organizations | `ORGANIZATIONS_CREATE`, `ORGANIZATIONS_VIEW`, `ORGANIZATIONS_EDIT`, `ORGANIZATIONS_LIST` |
| Crops | `PARCELS_CREATE`, `PARCELS_VIEW`, `CULTIVATIONS_CREATE`, `CULTIVATIONS_VIEW` |
| Livestock | `LIVESTOCK_CREATE`, `LIVESTOCK_VIEW`, `LIVESTOCK_EDIT`, `LIVESTOCK_DELETE` |
| Inventory | `INVENTORY_ITEM_CREATE`, `INVENTORY_ITEM_VIEW`, `INVENTORY_MOVEMENT_CREATE` |
| HR | `HR_EMPLOYEE_CREATE`, `HR_EMPLOYEE_VIEW`, `HR_ATTENDANCE_CREATE`, `HR_TASK_CREATE` |
| Marketplace | `ORDERS_CREATE`, `ORDERS_VIEW`, `ORDERS_EDIT`, `PRODUCTS_CREATE`, `CUSTOMERS_CREATE` |
| Notifications | `NOTIFICATIONS_VIEW`, `NOTIFICATIONS_CREATE` |
| Roles | `ROLES_CREATE`, `ROLES_VIEW`, `ROLES_EDIT`, `ROLES_DELETE` |
| Permissions | `PERMISSIONS_VIEW`, `PERMISSIONS_EDIT`, `PERMISSIONS_LIST` |

### Usage Example

```tsx
import { PermissionGuard } from '@/components/PermissionGuard'

export default function FarmsPage() {
  return (
    <div>
      <h1>Farms</h1>
      <PermissionGuard permission="FARMS_CREATE">
        <button>Create Farm</button>
      </PermissionGuard>
      <PermissionGuard permission="FARMS_DELETE" fallback={<p>No delete access</p>}>
        <button className="text-red-500">Delete Farm</button>
      </PermissionGuard>
    </div>
  )
}
```

---

## STEP 16 — Organizations Module

### Endpoints Reference

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/organizations` | ORGANIZATIONS_CREATE | Create |
| GET | `/v1/organizations/{id}` | ORGANIZATIONS_VIEW | Get by ID |
| GET | `/v1/organizations/code/{code}` | ORGANIZATIONS_VIEW | Get by code |
| GET | `/v1/organizations` | ORGANIZATIONS_LIST | List all (paginated) |
| GET | `/v1/organizations/status/{status}` | ORGANIZATIONS_LIST | Get by status |
| GET | `/v1/organizations/type/{type}` | ORGANIZATIONS_LIST | Get by type |
| GET | `/v1/organizations/search` | ORGANIZATIONS_SEARCH | Search |
| PUT | `/v1/organizations/{id}` | ORGANIZATIONS_EDIT | Update |
| PATCH | `/v1/organizations/{id}/status` | ORGANIZATIONS_CHANGE_STATUS | Change status |
| DELETE | `/v1/organizations/{id}` | ORGANIZATIONS_DELETE | Delete |
| GET | `/v1/organizations/stats/count-by-status` | ORGANIZATIONS_VIEW_STATS | Count stats |

### Organization Types
- `COOPERATIVE`
- `GROUPEMENT`
- `ENTREPRISE`
- `ONG`

### Organization Statuses
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`

### Service: `services/organizations.service.ts`

```ts
import api from '@/lib/api'

export const organizationsService = {
  list: (page = 0, size = 10) =>
    api.get('/v1/organizations', { params: { page, size } }).then((r) => r.data),

  getById: (id: number) =>
    api.get(`/v1/organizations/${id}`).then((r) => r.data),

  getByCode: (code: string) =>
    api.get(`/v1/organizations/code/${code}`).then((r) => r.data),

  getByStatus: (status: string) =>
    api.get(`/v1/organizations/status/${status}`).then((r) => r.data),

  getByType: (type: 'COOPERATIVE' | 'GROUPEMENT' | 'ENTREPRISE' | 'ONG') =>
    api.get(`/v1/organizations/type/${type}`).then((r) => r.data),

  create: (payload: {
    name: string
    type: string
    contacts?: string
    address?: string
  }) => api.post('/v1/organizations', payload).then((r) => r.data),

  update: (id: number, payload: object) =>
    api.put(`/v1/organizations/${id}`, payload).then((r) => r.data),

  changeStatus: (id: number, status: string) =>
    api.patch(`/v1/organizations/${id}/status`, { status }).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/v1/organizations/${id}`).then((r) => r.data),

  search: (keyword: string) =>
    api.get('/v1/organizations/search', { params: { keyword } }).then((r) => r.data),

  getStats: () =>
    api.get('/v1/organizations/stats/count-by-status').then((r) => r.data),
}
```

---

## STEP 17 — IoT Sensors Module

### Endpoints Reference

**Sensors** (`/v1/farms/{farmId}/iot-sensors`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/v1/farms/{farmId}/iot-sensors` | IOT_SENSORS_CREATE | Create sensor |
| GET | `/v1/farms/{farmId}/iot-sensors` | IOT_SENSORS_LIST | List sensors |
| GET | `/v1/farms/{farmId}/iot-sensors/{id}` | IOT_SENSORS_VIEW | Get sensor |
| PUT | `/v1/farms/{farmId}/iot-sensors/{id}` | IOT_SENSORS_EDIT | Update sensor |

**Readings** (`/iot/readings`)

| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| POST | `/iot/readings` | IOT_READINGS_CREATE | Create reading |
| GET | `/iot/readings/{id}` | IOT_READINGS_VIEW | Get reading |

### Service: `services/iot.service.ts`

```ts
import api from '@/lib/api'

export const iotService = {
  listSensors: (farmId: number) =>
    api.get(`/v1/farms/${farmId}/iot-sensors`).then((r) => r.data),

  getSensor: (farmId: number, sensorId: number) =>
    api.get(`/v1/farms/${farmId}/iot-sensors/${sensorId}`).then((r) => r.data),

  createSensor: (farmId: number, payload: {
    name: string
    type: string
    location?: string
    unit?: string
    isActive?: boolean
  }) => api.post(`/v1/farms/${farmId}/iot-sensors`, payload).then((r) => r.data),

  updateSensor: (farmId: number, sensorId: number, payload: object) =>
    api.put(`/v1/farms/${farmId}/iot-sensors/${sensorId}`, payload).then((r) => r.data),

  createReading: (payload: {
    sensorId: number
    value: number
    unit: string
    recordedAt: string
  }) => api.post('/iot/readings', payload).then((r) => r.data),

  getReading: (id: number) =>
    api.get(`/iot/readings/${id}`).then((r) => r.data),
}
```

---

## STEP 18 — App Layout with Navigation

Create `app/dashboard/layout.tsx`:

```tsx
import { AuthGuard } from '@/components/AuthGuard'
import { NotificationBell } from '@/components/NotificationBell'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Farms', href: '/dashboard/farms' },
  { label: 'Crops', href: '/dashboard/crops' },
  { label: 'Livestock', href: '/dashboard/livestock' },
  { label: 'Inventory', href: '/dashboard/inventory' },
  { label: 'HR', href: '/dashboard/hr' },
  { label: 'Marketplace', href: '/dashboard/marketplace' },
  { label: 'IoT Sensors', href: '/dashboard/iot' },
  { label: 'Organizations', href: '/dashboard/organizations' },
  { label: 'Users', href: '/dashboard/users' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <aside className="w-64 bg-green-900 text-white flex flex-col">
          <div className="p-4 text-xl font-bold border-b border-green-700">
            Farm Manager
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 rounded hover:bg-green-700 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto bg-gray-50">
          <header className="bg-white border-b px-6 py-3 flex justify-end items-center gap-4">
            <NotificationBell />
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
```

---

## STEP 19 — React Query Setup

### Provider: `providers/QueryProvider.tsx`

```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

### Update `app/layout.tsx`

```tsx
import { QueryProvider } from '@/providers/QueryProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
```

### Custom Hooks Example

Create `hooks/useFarms.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { farmsService } from '@/services/farms.service'

export function useFarms(page = 0, size = 10) {
  return useQuery({
    queryKey: ['farms', page, size],
    queryFn: () => farmsService.list(page, size),
    select: (res) => res.data,
  })
}

export function useFarm(id: number) {
  return useQuery({
    queryKey: ['farms', id],
    queryFn: () => farmsService.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  })
}

export function useCreateFarm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: object) => farmsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farms'] }),
  })
}

export function useUpdateFarm(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: object) => farmsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farms'] }),
  })
}
```

---

## STEP 20 — Error Handling Utility

Create `lib/handleError.ts`:

```ts
import { AxiosError } from 'axios'

export function handleError(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
```

### Usage in components:

```tsx
import { handleError } from '@/lib/handleError'

const handleSubmit = async () => {
  try {
    await farmsService.create(formData)
  } catch (e) {
    setError(handleError(e))
  }
}
```

---

## Summary — File Structure

```
farm-frontend/
├── app/
│   ├── layout.tsx                    # Root layout + QueryProvider
│   ├── login/
│   │   └── page.tsx                  # Login page
│   └── dashboard/
│       ├── layout.tsx                # Dashboard layout + AuthGuard + Sidebar
│       ├── page.tsx                  # Dashboard home
│       ├── farms/page.tsx
│       ├── crops/page.tsx
│       ├── livestock/page.tsx
│       ├── inventory/page.tsx
│       ├── hr/page.tsx
│       ├── marketplace/page.tsx
│       ├── iot/page.tsx
│       ├── organizations/page.tsx
│       └── users/page.tsx
├── components/
│   ├── AuthGuard.tsx                 # Redirect unauthenticated users
│   ├── PermissionGuard.tsx           # Conditionally render by permission
│   └── NotificationBell.tsx         # Live notification dropdown
├── hooks/
│   ├── useFarms.ts                   # React Query hooks for farms
│   └── ...                           # One file per module
├── lib/
│   ├── api.ts                        # Axios instance + interceptors
│   └── handleError.ts               # Centralized error handling
├── providers/
│   └── QueryProvider.tsx             # React Query client provider
├── services/
│   ├── auth.service.ts
│   ├── farms.service.ts
│   ├── crops.service.ts
│   ├── livestock.service.ts
│   ├── inventory.service.ts
│   ├── hr.service.ts
│   ├── marketplace.service.ts
│   ├── notifications.service.ts
│   ├── organizations.service.ts
│   ├── users.service.ts
│   └── iot.service.ts
├── store/
│   └── auth.store.ts                 # Zustand: auth state + permissions
├── types/
│   └── api.ts                        # Shared TypeScript types
└── .env.local                        # Environment variables
```

---

## Key Notes

| Topic | Detail |
|---|---|
| **Auth header** | `Authorization: Bearer <access_token>` on every request (auto-applied by interceptor) |
| **Token storage** | Access token in cookie (1h), Refresh token in cookie (30d) |
| **Auto-refresh** | Axios interceptor handles 401 → refresh → retry automatically |
| **Permissions** | Decoded from JWT payload, checked via `hasPermission()` in Zustand store |
| **Pagination** | All list endpoints accept `?page=0&size=10&sortBy=createdAt&sortDirection=DESC` |
| **Standard response** | All endpoints return `{ success, status, message, data }` |
| **API base paths** | Auth → `/v1/auth`, Inventory → `/inventory`, HR → `/hr`, Marketplace → `/marketplace`, IoT readings → `/iot`, others → `/v1` |
| **Public endpoints** | Only `/v1/auth/**` and Swagger endpoints are public — all others require JWT |
| **Permission format** | `{MODULE}_{RESOURCE}_{ACTION}` — e.g., `FARMS_CREATE`, `LIVESTOCK_VIEW` |
| **Geospatial** | Farm coordinates stored via PostGIS — pass as GeoJSON or WKT when creating farms |
| **Mobile sync** | Offline sync via `/api/sync/upload` and `/api/sync/download` endpoints |