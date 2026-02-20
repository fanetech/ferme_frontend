export const API_ENDPOINTS = {

  // ======================================
  // AUTH
  // ======================================
  auth: {
    login: '/v1/auth/login',
    logout: '/v1/auth/logout',
    logoutAll: '/v1/auth/logout-all',
    refresh: '/v1/auth/refresh',
    forgotPassword: '/v1/auth/forgot-password',
    resetPassword: '/v1/auth/reset-password',
    changePassword: '/v1/auth/change-password',
    pin: {
      set: '/v1/auth/pin/set',
      update: '/v1/auth/pin/update',
      remove: '/v1/auth/pin/remove',
    },
  },

  // ======================================
  // FARMS (Exploitations agricoles)
  // ======================================
  farms: {
    list: '/v1/farms',
    get: (id: string) => `/v1/farms/${id}`,
    create: '/v1/farms',
    update: (id: string) => `/v1/farms/${id}`,
    delete: (id: string) => `/v1/farms/${id}`,
    my: '/v1/farms/my',
    stats: (id: string) => `/v1/farms/${id}/stats`,
    plots: (farmId: string) => `/v1/farms/${farmId}/plots`,
    livestock: (farmId: string) => `/v1/farms/${farmId}/livestock`,
    employees: (farmId: string) => `/v1/farms/${farmId}/employees`,
    sensors: (farmId: string) => `/v1/farms/${farmId}/sensors`,
  },

  // ======================================
  // PARCELLES (Plots / Fields)
  // ======================================
  plots: {
    list: '/v1/plots',
    get: (id: string) => `/v1/plots/${id}`,
    create: '/v1/plots',
    update: (id: string) => `/v1/plots/${id}`,
    delete: (id: string) => `/v1/plots/${id}`,
    crops: (plotId: string) => `/v1/plots/${plotId}/crops`,
  },

  // ======================================
  // CULTURES (Crops)
  // ======================================
  crops: {
    list: '/v1/crops',
    get: (id: string) => `/v1/crops/${id}`,
    create: '/v1/crops',
    update: (id: string) => `/v1/crops/${id}`,
    delete: (id: string) => `/v1/crops/${id}`,
    varieties: '/v1/crop-varieties',
    seasons: '/v1/growing-seasons',
    harvests: {
      list: '/v1/harvests',
      get: (id: string) => `/v1/harvests/${id}`,
      create: '/v1/harvests',
      update: (id: string) => `/v1/harvests/${id}`,
      byCrop: (cropId: string) => `/v1/crops/${cropId}/harvests`,
    },
  },

  // ======================================
  // ÉLEVAGE (Livestock)
  // ======================================
  livestock: {
    list: '/v1/livestock',
    get: (id: string) => `/v1/livestock/${id}`,
    create: '/v1/livestock',
    update: (id: string) => `/v1/livestock/${id}`,
    delete: (id: string) => `/v1/livestock/${id}`,
    species: '/v1/animal-species',
    breeds: '/v1/animal-breeds',
    health: {
      records: (animalId: string) => `/v1/livestock/${animalId}/health-records`,
      vaccinations: (animalId: string) => `/v1/livestock/${animalId}/vaccinations`,
    },
    production: {
      records: (animalId: string) => `/v1/livestock/${animalId}/production`,
    },
  },

  // ======================================
  // INVENTAIRE (Inventory)
  // ======================================
  inventory: {
    list: '/v1/inventory',
    get: (id: string) => `/v1/inventory/${id}`,
    create: '/v1/inventory',
    update: (id: string) => `/v1/inventory/${id}`,
    delete: (id: string) => `/v1/inventory/${id}`,
    lowStock: '/v1/inventory/low-stock',
    valuation: '/v1/inventory/valuation',
    categories: '/v1/inventory-categories',
    movements: {
      list: '/v1/inventory-movements',
      create: '/v1/inventory-movements',
      byItem: (itemId: string) => `/v1/inventory/${itemId}/movements`,
    },
  },

  // ======================================
  // RH (Human Resources)
  // ======================================
  hr: {
    employees: {
      list: '/v1/employees',
      get: (id: string) => `/v1/employees/${id}`,
      create: '/v1/employees',
      update: (id: string) => `/v1/employees/${id}`,
      delete: (id: string) => `/v1/employees/${id}`,
    },
    attendance: {
      list: '/v1/attendance',
      create: '/v1/attendance',
      byEmployee: (empId: string) => `/v1/employees/${empId}/attendance`,
    },
    payroll: {
      list: '/v1/payroll',
      generate: '/v1/payroll/generate',
      byEmployee: (empId: string) => `/v1/employees/${empId}/payroll`,
    },
    tasks: {
      list: '/v1/tasks',
      get: (id: string) => `/v1/tasks/${id}`,
      create: '/v1/tasks',
      update: (id: string) => `/v1/tasks/${id}`,
      delete: (id: string) => `/v1/tasks/${id}`,
      assign: (id: string) => `/v1/tasks/${id}/assign`,
    },
  },

  // ======================================
  // FINANCE
  // ======================================
  finance: {
    transactions: {
      list: '/v1/transactions',
      get: (id: string) => `/v1/transactions/${id}`,
      create: '/v1/transactions',
      update: (id: string) => `/v1/transactions/${id}`,
      delete: (id: string) => `/v1/transactions/${id}`,
    },
    budgets: {
      list: '/v1/budgets',
      get: (id: string) => `/v1/budgets/${id}`,
      create: '/v1/budgets',
      update: (id: string) => `/v1/budgets/${id}`,
    },
    reports: {
      income: '/v1/finance/reports/income',
      expenses: '/v1/finance/reports/expenses',
      balance: '/v1/finance/reports/balance',
    },
  },

  // ======================================
  // MARCHÉ (Marketplace)
  // ======================================
  marketplace: {
    listings: {
      list: '/v1/listings',
      get: (id: string) => `/v1/listings/${id}`,
      create: '/v1/listings',
      update: (id: string) => `/v1/listings/${id}`,
      delete: (id: string) => `/v1/listings/${id}`,
      my: '/v1/listings/my',
    },
    orders: {
      list: '/v1/orders',
      get: (id: string) => `/v1/orders/${id}`,
      create: '/v1/orders',
      update: (id: string) => `/v1/orders/${id}`,
      confirm: (id: string) => `/v1/orders/${id}/confirm`,
      cancel: (id: string) => `/v1/orders/${id}/cancel`,
    },
  },

  // ======================================
  // MÉTÉO (Weather)
  // ======================================
  weather: {
    current: (farmId: string) => `/v1/weather/farm/${farmId}/current`,
    forecast: (farmId: string) => `/v1/weather/farm/${farmId}/forecast`,
    history: (farmId: string) => `/v1/weather/farm/${farmId}/history`,
    alerts: (farmId: string) => `/v1/weather/farm/${farmId}/alerts`,
  },

  // ======================================
  // IoT / CAPTEURS (Sensors)
  // ======================================
  iot: {
    sensors: {
      list: '/v1/sensors',
      get: (id: string) => `/v1/sensors/${id}`,
      create: '/v1/sensors',
      update: (id: string) => `/v1/sensors/${id}`,
      delete: (id: string) => `/v1/sensors/${id}`,
      data: (id: string) => `/v1/sensors/${id}/data`,
    },
    alerts: {
      list: '/v1/sensor-alerts',
      acknowledge: (id: string) => `/v1/sensor-alerts/${id}/acknowledge`,
    },
  },

  // ======================================
  // NOTIFICATIONS
  // ======================================
  notifications: {
    list: '/v1/notifications',
    markRead: (id: string) => `/v1/notifications/${id}/read`,
    markAllRead: '/v1/notifications/read-all',
    count: '/v1/notifications/unread-count',
    preferences: '/v1/notifications/preferences',
  },

  // ======================================
  // UTILISATEURS (Users)
  // ======================================
  users: {
    list: '/v1/users',
    get: (id: string) => `/v1/users/${id}`,
    create: '/v1/users',
    update: (id: string) => `/v1/users/${id}`,
    delete: (id: string) => `/v1/users/${id}`,
    activate: (id: string) => `/v1/users/${id}/activate`,
    deactivate: (id: string) => `/v1/users/${id}/deactivate`,
    roles: (id: string) => `/v1/users/${id}/roles`,
    permissions: (id: string) => `/v1/users/${id}/permissions`,
    profile: '/v1/users/me',
  },

  // ======================================
  // RÔLES (Roles)
  // ======================================
  roles: {
    list: '/v1/roles',
    get: (id: string) => `/v1/roles/${id}`,
    create: '/v1/roles',
    update: (id: string) => `/v1/roles/${id}`,
    delete: (id: string) => `/v1/roles/${id}`,
    permissions: (id: string) => `/v1/roles/${id}/permissions`,
  },
};
