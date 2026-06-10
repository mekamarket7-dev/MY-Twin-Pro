import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');
const APP_VERSION = Application.nativeApplicationVersion ?? '1.0.0';
const PLATFORM = Platform.OS;

let requestCounter = 0;
function generateRequestId(): string { requestCounter++; return `${Date.now().toString(36)}-${requestCounter.toString(36)}-${Math.random().toString(36).substring(2, 7)}`; }

export const API = axios.create({ baseURL: BASE_URL, timeout: 20000, headers: { 'Content-Type': 'application/json' } });

let _token = '';
export function setToken(token: string) { _token = token; }
export function getToken() { return _token; }

async function getFreshToken(): Promise<string> {
  if (_token) return _token;
  try { const { data: { session } } = await supabase.auth.getSession(); if (session?.access_token) { _token = session.access_token; return _token; } } catch (e) { console.error('getSession error:', e); }
  return '';
}

API.interceptors.request.use(async (config) => {
  if (!config.headers['X-Request-ID']) config.headers['X-Request-ID'] = generateRequestId();
  config.headers['X-App-Version'] = APP_VERSION;
  config.headers['X-Platform'] = PLATFORM;
  const token = await getFreshToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

interface RetryConfig extends InternalAxiosRequestConfig { _retry?: boolean; _retryCount?: number; }

API.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const config = error.config as RetryConfig | undefined;
  if (!config) return Promise.reject(error);
  if (error.response?.status === 401 && !config._retry) {
    config._retry = true;
    try { const { data: { session } } = await supabase.auth.refreshSession(); if (session?.access_token) { _token = session.access_token; if (config.headers) config.headers['Authorization'] = `Bearer ${_token}`; return API(config); } else { _token = ''; } } catch (refreshError) { console.error('Token refresh failed:', refreshError); _token = ''; }
  }
  const shouldRetry = !error.response || error.response.status >= 502;
  if (shouldRetry) {
    config._retryCount = config._retryCount ?? 0;
    if (config._retryCount < 3) { config._retryCount++; const delay = Math.pow(2, config._retryCount) * 1000; await new Promise((resolve) => setTimeout(resolve, delay)); return API(config); }
  }
  console.error('API Error:', { status: error.response?.status, data: error.response?.data, url: config?.url, requestId: config?.headers?.['X-Request-ID'] });
  return Promise.reject(error);
});

// ✅ دالة askTwin مبسطة بدون تعارض أنواع
export const askTwin = async (message: string, twinName: string, bond: number, dims: any, calm: boolean = false, lang: string = 'ar', image?: string) => {
  const payload = { message, twin_name: twinName, bond_level: bond, relationship_dims: dims, lang, image: image || undefined };
  try {
    const { data } = await API.post('/api/chat', payload, { headers: { 'X-Calm-Mode': String(calm) } });
    return { ...data, dims_update: data.relationship_dims || data.dims || dims };
  } catch (error) { console.error('askTwin failed:', error); throw error; }
};

export const saveMemory = async (memory: object) => { try { return await API.post('/api/memory/save', memory); } catch (error) { console.error('saveMemory failed:', error); throw error; } };

export default API;
