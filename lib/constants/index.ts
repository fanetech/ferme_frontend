// Export all constants from a single entry point
export * from './modules';
export * from './permissions';
export * from './roles';

// Re-export commonly used constants for convenience
export { MODULES } from './modules';
export { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from './permissions';
export { ROLES } from './roles';