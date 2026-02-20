export const TOKEN_FIELD_SOURCE_TYPES = {
  API_AUTH_TOKEN: {
    value: 'API_AUTH_TOKEN',
    label: 'Token d\'authentification API',
    description: 'Token obtenu depuis l\'endpoint d\'authentification',
    icon: '🔑'
  },
  SERVICE_CONFIG_TOKEN: {
    value: 'SERVICE_CONFIG_TOKEN', 
    label: 'Token de configuration service',
    description: 'Token statique configuré dans ServiceConfig',
    icon: '⚙️'
  },
  SESSION_TOKEN: {
    value: 'SESSION_TOKEN',
    label: 'Token de session utilisateur',
    description: 'Token de la session utilisateur courante',
    icon: '👤'
  }
} as const;

export type TokenFieldSourceTypeValue = keyof typeof TOKEN_FIELD_SOURCE_TYPES;

export const getTokenFieldSourceTypeConfig = (type: string) => {
  return TOKEN_FIELD_SOURCE_TYPES[type as TokenFieldSourceTypeValue] || TOKEN_FIELD_SOURCE_TYPES.SERVICE_CONFIG_TOKEN;
};