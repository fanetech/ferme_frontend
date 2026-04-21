export const API_ENDPOINTS = {

  // ======================================
  // AUTH
  // ======================================
  auth: {
    register: '/v1/auth/register',
    login: '/v1/auth/login',
    refresh: '/v1/auth/refresh',
    logout: '/v1/auth/logout',
    logoutAll: '/v1/auth/logout-all',
    forgotPassword: '/v1/auth/forgot-password',
    resetPassword: '/v1/auth/reset-password',
    changePassword: '/v1/auth/change-password',
    health: '/v1/auth/health',
    pin: {
      set: '/v1/auth/pin/set',
      update: '/v1/auth/pin/update',
      remove: '/v1/auth/pin/remove',
    },
  },

  // ======================================
  // USERS
  // ======================================
  users: {
    list: '/v1/users',
    get: (id: string) => `/v1/users/${id}`,
    getByPhone: (phone: string) => `/v1/users/phone/${phone}`,
    getByCode: (code: string) => `/v1/users/code/${code}`,
    create: '/v1/users',
    update: (id: string) => `/v1/users/${id}`,
    delete: (id: string) => `/v1/users/${id}`,
    changeStatus: (id: string) => `/v1/users/${id}/status`,
    byStatus: (status: string) => `/v1/users/status/${status}`,
    search: '/v1/users/search',
    countByStatus: (status: string) => `/v1/users/count/status/${status}`,
    // Farm access
    farms: (userId: string) => `/v1/users/${userId}/farms`,
    farmAccess: (userId: string, farmId: string) => `/v1/users/${userId}/farms/${farmId}`,
    grantFarmAccess: (userId: string, farmId: string) => `/v1/users/${userId}/farms/${farmId}/access`,
    updateFarmAccess: (userId: string, farmId: string) => `/v1/users/${userId}/farms/${farmId}/access`,
    revokeFarmAccess: (userId: string, farmId: string) => `/v1/users/${userId}/farms/${farmId}/revoke`,
    deleteFarmAccess: (userId: string, farmId: string) => `/v1/users/${userId}/farms/${farmId}/access`,
    primaryFarm: (userId: string) => `/v1/users/${userId}/farms/primary`,
    setPrimaryFarm: (userId: string, farmId: string) => `/v1/users/${userId}/farms/${farmId}/set-primary`,
    farmCount: (userId: string) => `/v1/users/${userId}/farms/count`,
    // Organizations
    organizations: (userId: string) => `/v1/users/${userId}/organizations`,
    primaryOrganization: (userId: string) => `/v1/users/${userId}/organizations/primary`,
    setPrimaryOrganization: (userId: string, orgId: string) => `/v1/users/${userId}/organizations/${orgId}/set-primary`,
  },

  // ======================================
  // ROLES
  // ======================================
  roles: {
    list: '/v1/roles',
    get: (id: string) => `/v1/roles/${id}`,
    getByCode: (code: string) => `/v1/roles/code/${code}`,
    create: '/v1/roles',
    update: (id: string) => `/v1/roles/${id}`,
    delete: (id: string) => `/v1/roles/${id}`,
    system: '/v1/roles/system',
    search: '/v1/roles/search',
    addPermissions: (id: string) => `/v1/roles/${id}/permissions`,
  },

  // ======================================
  // PERMISSIONS
  // ======================================
  permissions: {
    list: '/v1/permissions',
    get: (id: string) => `/v1/permissions/${id}`,
    getByCode: (code: string) => `/v1/permissions/code/${code}`,
    update: (id: string) => `/v1/permissions/${id}`,
    delete: (id: string) => `/v1/permissions/${id}`,
    byModule: (module: string) => `/v1/permissions/module/${module}`,
    search: '/v1/permissions/search',
  },

  // ======================================
  // MODULES
  // ======================================
  modules: {
    list: '/v1/modules',
    get: (id: string) => `/v1/modules/${id}`,
    getByCode: (code: string) => `/v1/modules/code/${code}`,
    create: '/v1/modules',
    update: (id: string) => `/v1/modules/${id}`,
    delete: (id: string) => `/v1/modules/${id}`,
    active: '/v1/modules/active',
    system: '/v1/modules/system',
    search: '/v1/modules/search',
    assignPermissions: (id: string) => `/v1/modules/${id}/permissions`,
    removePermissions: (id: string) => `/v1/modules/${id}/permissions`,
    exists: (code: string) => `/v1/modules/exists/${code}`,
    countActive: '/v1/modules/count/active',
  },

  // ======================================
  // ORGANIZATIONS
  // ======================================
  organizations: {
    list: '/v1/organizations',
    get: (id: string) => `/v1/organizations/${id}`,
    getByCode: (code: string) => `/v1/organizations/code/${code}`,
    create: '/v1/organizations',
    update: (id: string) => `/v1/organizations/${id}`,
    delete: (id: string) => `/v1/organizations/${id}`,
    changeStatus: (id: string) => `/v1/organizations/${id}/status`,
    byStatus: (status: string) => `/v1/organizations/status/${status}`,
    byType: (type: string) => `/v1/organizations/type/${type}`,
    search: '/v1/organizations/search',
    byProvinceAndStatus: (province: string, status: string) => `/v1/organizations/province/${province}/status/${status}`,
    countByStatus: '/v1/organizations/stats/count-by-status',
    // Members
    members: (orgId: string) => `/v1/organizations/${orgId}/members`,
    member: (orgId: string, userId: string) => `/v1/organizations/${orgId}/members/${userId}`,
    removeMember: (orgId: string, userId: string) => `/v1/organizations/${orgId}/members/${userId}`,
    updateMemberRole: (orgId: string, userId: string) => `/v1/organizations/${orgId}/members/${userId}/role`,
    checkMembership: (orgId: string, userId: string) => `/v1/organizations/${orgId}/members/check/${userId}`,
    memberCount: (orgId: string) => `/v1/organizations/${orgId}/members/count`,
    admins: (orgId: string) => `/v1/organizations/${orgId}/admins`,
  },

  // ======================================
  // FARMS
  // ======================================
  farms: {
    list: '/v1/farms',
    get: (id: string) => `/v1/farms/${id}`,
    getByCode: (code: string) => `/v1/farms/code/${code}`,
    create: '/v1/farms',
    update: (id: string) => `/v1/farms/${id}`,
    delete: (id: string) => `/v1/farms/${id}`,
    changeStatus: (id: string) => `/v1/farms/${id}/status`,
    byStatus: (status: string) => `/v1/farms/status/${status}`,
    byType: (type: string) => `/v1/farms/type/${type}`,
    byOrganization: (orgId: string) => `/v1/farms/organization/${orgId}`,
    search: '/v1/farms/search',
    byProvinceAndStatus: (province: string, status: string) => `/v1/farms/province/${province}/status/${status}`,
    countByStatus: '/v1/farms/stats/count-by-status',
    countByOrganization: (orgId: string) => `/v1/farms/stats/count-by-organization/${orgId}`,
    statistics: (id: string) => `/v1/farms/${id}/statistics`,
  },

  // ======================================
  // CROP TYPES
  // ======================================
  cropTypes: {
    list: '/v1/crop-types',
    listAll: '/v1/crop-types/list',
    get: (id: string) => `/v1/crop-types/${id}`,
    create: '/v1/crop-types',
    update: (id: string) => `/v1/crop-types/${id}`,
    delete: (id: string) => `/v1/crop-types/${id}`,
    search: '/v1/crop-types/search',
    byFamily: (family: string) => `/v1/crop-types/family/${family}`,
    count: '/v1/crop-types/count',
  },

  // ======================================
  // PARCELS
  // ======================================
  parcels: {
    byFarm: (farmId: string) => `/v1/farms/${farmId}/parcels`,
    activByFarm: (farmId: string) => `/v1/farms/${farmId}/parcels/active`,
    countByFarm: (farmId: string) => `/v1/farms/${farmId}/parcels/count`,
    get: (id: string) => `/v1/parcels/${id}`,
    create: (farmId: string) => `/v1/farms/${farmId}/parcels`,
    update: (id: string) => `/v1/parcels/${id}`,
    changeStatus: (id: string) => `/v1/parcels/${id}/status`,
    delete: (id: string) => `/v1/parcels/${id}`,
  },

  // ======================================
  // CULTIVATIONS
  // ======================================
  cultivations: {
    byParcel: (parcelId: string) => `/v1/parcels/${parcelId}/cultivations`,
    byFarm: (farmId: string) => `/v1/farms/${farmId}/cultivations`,
    activeByFarm: (farmId: string) => `/v1/farms/${farmId}/cultivations/active`,
    byFarmAndYear: (farmId: string, year: number) => `/v1/farms/${farmId}/cultivations/year/${year}`,
    get: (id: string) => `/v1/cultivations/${id}`,
    create: (parcelId: string) => `/v1/parcels/${parcelId}/cultivations`,
    update: (id: string) => `/v1/cultivations/${id}`,
    changeStatus: (id: string) => `/v1/cultivations/${id}/status`,
    delete: (id: string) => `/v1/cultivations/${id}`,
    timeline: (id: string) => `/v1/cultivations/${id}/timeline`,
  },

  // ======================================
  // AGRICULTURAL ACTIVITIES
  // ======================================
  activities: {
    byCultivation: (cultivationId: string) => `/v1/cultivations/${cultivationId}/activities`,
    get: (id: string) => `/v1/activities/${id}`,
    create: (cultivationId: string) => `/v1/cultivations/${cultivationId}/activities`,
    update: (id: string) => `/v1/activities/${id}`,
    delete: (id: string) => `/v1/activities/${id}`,
  },

  // ======================================
  // ANIMAL TYPES
  // ======================================
  animalTypes: {
    list: '/v1/animal-types',
    listAll: '/v1/animal-types/list',
    get: (id: string) => `/v1/animal-types/${id}`,
    create: '/v1/animal-types',
    update: (id: string) => `/v1/animal-types/${id}`,
    delete: (id: string) => `/v1/animal-types/${id}`,
    byCategory: (category: string) => `/v1/animal-types/category/${category}`,
    search: '/v1/animal-types/search',
  },

  // ======================================
  // LIVESTOCK
  // ======================================
  livestock: {
    byFarm: (farmId: string) => `/v1/farms/${farmId}/livestock`,
    activeByFarm: (farmId: string) => `/v1/farms/${farmId}/livestock/active`,
    countByFarm: (farmId: string) => `/v1/farms/${farmId}/livestock/count`,
    get: (id: string) => `/v1/livestock/${id}`,
    create: (farmId: string) => `/v1/farms/${farmId}/livestock`,
    update: (id: string) => `/v1/livestock/${id}`,
    changeStatus: (id: string) => `/v1/livestock/${id}/status`,
    delete: (id: string) => `/v1/livestock/${id}`,
    genealogy: (id: string) => `/v1/livestock/${id}/genealogy`,
    // Veterinary care
    vetCare: (livestockId: string) => `/v1/livestock/${livestockId}/veterinary-care`,
    getVetCare: (id: string) => `/v1/veterinary-care/${id}`,
    updateVetCare: (id: string) => `/v1/veterinary-care/${id}`,
    deleteVetCare: (id: string) => `/v1/veterinary-care/${id}`,
    // Production
    production: (livestockId: string) => `/v1/livestock/${livestockId}/production`,
    getProduction: (id: string) => `/v1/production/${id}`,
    updateProduction: (id: string) => `/v1/production/${id}`,
    deleteProduction: (id: string) => `/v1/production/${id}`,
  },

  // ======================================
  // INVENTORY
  // ======================================
  inventory: {
    items: {
      byFarm: (farmId: string) => `/inventory/items/farm/${farmId}`,
      get: (id: string) => `/inventory/items/${id}`,
      create: '/inventory/items',
      update: (id: string) => `/inventory/items/${id}`,
      delete: (id: string) => `/inventory/items/${id}`,
      lowStock: (farmId: string) => `/inventory/items/farm/${farmId}/low-stock`,
      needsReorder: (farmId: string) => `/inventory/items/farm/${farmId}/needs-reorder`,
      search: '/inventory/items/search',
      count: (farmId: string) => `/inventory/items/farm/${farmId}/count`,
    },
    movements: {
      create: '/inventory/movements',
      get: (id: string) => `/inventory/movements/${id}`,
      byItem: (itemId: string) => `/inventory/movements/item/${itemId}`,
      byType: (type: string) => `/inventory/movements/type/${type}`,
      byDateRange: '/inventory/movements/date-range',
      delete: (id: string) => `/inventory/movements/${id}`,
    },
  },

  // ======================================
  // HR — EMPLOYEES
  // ======================================
  hr: {
    employees: {
      byFarm: (farmId: string) => `/hr/employees/farm/${farmId}`,
      activeByFarm: (farmId: string) => `/hr/employees/farm/${farmId}/active`,
      countByFarm: (farmId: string) => `/hr/employees/farm/${farmId}/count`,
      get: (id: string) => `/hr/employees/${id}`,
      create: '/hr/employees',
      update: (id: string) => `/hr/employees/${id}`,
      delete: (id: string) => `/hr/employees/${id}`,
    },
    tasks: {
      get: (id: string) => `/hr/tasks/${id}`,
      create: '/hr/tasks',
      update: (id: string) => `/hr/tasks/${id}`,
      delete: (id: string) => `/hr/tasks/${id}`,
      byEmployee: (empId: string) => `/hr/tasks/employee/${empId}`,
      byStatus: (status: string) => `/hr/tasks/status/${status}`,
      overdue: '/hr/tasks/overdue',
    },
    attendance: {
      get: (id: string) => `/hr/attendances/${id}`,
      create: '/hr/attendances',
      update: (id: string) => `/hr/attendances/${id}`,
      delete: (id: string) => `/hr/attendances/${id}`,
      byEmployee: (empId: string) => `/hr/attendances/employee/${empId}`,
      byDateRange: '/hr/attendances/date-range',
    },
  },

  // ======================================
  // MARKETPLACE
  // ======================================
  marketplace: {
    customers: {
      byFarm: (farmId: string) => `/marketplace/customers/farm/${farmId}`,
      activeByFarm: (farmId: string) => `/marketplace/customers/farm/${farmId}/active`,
      byType: (farmId: string, type: string) => `/marketplace/customers/farm/${farmId}/type/${type}`,
      search: (farmId: string) => `/marketplace/customers/farm/${farmId}/search`,
      creditLimit: (farmId: string) => `/marketplace/customers/farm/${farmId}/credit-limit`,
      topRevenue: (farmId: string) => `/marketplace/customers/farm/${farmId}/top-revenue`,
      count: (farmId: string) => `/marketplace/customers/farm/${farmId}/count`,
      get: (id: string) => `/marketplace/customers/${id}`,
      create: '/marketplace/customers',
      update: (id: string) => `/marketplace/customers/${id}`,
      delete: (id: string) => `/marketplace/customers/${id}`,
    },
    products: {
      byFarm: (farmId: string) => `/marketplace/products/farm/${farmId}`,
      available: (farmId: string) => `/marketplace/products/farm/${farmId}/available`,
      byType: (farmId: string, type: string) => `/marketplace/products/farm/${farmId}/type/${type}`,
      search: (farmId: string) => `/marketplace/products/farm/${farmId}/search`,
      expiring: (farmId: string) => `/marketplace/products/farm/${farmId}/expiring`,
      lowStock: (farmId: string) => `/marketplace/products/farm/${farmId}/low-stock`,
      inventoryValue: (farmId: string) => `/marketplace/products/farm/${farmId}/inventory-value`,
      count: (farmId: string) => `/marketplace/products/farm/${farmId}/count`,
      get: (id: string) => `/marketplace/products/${id}`,
      create: '/marketplace/products',
      update: (id: string) => `/marketplace/products/${id}`,
      delete: (id: string) => `/marketplace/products/${id}`,
    },
    orders: {
      byFarm: (farmId: string) => `/marketplace/orders/farm/${farmId}`,
      byCustomer: (customerId: string) => `/marketplace/orders/customer/${customerId}`,
      byStatus: (farmId: string, status: string) => `/marketplace/orders/farm/${farmId}/status/${status}`,
      byPaymentStatus: (farmId: string, ps: string) => `/marketplace/orders/farm/${farmId}/payment-status/${ps}`,
      byDateRange: (farmId: string) => `/marketplace/orders/farm/${farmId}/date-range`,
      search: (farmId: string) => `/marketplace/orders/farm/${farmId}/search`,
      pendingApproval: (farmId: string) => `/marketplace/orders/farm/${farmId}/pending-approval`,
      overdueDeliveries: (farmId: string) => `/marketplace/orders/farm/${farmId}/overdue-deliveries`,
      revenue: (farmId: string) => `/marketplace/orders/farm/${farmId}/revenue`,
      count: (farmId: string) => `/marketplace/orders/farm/${farmId}/count`,
      averageValue: (farmId: string) => `/marketplace/orders/farm/${farmId}/average-value`,
      get: (id: string) => `/marketplace/orders/${id}`,
      create: '/marketplace/orders',
      update: (id: string) => `/marketplace/orders/${id}`,
      updateStatus: (id: string) => `/marketplace/orders/${id}/status`,
      delete: (id: string) => `/marketplace/orders/${id}`,
    },
  },

  // ======================================
  // IOT SENSORS
  // ======================================
  iot: {
    sensors: {
      byFarm: (farmId: string) => `/v1/farms/${farmId}/iot-sensors`,
      get: (farmId: string, id: string) => `/v1/farms/${farmId}/iot-sensors/${id}`,
      create: (farmId: string) => `/v1/farms/${farmId}/iot-sensors`,
      update: (farmId: string, id: string) => `/v1/farms/${farmId}/iot-sensors/${id}`,
      delete: (farmId: string, id: string) => `/v1/farms/${farmId}/iot-sensors/${id}`,
      changeStatus: (farmId: string, id: string) => `/v1/farms/${farmId}/iot-sensors/${id}/status`,
      lowBattery: (farmId: string) => `/v1/farms/${farmId}/iot-sensors/low-battery`,
      needsCalibration: (farmId: string) => `/v1/farms/${farmId}/iot-sensors/needs-calibration`,
      byType: (farmId: string) => `/v1/farms/${farmId}/iot-sensors/by-type`,
    },
    readings: {
      bySensor: (sensorId: string) => `/v1/iot-sensors/${sensorId}/readings`,
      create: (sensorId: string) => `/v1/iot-sensors/${sensorId}/readings`,
      latest: (sensorId: string) => `/v1/iot-sensors/${sensorId}/readings/latest`,
      statistics: (sensorId: string) => `/v1/iot-sensors/${sensorId}/readings/statistics`,
      anomalies: (farmId: string) => `/v1/farms/${farmId}/iot-readings/anomalies`,
      delete: (id: string) => `/v1/iot-readings/${id}`,
    },
    weather: {
      current: (farmId: string) => `/v1/farms/${farmId}/weather/current`,
      history: (farmId: string) => `/v1/farms/${farmId}/weather/history`,
      forecast: (farmId: string) => `/v1/farms/${farmId}/weather/forecast`,
    },
  },

  // ======================================
  // NOTIFICATIONS
  // ======================================
  notifications: {
    list: '/v1/notifications',
    unread: '/v1/notifications/unread',
    unreadCount: '/v1/notifications/unread-count',
    get: (id: string) => `/v1/notifications/${id}`,
    markRead: (id: string) => `/v1/notifications/${id}/read`,
    markAllRead: '/v1/notifications/mark-all-read',
    delete: (id: string) => `/v1/notifications/${id}`,
    send: '/v1/notifications/send',
    stats: '/v1/notifications/stats',
  },

  // ======================================
  // ALERT RULES
  // ======================================
  alertRules: {
    byFarm: (farmId: string) => `/v1/farms/${farmId}/alert-rules`,
    create: (farmId: string) => `/v1/farms/${farmId}/alert-rules`,
    get: (id: string) => `/v1/alert-rules/${id}`,
    update: (id: string) => `/v1/alert-rules/${id}`,
    delete: (id: string) => `/v1/alert-rules/${id}`,
    toggle: (id: string) => `/v1/alert-rules/${id}/toggle`,
    trigger: (id: string) => `/v1/alert-rules/${id}/trigger`,
  },

  // ======================================
  // AUDIT
  // ======================================
  audit: {
    list: '/v1/audit',
    get: (id: string) => `/v1/audit/${id}`,
    byEntity: (entityType: string, entityId: string) => `/v1/audit/entity/${entityType}/${entityId}`,
    byUser: (userId: string) => `/v1/audit/users/${userId}`,
    failed: '/v1/audit/failed',
    stats: '/v1/audit/stats',
  },

  // ======================================
  // SYSTEM LOGS
  // ======================================
  systemLogs: {
    search: '/v1/system/logs/search',
    get: (id: string) => `/v1/system/logs/${id}`,
    errors: '/v1/system/logs/errors',
    serverErrors: '/v1/system/logs/server-errors',
    securityViolations: '/v1/system/logs/security-violations',
    securityAnalysis: '/v1/system/logs/security/analysis',
    byUser: (userId: string) => `/v1/system/logs/users/${userId}`,
    myLogs: '/v1/system/logs/my-logs',
    bySession: (sessionId: string) => `/v1/system/logs/sessions/${sessionId}`,
    stats: '/v1/system/logs/stats',
    cleanup: '/v1/system/logs/cleanup',
  },

  // ======================================
  // SYNC LOGS
  // ======================================
  syncLogs: {
    list: '/v1/sync-logs',
    get: (id: string) => `/v1/sync-logs/${id}`,
    byFarm: (farmId: string) => `/v1/sync-logs/farms/${farmId}`,
    byUser: (userId: string) => `/v1/sync-logs/users/${userId}`,
    byDevice: (deviceId: string) => `/v1/sync-logs/devices/${deviceId}`,
    lastByDevice: (deviceId: string) => `/v1/sync-logs/devices/${deviceId}/last`,
    failed: '/v1/sync-logs/failed',
    conflicts: '/v1/sync-logs/conflicts',
    avgDuration: (farmId: string) => `/v1/sync-logs/farms/${farmId}/avg-duration`,
  },
};
