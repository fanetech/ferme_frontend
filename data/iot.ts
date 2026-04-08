import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse } from "@/types";
import type { IoTSensorResponse, IoTReadingResponse, SensorStatisticsResponse, WeatherDataResponse, WeatherForecastResponse, CreateIoTSensorRequest, CreateIoTReadingRequest, UpdateSensorStatusRequest } from "@/types/iot";

export const SENSOR_KEYS = {
  ALL: ["sensors"] as const,
  BY_FARM: (farmId: string) => ["sensors", "farm", farmId] as const,
  DETAIL: (farmId: string, id: string) => ["sensors", farmId, id] as const,
  READINGS: (sensorId: string) => ["sensors", sensorId, "readings"] as const,
  STATS: (sensorId: string) => ["sensors", sensorId, "stats"] as const,
};

export const WEATHER_KEYS = {
  CURRENT: (farmId: string) => ["weather", "current", farmId] as const,
  HISTORY: (farmId: string) => ["weather", "history", farmId] as const,
  FORECAST: (farmId: string) => ["weather", "forecast", farmId] as const,
};

export const sensorApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<IoTSensorResponse[]>>(API_ENDPOINTS.iot.sensors.byFarm(farmId)),
  getById: (farmId: string, id: string) =>
    HttpClient.get<ApiResponse<IoTSensorResponse>>(API_ENDPOINTS.iot.sensors.get(farmId, id)),
  create: (farmId: string, data: CreateIoTSensorRequest) =>
    HttpClient.post<ApiResponse<IoTSensorResponse>>(API_ENDPOINTS.iot.sensors.create(farmId), data),
  update: (farmId: string, id: string, data: Partial<CreateIoTSensorRequest>) =>
    HttpClient.put<ApiResponse<IoTSensorResponse>>(API_ENDPOINTS.iot.sensors.update(farmId, id), data),
  delete: (farmId: string, id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.iot.sensors.delete(farmId, id)),
  changeStatus: (farmId: string, id: string, data: UpdateSensorStatusRequest) =>
    HttpClient.put<ApiResponse<IoTSensorResponse>>(`${API_ENDPOINTS.iot.sensors.changeStatus(farmId, id)}`, data),
  lowBattery: (farmId: string) =>
    HttpClient.get<ApiResponse<IoTSensorResponse[]>>(API_ENDPOINTS.iot.sensors.lowBattery(farmId)),
  needsCalibration: (farmId: string) =>
    HttpClient.get<ApiResponse<IoTSensorResponse[]>>(API_ENDPOINTS.iot.sensors.needsCalibration(farmId)),
  // Readings
  readings: (sensorId: string) =>
    HttpClient.get<ApiResponse<IoTReadingResponse[]>>(API_ENDPOINTS.iot.readings.bySensor(sensorId)),
  latestReading: (sensorId: string) =>
    HttpClient.get<ApiResponse<IoTReadingResponse>>(API_ENDPOINTS.iot.readings.latest(sensorId)),
  createReading: (sensorId: string, data: CreateIoTReadingRequest) =>
    HttpClient.post<ApiResponse<IoTReadingResponse>>(API_ENDPOINTS.iot.readings.create(sensorId), data),
  statistics: (sensorId: string) =>
    HttpClient.get<ApiResponse<SensorStatisticsResponse>>(API_ENDPOINTS.iot.readings.statistics(sensorId)),
  anomalies: (farmId: string) =>
    HttpClient.get<ApiResponse<IoTReadingResponse[]>>(API_ENDPOINTS.iot.readings.anomalies(farmId)),
};

export const weatherApi = {
  current: (farmId: string) =>
    HttpClient.get<ApiResponse<WeatherDataResponse>>(API_ENDPOINTS.iot.weather.current(farmId)),
  history: (farmId: string) =>
    HttpClient.get<ApiResponse<WeatherDataResponse[]>>(API_ENDPOINTS.iot.weather.history(farmId)),
  forecast: (farmId: string) =>
    HttpClient.get<ApiResponse<WeatherForecastResponse[]>>(API_ENDPOINTS.iot.weather.forecast(farmId)),
};

// ======================================
// QUERY HOOKS
// ======================================

export function useFarmSensors(farmId: string) {
  return useQuery({ queryKey: SENSOR_KEYS.BY_FARM(farmId), queryFn: () => sensorApi.byFarm(farmId), enabled: !!farmId });
}

export function useSensor(farmId: string, id: string) {
  return useQuery({ queryKey: SENSOR_KEYS.DETAIL(farmId, id), queryFn: () => sensorApi.getById(farmId, id), enabled: !!farmId && !!id });
}

export function useSensorReadings(sensorId: string) {
  return useQuery({ queryKey: SENSOR_KEYS.READINGS(sensorId), queryFn: () => sensorApi.readings(sensorId), enabled: !!sensorId });
}

export function useSensorStatistics(sensorId: string) {
  return useQuery({ queryKey: SENSOR_KEYS.STATS(sensorId), queryFn: () => sensorApi.statistics(sensorId), enabled: !!sensorId });
}

export function useCurrentWeather(farmId: string) {
  return useQuery({ queryKey: WEATHER_KEYS.CURRENT(farmId), queryFn: () => weatherApi.current(farmId), enabled: !!farmId });
}

export function useWeatherHistory(farmId: string) {
  return useQuery({ queryKey: WEATHER_KEYS.HISTORY(farmId), queryFn: () => weatherApi.history(farmId), enabled: !!farmId });
}

export function useWeatherForecast(farmId: string) {
  return useQuery({ queryKey: WEATHER_KEYS.FORECAST(farmId), queryFn: () => weatherApi.forecast(farmId), enabled: !!farmId });
}

// ======================================
// MUTATION HOOKS
// ======================================

export function useCreateSensor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ farmId, data }: { farmId: string; data: CreateIoTSensorRequest }) => sensorApi.create(farmId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SENSOR_KEYS.ALL }); toast.success("Capteur ajouté"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}
