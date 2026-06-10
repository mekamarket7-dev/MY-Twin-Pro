import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { RelationshipDims } from '../store/useTwinStore';
import { supabase } from './supabase';

// ── الثوابت ──────────────────────────────────────
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');

const APP_VERSION = Application.nativeApplicationVersion ?? '1.0.0';
const PLATFORM = Platform.OS;
const MAX_IMAGE_BASE64_LENGTH = 500_000; // حد أقصى لحجم الصورةBase64

// ── Logger مركزي ──────────────────────────────────
const logger = {
  error: (msg: string, err?: unknown) => {
    if (__DEV__) console.error(`[API] ${msg}`, err || '');
    // هنا يمكن إرسال الخطأ إلى Sentry
  },
  warn: (msg: string) => {
    if (__DEV__) console.warn(`[API] ${msg}`);
  },
};

// ── توليد Request ID ─────────────────────────────
let requestCounter = 0;
function generateRequestId(): string {
  requestCounter++;
  return `${Date.now().toString(36)}-${requestCounter.toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

// ── إنشاء Axios Instance ─────────────────────────
export const API = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // 20 ثانية كافية للجوال
  headers: { 'Content-Type': 'application/json' },
});

// ── إدارة التوكن ────────────────────────────────
let _token = '';
export function setToken(token: string) {
  _token = token;
}
export function getToken() {
  return _token;
}

async function getFreshToken(): Promise<string> {
  if (_token) return _token;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      _token = session.access_token;
      return _token;
    }
  } catch (e) {
    logger.error('getSession error:', e);
  }
  return '';
}

// ── معترض الطلب ──────────────────────────────────
API.interceptors.request.use(async (config) => {
  if (!config.headers['X-Request-ID']) {
    config.headers['X-Request-ID'] = generateRequestId();
  }
  config.headers['X-App-Version'] = APP_VERSION;
  config.headers['X-Platform'] = PLATFORM;

  const token = await getFreshToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── أنواع إعادة المحاولة ─────────────────────────
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

// ─ـ معترض الاستجابة الموحد (401 + Retry) ─────────
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config) return Promise.reject(error);

    // 1. معالجة 401 (تجديد التوكن)
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;
      try {
        const {
          data: { session },
        } = await supabase.auth.refreshSession();
        if (session?.access_token) {
          _token = session.access_token;
          if (config.headers) {
            config.headers['Authorization'] = `Bearer ${_token}`;
          }
          return API(config);
        } else {
          // فشل التجديد، امسح التوكن الفاسد
          _token = '';
        }
      } catch (refreshError) {
        logger.error('Token refresh failed:', refreshError);
        _token = ''; // امسح التوكن الفاسد
      }
    }

    // 2. إعادة المحاولة لأخطاء الشبكة والخادم
    const shouldRetry =
      !error.response || // Network error
      error.response.status >= 502; // 502, 503, 504

    if (shouldRetry) {
      config._retryCount = config._retryCount ?? 0;
      if (config._retryCount < 3) {
        config._retryCount++;
        // تأخير أسي: 2^count * 1000
        const delay = Math.pow(2, config._retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return API(config);
      }
    }

    logger.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: config?.url,
      requestId: config?.headers?.['X-Request-ID'],
    });

    return Promise.reject(error);
  }
);

// ── واجهة أبعاد العلاقة الموسعة ──────────────────
export interface ExtendedRelationshipDims extends RelationshipDims {
  openness?: number;
  intimacy?: number;
  respect?: number;
  attachment?: number;
}

// ── تحقق من صورة base64 ──────────────────────────
function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  if (str.length > MAX_IMAGE_BASE64_LENGTH) {
    logger.warn('Image too large');
    return false;
  }
  // التحقق الأساسي من صيغة base64
  return /^[A-Za-z0-9+/=]+$/.test(str);
}

// ─ـ استدعاء المحادثة ─────────────────────────────
export const askTwin = async (
  message: string,
  twinName: string,
  bond: number,
  dims: ExtendedRelationshipDims,
  calm: boolean = false,
  lang: string = 'ar',
  image?: string
) => {
  // تحقق من الصورة إن وجدت
  let safeImage: string | undefined;
  if (image) {
    if (isValidBase64(image)) {
      safeImage = image;
    } else {
      logger.warn('Invalid image format, ignoring');
      safeImage = undefined;
    }
  }

  const payload = {
    message,
    twin_name: twinName,
    bond_level: bond,
    // نرسل relationship_dims مرة واحدة فقط (بدون dims المكرر)
    relationship_dims: dims,
    lang,
    image: safeImage,
  };

  try {
    const { data } = await API.post('/api/chat', payload, {
      headers: { 'X-Calm-Mode': String(calm) },
    });

    // نعيد الأبعاد المُحدّثة من الخادم أو الأبعاد الأصلية
    const updatedDims: ExtendedRelationshipDims = {
      ...dims,
      ...(data.relationship_dims || data.dims || {}),
    };

    return {
      ...data,
      dims_update: updatedDims,
    };
  } catch (error) {
    logger.error('askTwin failed:', error);
    throw error; // نعيد الخطأ ليتعامل معه المُستدعي
  }
};

// ─ـ حفظ الذاكرة ──────────────────────────────────
export const saveMemory = async (memory: object) => {
  try {
    return await API.post('/api/memory/save', memory);
  } catch (error) {
    logger.error('saveMemory failed:', error);
    throw error;
  }
};

export default API;
