/**
 * Extrait un nom d'appareil court et informatif depuis le User Agent
 */
export function getDeviceName(): string {
  if (typeof navigator === 'undefined') {
    return 'Unknown Device';
  }

  const userAgent = navigator.userAgent;
  
  // Détecter le navigateur
  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  }

  // Détecter l'OS
  let os = 'Unknown';
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  // Détecter le type d'appareil
  let deviceType = 'Desktop';
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    deviceType = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    deviceType = 'Tablet';
  }

  // Construire le nom final (max 50 caractères pour être sûr)
  const deviceName = `${browser} on ${os} ${deviceType}`;
  
  // S'assurer que c'est sous 100 caractères
  return deviceName.length > 90 ? deviceName.substring(0, 90) : deviceName;
}

/**
 * Détermine le type d'appareil pour l'API
 */
export function getDeviceType(): 'MOBILE' | 'DESKTOP' | 'TABLET' | 'WEB' {
  if (typeof navigator === 'undefined') {
    return 'WEB';
  }

  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    return 'MOBILE';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    return 'TABLET';
  } else {
    return 'DESKTOP';
  }
}