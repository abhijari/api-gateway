import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL || 'https://example.com/api';

export interface ProxyOptions {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export const forwardRequest = async (options: ProxyOptions): Promise<AxiosResponse> => {
  const { method, path, headers = {}, body, timeout = 30000 } = options;

  // Construct full URL
  const url = `${INTERNAL_API_BASE_URL}${path}`;

  // Filter out internal headers
  const filteredHeaders: Record<string, string> = {};
  Object.keys(headers).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey !== 'x-api-key' && lowerKey !== 'x-request-id' && lowerKey !== 'host') {
      filteredHeaders[key] = headers[key];
    }
  });

  // Prepare axios config
  const axiosConfig: AxiosRequestConfig = {
    method: method.toLowerCase() as any,
    url,
    headers: filteredHeaders,
    timeout,
    validateStatus: () => true, // Don't throw on any status code
  };

  // Add body for methods that support it
  if (['post', 'put', 'patch'].includes(method.toLowerCase()) && body) {
    axiosConfig.data = body;
  }

  try {
    const response = await axios(axiosConfig);
    return response;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to reach target server');
    }
    throw error;
  }
};

