export const CONTENT_TYPES = {
  APPLICATION_JSON: {
    value: 'APPLICATION_JSON',
    mimeType: 'application/json',
    label: 'Application JSON',
    description: 'Par défaut pour la plupart des APIs REST',
    icon: '📄'
  },
  APPLICATION_FORM_URLENCODED: {
    value: 'APPLICATION_FORM_URLENCODED',
    mimeType: 'application/x-www-form-urlencoded',
    label: 'Form URL Encoded',
    description: 'Pour les APIs qui utilisent des formulaires',
    icon: '📝'
  },
  MULTIPART_FORM_DATA: {
    value: 'MULTIPART_FORM_DATA',
    mimeType: 'multipart/form-data',
    label: 'Multipart Form Data',
    description: 'Pour l\'upload de fichiers',
    icon: '📎'
  },
  TEXT_PLAIN: {
    value: 'TEXT_PLAIN',
    mimeType: 'text/plain',
    label: 'Texte brut',
    description: 'Contenu texte simple',
    icon: '📋'
  },
  APPLICATION_XML: {
    value: 'APPLICATION_XML',
    mimeType: 'application/xml',
    label: 'Application XML',
    description: 'Données structurées XML',
    icon: '🏷️'
  },
  TEXT_HTML: {
    value: 'TEXT_HTML',
    mimeType: 'text/html',
    label: 'Text HTML',
    description: 'Contenu HTML',
    icon: '🌐'
  },
  APPLICATION_OCTET_STREAM: {
    value: 'APPLICATION_OCTET_STREAM',
    mimeType: 'application/octet-stream',
    label: 'Stream binaire',
    description: 'Données binaires',
    icon: '💾'
  }
} as const;

export type ContentTypeValue = keyof typeof CONTENT_TYPES;

export const getContentTypeConfig = (type: string) => {
  return CONTENT_TYPES[type as ContentTypeValue] || CONTENT_TYPES.APPLICATION_JSON;
};

export const getContentTypesArray = () => {
  return Object.values(CONTENT_TYPES);
};