export const TOKEN_SOURCE_TYPES = {
  SERVICE_CONFIG: {
    value: 'SERVICE_CONFIG',
    label: 'Configuration du service',
    description: 'Token configuré manuellement dans ServiceConfig',
    icon: '⚙️'
  },
  AUTHENTICATION_ENDPOINT: {
    value: 'AUTHENTICATION_ENDPOINT', 
    label: 'Endpoint d\'authentification',
    description: 'Token obtenu via un endpoint d\'authentification',
    icon: '🔑'
  }
} as const;

export type TokenSourceTypeValue = keyof typeof TOKEN_SOURCE_TYPES;

export const getTokenSourceTypeConfig = (type: string) => {
  return TOKEN_SOURCE_TYPES[type as TokenSourceTypeValue] || TOKEN_SOURCE_TYPES.SERVICE_CONFIG;
};