import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL || 'https://example.com/api';

export interface ProxyOptions {
  method: string;
  path: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: any;
  timeout?: number;
}

export const forwardRequest = async (options: ProxyOptions): Promise<AxiosResponse> => {
  const { method, path, headers = {}, body, timeout = 30000 } = options;

  // Construct full URL
  const url = `${INTERNAL_API_BASE_URL}${path}`;

  // Filter out internal and problematic headers
  const filteredHeaders: Record<string, string> = {};
  const headersToExclude = [
    'x-api-key',
    'x-request-id',
    'host',
    'connection',
    'content-length', // Let axios calculate this
    'transfer-encoding',
    'accept-encoding', // Let axios handle encoding
  ];

  Object.keys(headers).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (!headersToExclude.includes(lowerKey)) {
      // Only include string headers (filter out arrays)
      const value = headers[key];
      if (typeof value === 'string') {
        filteredHeaders[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        filteredHeaders[key] = value[0];
      }
    }
  });

  // Prepare axios config
  const axiosConfig: AxiosRequestConfig = {
    method: method.toLowerCase() as any,
    url,
    headers: filteredHeaders,
    timeout,
    validateStatus: () => true, // Don't throw on any status code
    maxRedirects: 5,
    decompress: true, // Let axios handle decompression
  };

  // Add body for methods that support it
  const methodLower = method.toLowerCase();
  if (['post', 'put', 'patch'].includes(methodLower) && body) {
    axiosConfig.data = body;
  }

  try {
    const response = await axios(axiosConfig);
    return response;
  } catch (error: any) {
    // Handle specific error codes with better messages
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to reach target server');
    }
    if (error.code === 'ECONNRESET') {
      throw new Error('Connection was reset by the target server. This may be due to invalid request format or server-side issues.');
    }
    if (error.response) {
      // If we got a response, return it (even if it's an error status)
      return error.response;
    }
    throw error;
  }
};

