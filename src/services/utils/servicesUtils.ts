/**
 * Serverless Function Utilities
 * Shared logic for calling Netlify serverless functions
 * Handles both local development direct handler calls and production fetch requests
 */

import {
  NETLIFY_SERVERLESS_PATH,
  NetlifyFunctionEvent,
} from "../../utils/netlify";
import logger from "../../utils/logger";

/**
 * Call Netlify serverless function
 * Automatically uses direct handler import in DEV mode, network fetch in production
 * @param endpoint Serverless function endpoint name
 * @param params Query string parameters
 * @param importPath Optional custom import path for dev mode handler (defaults to ../serverless/{endpoint})
 * @returns Parsed JSON response
 */
export interface CallServerlessOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export const callServerlessFunction = async <T = unknown>(
  endpoint: string,
  params: Record<string, string> = {},
  options: CallServerlessOptions = {}
): Promise<T> => {
  // Call directly in local development environment
  logger.info(`Calling serverless endpoint: ${endpoint}`);
  if (import.meta.env.DEV) {
    const handlerPath = `../../serverless/${endpoint}`;
    const { handler } = await import(handlerPath);
    logger.info(`Local Dev env identified. using ${handlerPath}instead`);

    const event: NetlifyFunctionEvent = {
      queryStringParameters: params,
      httpMethod: options.method || "GET",
      headers: options.headers || {},
      body: options.body ? JSON.stringify(options.body) : null,
    };

    const response = (await handler(event)) as {
      statusCode: number;
      body: string;
    };

    if (response.statusCode >= 400) {
      throw new Error(`API error: ${response.statusCode}`);
    }

    return JSON.parse(response.body);
  }

  // Production: use fetch to call Netlify function
  const query = new URLSearchParams(params).toString();
  const url =
    query.length > 0
      ? `${NETLIFY_SERVERLESS_PATH}${endpoint}?${query}`
      : `${NETLIFY_SERVERLESS_PATH}${endpoint}`;

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(
        `API error: ${error?.message || error?.error || response.statusText}`
      );
    } catch {
      throw new Error(`API error: ${response.statusText}`);
    }
  }

  return response.json();
};

/**
 * Generate unique session UID for visitor tracking
 * Creates a persistent ID that remains consistent for the user during their session
 * Uses 64-bit integer format for PostgreSQL int8 storage
 * @returns 64-bit numeric identifier suitable for int8 column
 */
export const generateSessionUid = (): bigint => {
  // 41 bits timestamp (milliseconds since epoch, good for ~69 years)
  const timestamp = BigInt(Date.now()) & 0x1ffffffffffn;
  // 23 bits random entropy
  const random = BigInt(Math.floor(Math.random() * 0x7fffff));
  // Combine into 64-bit integer (fits exactly into PostgreSQL int8)
  return (timestamp << 23n) | random;
};

export default {
  callServerlessFunction,
  generateSessionUid,
};
