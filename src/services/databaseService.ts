/**
 * Supabase PostgreSQL Database Service
 * Connection: Shared Pooler (IPv4 compatible Transaction Pooler)
 *
 * Credentials are securely fetched from serverless function endpoint
 * to avoid exposing secrets in client-side bundle. Update this depending on your cloud provider.
 */

import logger from "../utils/logger";
import { callServerlessFunction } from "./utils/servicesUtils";

const VISITS_TABLE_SERVERLESS_METHOD_NAME = "visits-database-queries";
const MESSAGES_TABLE_SERVERLESS_METHOD_NAME = "messages-database-queries";
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  connectionString: string;
}

// Cache for database credentials (in-memory only, never persisted)
let cachedConfig: DatabaseConfig | null = null;

/**
 * Get database configuration securely from serverless function
 * Falls back to local environment variables for development
 * @returns Promise resolving to Database configuration object
 */
export const getDatabaseConfig = async (): Promise<DatabaseConfig> => {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }

  const config = await callServerlessFunction<DatabaseConfig>(
    "database-credentials",
    {}
  );
  cachedConfig = config as DatabaseConfig;

  logger.log("Database configuration securely retrieved from server");
  return cachedConfig;
};

/**
 * Validate database connection configuration
 * @returns Promise resolving to boolean indicating if config is valid
 */
export const isDatabaseConfigValid = async (): Promise<boolean> => {
  const config = await getDatabaseConfig();
  return !!config.password && !!config.host && !!config.user;
};

/**
 * Get connection string for PostgreSQL clients
 * @returns Promise resolving to formatted connection string
 */
export const getConnectionString = async (): Promise<string> => {
  const config = await getDatabaseConfig();
  return config.connectionString;
};

/**
 * Database connection status check
 * @returns Promise resolving to status object with connection info
 */
export const getDatabaseStatus = async () => {
  const config = await getDatabaseConfig();
  const isValid = await isDatabaseConfigValid();

  return {
    configured: isValid,
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    poolerType: "Shared Transaction Pooler (IPv4 Compatible)",
    region: "us-west-2 (AWS)",
    timestamp: new Date().toISOString(),
  };
};

/**
 * Clear cached database credentials (for re-authentication)
 */
export const clearDatabaseConfigCache = () => {
  cachedConfig = null;
};

/**
 * Query Types for database operations
 */
export interface Visit {
  id: number;
  visited_at: string;
  path: string;
  visited_from_country?: string;
}

export interface CreateVisitInput {
  path: string;
  visited_from_country?: string;
}

export interface UpdateVisitInput {
  path?: string;
}

export interface PaginatedResult<T> {
  status: string;
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface SingleResult<T> {
  status: string;
  data: T;
  message?: string;
}

export interface Message {
  id: number;
  created_at: string;
  message: Record<string, unknown>;
}

export interface CreateMessageInput {
  message?: Record<string, unknown>;
}

/**
 * Get all visits with pagination
 * @param limit Maximum number of records to return
 * @param offset Number of records to skip
 */
/**
 * Get all visits with pagination
 * @param limit Maximum number of records to return
 * @param offset Number of records to skip
 */
export const getVisits = async (
  limit = 100,
  offset = 0
): Promise<PaginatedResult<Visit>> => {
  return callServerlessFunction<PaginatedResult<Visit>>(
    VISITS_TABLE_SERVERLESS_METHOD_NAME,
    { limit: limit.toString(), offset: offset.toString() },
    { method: "GET" }
  );
};

/**
 * Get single visit by ID
 * @param id Visit record ID
 */
export const getVisitById = async (
  id: number
): Promise<SingleResult<Visit>> => {
  return callServerlessFunction<SingleResult<Visit>>(
    VISITS_TABLE_SERVERLESS_METHOD_NAME,
    { id: id.toString() },
    { method: "GET" }
  );
};

/**
 * Create new visit record
 * @param data Visit creation data
 */
/**
 * Create new visit record with client geolocation
 * @param data Visit creation data
 */
export const createVisit = async (
  data: CreateVisitInput
): Promise<SingleResult<Visit>> => {
  // Get client geolocation data from browser
  try {
    const geoResponse = await fetch("https://ipapi.co/json/");
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      const locationParts = [];

      if (geoData.city) locationParts.push(geoData.city);
      if (geoData.region) locationParts.push(geoData.region);
      if (geoData.country_code)
        locationParts.push(geoData.country_code.toUpperCase());

      if (locationParts.length > 0) {
        // eslint-disable-next-line camelcase
        data.visited_from_country = locationParts.join(", ");
      }
    }
  } catch (error) {
    // Silently fail geolocation lookup - do not block visit recording
    logger.warn(
      `Could not retrieve client geolocation: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return callServerlessFunction<SingleResult<Visit>>(
    VISITS_TABLE_SERVERLESS_METHOD_NAME,
    {},
    {
      method: "POST",
      body: data,
    }
  );
};

/**
 * Update existing visit record
 * @param id Visit record ID
 * @param data Visit update data
 */
export const updateVisit = async (
  id: number,
  data: UpdateVisitInput
): Promise<SingleResult<Visit>> => {
  return callServerlessFunction<SingleResult<Visit>>(
    VISITS_TABLE_SERVERLESS_METHOD_NAME,
    { id: id.toString() },
    {
      method: "PUT",
      body: data,
    }
  );
};

/**
 * Delete visit record
 * @param id Visit record ID
 */
export const deleteVisit = async (id: number): Promise<SingleResult<Visit>> => {
  return callServerlessFunction<SingleResult<Visit>>(
    VISITS_TABLE_SERVERLESS_METHOD_NAME,
    { id: id.toString() },
    { method: "DELETE" }
  );
};
/**
 * Create new message record
 * @param data Message creation data
 */
export const createMessage = async (
  data: CreateMessageInput
): Promise<SingleResult<Message>> => {
  return callServerlessFunction<SingleResult<Message>>(
    MESSAGES_TABLE_SERVERLESS_METHOD_NAME,
    {},
    {
      method: "POST",
      body: data,
    }
  );
};

export default {
  getDatabaseConfig,
  getConnectionString,
  isDatabaseConfigValid,
  getDatabaseStatus,
  clearDatabaseConfigCache,
  getVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  createMessage,
};
