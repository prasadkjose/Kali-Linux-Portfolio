/**
 * Database Queries Serverless Function
 *
 * Complete CRUD operations for messages DB table
 * All database operations run securely on the server, never expose credentials to client
 */

import logger from "../utils/logger";
import {
  createNetlifyResponse,
  NetlifyFunctionEvent,
  withErrorHandling,
} from "../utils/netlify";

// Import shared database connection logic
import { getDatabaseCredentials } from "./database-credentials";

// Types matching database schema
interface Message {
  id: number;
  message: Record<string, unknown>;
}

interface CreateMessageInput {
  session_uid?: string;
  message?: Record<string, unknown>;
}

const databaseQueriesHandler = async (event: NetlifyFunctionEvent) => {
  // Get shared database credentials logic
  const dbCredentials = getDatabaseCredentials();

  if (dbCredentials.error) {
    return createNetlifyResponse(500, { error: dbCredentials.message });
  }

  const { connectionString } = dbCredentials;

  // Extract HTTP method and path parameters
  const httpMethod = event.httpMethod;
  const queryParams = event.queryStringParameters || {};
  const id = queryParams.id;

  try {
    // Dynamic import for PostgreSQL client (only loaded on server)
    const pgModule = await import("pg");
    const Client = pgModule.Client;
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    switch (httpMethod) {
      // CREATE operation
      case "POST": {
        const body: CreateMessageInput = JSON.parse(event.body || "{}");

        const result = await client.query<Message>(
          `INSERT INTO messages (id, message) VALUES ($1) RETURNING *`,
          [body.session_uid || null, body.message || {}]
        );

        await client.end();
        return createNetlifyResponse(201, {
          status: "success",
          data: result.rows[0],
        });
      }

      // READ operations
      case "GET": {
        if (id) {
          // Get single message by ID
          const result = await client.query<Message>(
            `SELECT * FROM messages WHERE id = $1`,
            [id]
          );

          await client.end();

          if (result.rows.length === 0) {
            return createNetlifyResponse(404, { error: "Message not found" });
          }

          return createNetlifyResponse(200, {
            status: "success",
            data: result.rows[0],
          });
        } else {
          // Get all messages (paginated)
          const limit = queryParams.limit ? parseInt(queryParams.limit) : 100;
          const offset = queryParams.offset ? parseInt(queryParams.offset) : 0;

          const result = await client.query(
            `SELECT * FROM messages ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
          );

          const countResult = await client.query(
            `SELECT COUNT(*) FROM messages`
          );

          await client.end();

          return createNetlifyResponse(200, {
            status: "success",
            data: result.rows,
            total: parseInt(countResult.rows[0].count),
            limit,
            offset,
          });
        }
      }

      default:
        return createNetlifyResponse(405, { error: "Method not allowed" });
    }
  } catch (error) {
    logger.error(`Database query error: ${error}`);
    return createNetlifyResponse(500, {
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handler = withErrorHandling(databaseQueriesHandler);
