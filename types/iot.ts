// ======================================
// IOT MODULE TYPES
// ======================================

export type SensorType = 'TEMPERATURE' | 'HUMIDITY' | 'SOIL_MOISTURE' | 'SOIL_PH' | 'LIGHT' | 'CO2' | 'WATER_LEVEL' | 'MOTION' | 'CAMERA' | 'RAIN_GAUGE'
export type SensorStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'FAULT' | 'CALIBRATING'
export type WeatherCondition = 'CLEAR' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG' | 'DUST' | 'HARMATTAN'

// ======================================
// IOT SENSOR
// ======================================

export interface IoTSensorResponse {
  id: string
  farmId: string
  sensorCode: string
  name: string
  sensorType: SensorType
  status: SensorStatus
  latitude?: number
  longitude?: number
  targetId?: string
  targetType?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  installationDate?: string
  lastCalibrationDate?: string
  calibrationIntervalDays?: number
  minValue?: number
  maxValue?: number
  unit?: string
  readingIntervalMinutes?: number
  batteryLevel?: number
  isActive: boolean
  needsCalibration?: boolean
  isLowBattery?: boolean
  lastReadingAt?: string
  totalReadings?: number
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateIoTSensorRequest {
  sensorCode: string
  name: string
  sensorType: SensorType
  latitude?: number
  longitude?: number
  targetId?: string
  targetType?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  installationDate?: string
  lastCalibrationDate?: string
  calibrationIntervalDays?: number
  minValue?: number
  maxValue?: number
  unit?: string
  readingIntervalMinutes?: number
  batteryLevel?: number
  notes?: string
  metadata?: Record<string, any>
}

export interface UpdateSensorStatusRequest {
  status: SensorStatus
}

// ======================================
// IOT READING
// ======================================

export interface IoTReadingResponse {
  id: string
  sensorId: string
  sensorCode: string
  recordedAt: string
  value: number
  unit?: string
  isAnomaly: boolean
  anomalyScore?: number
  signalStrength?: number
  batteryLevel?: number
  notes?: string
  rawData?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: string
}

export interface CreateIoTReadingRequest {
  recordedAt: string
  value: number
  unit?: string
  signalStrength?: number
  batteryLevel?: number
  notes?: string
  rawData?: Record<string, any>
  metadata?: Record<string, any>
}

export interface SensorStatisticsResponse {
  sensorId: string
  sensorCode: string
  sensorName: string
  periodStart: string
  periodEnd: string
  totalReadings: number
  anomalousReadings: number
  anomalyRate: number
  minValue: number
  maxValue: number
  avgValue: number
  stdDeviation: number
  unit?: string
}

// ======================================
// WEATHER
// ======================================

export interface WeatherDataResponse {
  id: string
  recordedAt: string
  temperature?: number
  humidity?: number
  pressure?: number
  windSpeed?: number
  windDirection?: number
  windDirectionCardinal?: string
  rainfall: number
  solarRadiation?: number
  uvIndex?: number
  visibility?: number
  dewPoint?: number
  heatIndex?: number
  weatherCondition?: WeatherCondition
  metadata?: Record<string, any>
}

export interface WeatherForecastResponse {
  forecastDate: string
  minTemperature?: number
  maxTemperature?: number
  avgTemperature?: number
  humidity?: number
  pressure?: number
  windSpeed?: number
  windDirection?: string
  precipitationProbability?: number
  expectedRainfall?: number
  uvIndex?: number
  weatherCondition?: WeatherCondition
  description?: string
}
