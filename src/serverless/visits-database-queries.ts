/**
 * Database Queries Serverless Function
 *
 * Complete CRUD operations for visits and table
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
interface Visit {
  id: number;
  visited_at: string;
  path: string;
  visited_from_country?: string;
  session_uid?: bigint;
}

interface CreateVisitInput {
  path: string;
  visited_from_country?: string;
  session_uid?: bigint;
}

interface UpdateVisitInput {
  path?: string;
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
        const body: CreateVisitInput = JSON.parse(event.body || "{}");

        if (!body.path) {
          await client.end();
          return createNetlifyResponse(400, { error: "Path is required" });
        }

        const result = await client.query<CreateVisitInput>(
          `INSERT INTO visits (path, visited_from_country, id) VALUES ($1, $2, $3) RETURNING *`,
          [body.path, body.visited_from_country || null, body.session_uid || 0]
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
          // Get single visit by ID
          const result = await client.query<Visit>(
            `SELECT * FROM visits WHERE id = $1`,
            [id]
          );

          await client.end();

          if (result.rows.length === 0) {
            return createNetlifyResponse(404, { error: "Visit not found" });
          }

          return createNetlifyResponse(200, {
            status: "success",
            data: result.rows[0],
          });
        } else {
          // Get all visits (paginated)
          const limit = queryParams.limit ? parseInt(queryParams.limit) : 100;
          const offset = queryParams.offset ? parseInt(queryParams.offset) : 0;

          const result = await client.query(
            `SELECT * FROM visits ORDER BY visited_at DESC LIMIT $1 OFFSET $2`,
            [limit.toString(), offset.toString()]
          );

          const countResult = await client.query(`SELECT COUNT(*) FROM visits`);

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

      // UPDATE operation
      case "PUT": {
        if (!id) {
          await client.end();
          return createNetlifyResponse(400, { error: "Visit ID is required" });
        }

        const body: UpdateVisitInput = JSON.parse(event.body || "{}");

        if (!body.path) {
          await client.end();
          return createNetlifyResponse(400, {
            error: "Path is required for update",
          });
        }

        const result = await client.query<Visit>(
          `UPDATE visits SET path = $1 WHERE id = $2 RETURNING *`,
          [body.path, id]
        );

        await client.end();

        if (result.rows.length === 0) {
          return createNetlifyResponse(404, { error: "Visit not found" });
        }

        return createNetlifyResponse(200, {
          status: "success",
          data: result.rows[0],
        });
      }

      // DELETE operation
      case "DELETE": {
        if (!id) {
          await client.end();
          return createNetlifyResponse(400, { error: "Visit ID is required" });
        }

        const result = await client.query<Visit>(
          `DELETE FROM visits WHERE id = $1 RETURNING *`,
          [id]
        );

        await client.end();

        if (result.rows.length === 0) {
          return createNetlifyResponse(404, { error: "Visit not found" });
        }

        return createNetlifyResponse(200, {
          status: "success",
          message: "Visit deleted successfully",
          data: result.rows[0],
        });
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
