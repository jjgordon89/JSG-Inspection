import { Surreal } from 'surrealdb.js';
import { config } from '@config/config';
import { logger } from '@utils/logger';

/**
 * SurrealDB Database Service
 * Manages database connection, initialization, and provides query interface
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private db: Surreal;
  private isConnected: boolean = false;
  private connectionRetries: number = 0;
  private readonly maxRetries: number = 5;
  private readonly retryDelay: number = 2000;

  private constructor() {
    this.db = new Surreal();
  }

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection
   */
  public async connect(): Promise<void> {
    try {
      logger.info('Connecting to SurrealDB...');
      
      // Connect to SurrealDB
      await this.db.connect(config.database.url, {
        namespace: config.database.namespace,
        database: config.database.database,
      });

      // Authenticate if credentials are provided
      if (config.database.username && config.database.password) {
        await this.db.signin({
          username: config.database.username,
          password: config.database.password,
        });
      }

      // Use namespace and database
      await this.db.use({
        namespace: config.database.namespace,
        database: config.database.database,
      });

      this.isConnected = true;
      this.connectionRetries = 0;
      
      logger.info(`Successfully connected to SurrealDB at ${config.database.url}`);
      
      // Initialize database schema
      await this.initializeSchema();
      
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to SurrealDB:', error);
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        logger.info(`Retrying connection in ${this.retryDelay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`);
        
        setTimeout(() => {
          this.connect();
        }, this.retryDelay);
      } else {
        throw new Error(`Failed to connect to SurrealDB after ${this.maxRetries} attempts`);
      }
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.db.close();
        this.isConnected = false;
        logger.info('Disconnected from SurrealDB');
      }
    } catch (error) {
      logger.error('Error disconnecting from SurrealDB:', error);
    }
  }

  /**
   * Get database instance
   */
  public getDatabase(): Surreal {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Check if database is connected
   */
  public isDbConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Execute a query with error handling
   */
  public async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      const result = await this.db.query(sql, vars);
      return result as T[];
    } catch (error) {
      logger.error('Database query error:', { sql, vars, error });
      throw error;
    }
  }

  /**
   * Create a new record
   */
  public async create<T = any>(table: string, data: Record<string, any>): Promise<T> {
    try {
      const result = await this.db.create(table, data);
      return result as T;
    } catch (error) {
      logger.error('Database create error:', { table, data, error });
      throw error;
    }
  }

  /**
   * Select records
   */
  public async select<T = any>(thing: string): Promise<T[]> {
    try {
      const result = await this.db.select(thing);
      return result as T[];
    } catch (error) {
      logger.error('Database select error:', { thing, error });
      throw error;
    }
  }

  /**
   * Update a record
   */
  public async update<T = any>(thing: string, data: Record<string, any>): Promise<T> {
    try {
      const result = await this.db.update(thing, data);
      return result as T;
    } catch (error) {
      logger.error('Database update error:', { thing, data, error });
      throw error;
    }
  }

  /**
   * Merge data into a record
   */
  public async merge<T = any>(thing: string, data: Record<string, any>): Promise<T> {
    try {
      const result = await this.db.merge(thing, data);
      return result as T;
    } catch (error) {
      logger.error('Database merge error:', { thing, data, error });
      throw error;
    }
  }

  /**
   * Delete a record
   */
  public async delete<T = any>(thing: string): Promise<T> {
    try {
      const result = await this.db.delete(thing);
      return result as T;
    } catch (error) {
      logger.error('Database delete error:', { thing, error });
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  public async transaction<T = any>(queries: string[]): Promise<T[]> {
    try {
      const results: T[] = [];
      
      for (const query of queries) {
        const result = await this.db.query(query);
        results.push(result as T);
      }
      
      return results;
    } catch (error) {
      logger.error('Database transaction error:', { queries, error });
      throw error;
    }
  }

  /**
   * Initialize database schema
   */
  private async initializeSchema(): Promise<void> {
    try {
      logger.info('Initializing database schema...');
      
      // Define tables and their schemas
      const schemaQueries = [
        // Users table
        `DEFINE TABLE users SCHEMAFULL;
         DEFINE FIELD email ON TABLE users TYPE string ASSERT string::is::email($value);
         DEFINE FIELD password ON TABLE users TYPE string;
         DEFINE FIELD firstName ON TABLE users TYPE string;
         DEFINE FIELD lastName ON TABLE users TYPE string;
         DEFINE FIELD role ON TABLE users TYPE string DEFAULT 'user' ASSERT $value IN ['admin', 'manager', 'inspector', 'user'];
         DEFINE FIELD isActive ON TABLE users TYPE bool DEFAULT true;
         DEFINE FIELD lastLogin ON TABLE users TYPE datetime;
         DEFINE FIELD createdAt ON TABLE users TYPE datetime DEFAULT time::now();
         DEFINE FIELD updatedAt ON TABLE users TYPE datetime DEFAULT time::now();
         DEFINE INDEX email_idx ON TABLE users COLUMNS email UNIQUE;`,

        // Teams table
        `DEFINE TABLE teams SCHEMAFULL;
         DEFINE FIELD name ON TABLE teams TYPE string;
         DEFINE FIELD description ON TABLE teams TYPE string;
         DEFINE FIELD isActive ON TABLE teams TYPE bool DEFAULT true;
         DEFINE FIELD createdAt ON TABLE teams TYPE datetime DEFAULT time::now();
         DEFINE FIELD updatedAt ON TABLE teams TYPE datetime DEFAULT time::now();`,

        // Assets table
        `DEFINE TABLE assets SCHEMAFULL;
         DEFINE FIELD name ON TABLE assets TYPE string;
         DEFINE FIELD description ON TABLE assets TYPE string;
         DEFINE FIELD type ON TABLE assets TYPE string ASSERT $value IN ['equipment', 'building', 'vehicle', 'tool', 'other'];
         DEFINE FIELD location ON TABLE assets TYPE object;
         DEFINE FIELD qrCode ON TABLE assets TYPE string;
         DEFINE FIELD barcode ON TABLE assets TYPE string;
         DEFINE FIELD serialNumber ON TABLE assets TYPE string;
         DEFINE FIELD manufacturer ON TABLE assets TYPE string;
         DEFINE FIELD model ON TABLE assets TYPE string;
         DEFINE FIELD purchaseDate ON TABLE assets TYPE datetime;
         DEFINE FIELD warrantyExpiry ON TABLE assets TYPE datetime;
         DEFINE FIELD status ON TABLE assets TYPE string DEFAULT 'active' ASSERT $value IN ['active', 'inactive', 'maintenance', 'retired'];
         DEFINE FIELD createdAt ON TABLE assets TYPE datetime DEFAULT time::now();
         DEFINE FIELD updatedAt ON TABLE assets TYPE datetime DEFAULT time::now();
         DEFINE INDEX qr_code_idx ON TABLE assets COLUMNS qrCode UNIQUE;
         DEFINE INDEX barcode_idx ON TABLE assets COLUMNS barcode UNIQUE;`,

        // Form templates table
        `DEFINE TABLE form_templates SCHEMAFULL;
         DEFINE FIELD name ON TABLE form_templates TYPE string;
         DEFINE FIELD description ON TABLE form_templates TYPE string;
         DEFINE FIELD version ON TABLE form_templates TYPE string DEFAULT '1.0';
         DEFINE FIELD fields ON TABLE form_templates TYPE array;
         DEFINE FIELD isActive ON TABLE form_templates TYPE bool DEFAULT true;
         DEFINE FIELD createdBy ON TABLE form_templates TYPE record(users);
         DEFINE FIELD createdAt ON TABLE form_templates TYPE datetime DEFAULT time::now();
         DEFINE FIELD updatedAt ON TABLE form_templates TYPE datetime DEFAULT time::now();`,

        // Folders table
        `DEFINE TABLE folders SCHEMAFULL;
         DEFINE FIELD name ON TABLE folders TYPE string;
         DEFINE FIELD description ON TABLE folders TYPE string;
         DEFINE FIELD type ON TABLE folders TYPE string DEFAULT 'inspection' ASSERT $value IN ['inspection', 'maintenance', 'audit', 'safety'];
         DEFINE FIELD status ON TABLE folders TYPE string DEFAULT 'active' ASSERT $value IN ['active', 'completed', 'cancelled', 'archived'];
         DEFINE FIELD priority ON TABLE folders TYPE string DEFAULT 'medium' ASSERT $value IN ['low', 'medium', 'high', 'critical'];
         DEFINE FIELD scheduledDate ON TABLE folders TYPE datetime;
         DEFINE FIELD dueDate ON TABLE folders TYPE datetime;
         DEFINE FIELD assignedTo ON TABLE folders TYPE record(users);
         DEFINE FIELD createdBy ON TABLE folders TYPE record(users);
         DEFINE FIELD createdAt ON TABLE folders TYPE datetime DEFAULT time::now();
         DEFINE FIELD updatedAt ON TABLE folders TYPE datetime DEFAULT time::now();`,

        // Inspections table
        `DEFINE TABLE inspections SCHEMAFULL;
         DEFINE FIELD folder ON TABLE inspections TYPE record(folders);
         DEFINE FIELD asset ON TABLE inspections TYPE record(assets);
         DEFINE FIELD formTemplate ON TABLE inspections TYPE record(form_templates);
         DEFINE FIELD inspector ON TABLE inspections TYPE record(users);
         DEFINE FIELD status ON TABLE inspections TYPE string DEFAULT 'pending' ASSERT $value IN ['pending', 'in_progress', 'completed', 'failed', 'cancelled'];
         DEFINE FIELD priority ON TABLE inspections TYPE string DEFAULT 'medium' ASSERT $value IN ['low', 'medium', 'high', 'critical'];
         DEFINE FIELD responses ON TABLE inspections TYPE array;
         DEFINE FIELD photos ON TABLE inspections TYPE array;
         DEFINE FIELD notes ON TABLE inspections TYPE string;
         DEFINE FIELD score ON TABLE inspections TYPE object;
         DEFINE FIELD startedAt ON TABLE inspections TYPE datetime;
         DEFINE FIELD completedAt ON TABLE inspections TYPE datetime;
         DEFINE FIELD location ON TABLE inspections TYPE object;
         DEFINE FIELD createdAt ON TABLE inspections TYPE datetime DEFAULT time::now();
         DEFINE FIELD updatedAt ON TABLE inspections TYPE datetime DEFAULT time::now();`,

        // Reports table
        `DEFINE TABLE reports SCHEMAFULL;
         DEFINE FIELD title ON TABLE reports TYPE string;
         DEFINE FIELD type ON TABLE reports TYPE string ASSERT $value IN ['inspection', 'summary', 'analytics', 'compliance'];
         DEFINE FIELD content ON TABLE reports TYPE string;
         DEFINE FIELD data ON TABLE reports TYPE object;
         DEFINE FIELD generatedBy ON TABLE reports TYPE record(users);
         DEFINE FIELD generatedAt ON TABLE reports TYPE datetime DEFAULT time::now();
         DEFINE FIELD filters ON TABLE reports TYPE object;
         DEFINE FIELD format ON TABLE reports TYPE string DEFAULT 'pdf' ASSERT $value IN ['pdf', 'excel', 'csv', 'json'];`,

        // Audit logs table
        `DEFINE TABLE audit_logs SCHEMAFULL;
         DEFINE FIELD action ON TABLE audit_logs TYPE string;
         DEFINE FIELD entity ON TABLE audit_logs TYPE string;
         DEFINE FIELD entityId ON TABLE audit_logs TYPE string;
         DEFINE FIELD userId ON TABLE audit_logs TYPE record(users);
         DEFINE FIELD changes ON TABLE audit_logs TYPE object;
         DEFINE FIELD ipAddress ON TABLE audit_logs TYPE string;
         DEFINE FIELD userAgent ON TABLE audit_logs TYPE string;
         DEFINE FIELD timestamp ON TABLE audit_logs TYPE datetime DEFAULT time::now();`,

        // Notifications table
        `DEFINE TABLE notifications SCHEMAFULL;
         DEFINE FIELD title ON TABLE notifications TYPE string;
         DEFINE FIELD message ON TABLE notifications TYPE string;
         DEFINE FIELD type ON TABLE notifications TYPE string ASSERT $value IN ['info', 'warning', 'error', 'success'];
         DEFINE FIELD userId ON TABLE notifications TYPE record(users);
         DEFINE FIELD isRead ON TABLE notifications TYPE bool DEFAULT false;
         DEFINE FIELD data ON TABLE notifications TYPE object;
         DEFINE FIELD createdAt ON TABLE notifications TYPE datetime DEFAULT time::now();`
      ];

      // Execute schema queries
      for (const query of schemaQueries) {
        await this.db.query(query);
      }

      logger.info('Database schema initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database schema:', error);
      throw error;
    }
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<{ status: string; timestamp: string; database: string }> {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      // Simple query to test connection
      await this.db.query('SELECT * FROM users LIMIT 1');
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: `${config.database.namespace}/${config.database.database}`
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: `${config.database.namespace}/${config.database.database}`
      };
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();