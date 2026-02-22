/**
 * Database Service
 * 
 * Handles SQLite database initialization and management for offline storage.
 * Implements the LocalDatabase interface for visit records and user session management.
 * 
 * Requirements: 5.1, 5.2
 */

import SQLite, {
  SQLiteDatabase,
  enablePromise,
  openDatabase,
} from 'react-native-sqlite-storage';
import {
  DB_NAME,
  DB_VERSION,
  DB_DISPLAY_NAME,
  DB_SIZE,
  CREATE_TABLES_SQL,
  TABLES,
} from '../config/database';
import {VisitRecord, User} from '../types';

// Enable promise-based API for SQLite
enablePromise(true);

/**
 * Database Service Class
 * 
 * Provides methods for database initialization, CRUD operations on visits,
 * and user session management.
 */
class DatabaseService {
  private db: SQLiteDatabase | null = null;
  private initPromise: Promise<SQLiteDatabase> | null = null;

  /**
   * Initialize the database
   * Creates tables and indexes if they don't exist
   * 
   * @returns Promise<SQLiteDatabase> The initialized database instance
   */
  async initDatabase(): Promise<SQLiteDatabase> {
    // Return existing initialization promise if already in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return existing database if already initialized
    if (this.db) {
      return this.db;
    }

    // Create new initialization promise
    this.initPromise = this._initDatabaseInternal();
    
    try {
      this.db = await this.initPromise;
      return this.db;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Internal database initialization logic
   * 
   * @private
   */
  private async _initDatabaseInternal(): Promise<SQLiteDatabase> {
    try {
      console.log('Opening database...');
      
      // Open or create the database
      const database = await openDatabase({
        name: DB_NAME,
        location: 'default',
      });

      console.log('Database opened successfully');

      // Create visits table
      await database.executeSql(CREATE_TABLES_SQL.VISITS);
      console.log('Visits table created');

      // Create indexes for visits table
      await database.executeSql(CREATE_TABLES_SQL.VISITS_INDEXES);
      console.log('Visits table indexes created');

      // Create user_session table
      await database.executeSql(CREATE_TABLES_SQL.USER_SESSION);
      console.log('User session table created');

      console.log('Database initialization complete');
      
      return database;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  /**
   * Get the database instance
   * Initializes the database if not already initialized
   * 
   * @returns Promise<SQLiteDatabase> The database instance
   */
  private async getDatabase(): Promise<SQLiteDatabase> {
    if (!this.db) {
      await this.initDatabase();
    }
    return this.db!;
  }

  /**
   * Save a visit record to the database
   * 
   * @param record The visit record to save
   * @returns Promise<number> The ID of the inserted record
   */
  async saveVisit(record: VisitRecord): Promise<number> {
    const db = await this.getDatabase();
    
    const insertQuery = `
      INSERT INTO ${TABLES.VISITS} 
      (patient_name, blood_pressure, child_symptom, visit_date, created_at, sync_status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const result = await db.executeSql(insertQuery, [
        record.patientName,
        record.bloodPressure,
        record.childSymptom,
        record.visitDate,
        record.createdAt,
        record.syncStatus,
        record.userId,
      ]);

      const insertId = result[0].insertId;
      console.log('Visit record saved with ID:', insertId);
      return insertId;
    } catch (error) {
      console.error('Error saving visit record:', error);
      throw new Error(`Failed to save visit record: ${error}`);
    }
  }

  /**
   * Get all pending visits (sync_status = 'pending')
   * 
   * @returns Promise<VisitRecord[]> Array of pending visit records
   */
  async getPendingVisits(): Promise<VisitRecord[]> {
    const db = await this.getDatabase();
    
    const query = `
      SELECT * FROM ${TABLES.VISITS}
      WHERE sync_status = 'pending'
      ORDER BY created_at DESC
    `;

    try {
      const results = await db.executeSql(query);
      const visits: VisitRecord[] = [];

      if (results[0].rows.length > 0) {
        for (let i = 0; i < results[0].rows.length; i++) {
          const row = results[0].rows.item(i);
          visits.push(this._mapRowToVisitRecord(row));
        }
      }

      console.log(`Retrieved ${visits.length} pending visits`);
      return visits;
    } catch (error) {
      console.error('Error getting pending visits:', error);
      throw new Error(`Failed to get pending visits: ${error}`);
    }
  }

  /**
   * Get all visit records
   * 
   * @returns Promise<VisitRecord[]> Array of all visit records
   */
  async getAllVisits(): Promise<VisitRecord[]> {
    const db = await this.getDatabase();
    
    const query = `
      SELECT * FROM ${TABLES.VISITS}
      ORDER BY created_at DESC
    `;

    try {
      const results = await db.executeSql(query);
      const visits: VisitRecord[] = [];

      if (results[0].rows.length > 0) {
        for (let i = 0; i < results[0].rows.length; i++) {
          const row = results[0].rows.item(i);
          visits.push(this._mapRowToVisitRecord(row));
        }
      }

      console.log(`Retrieved ${visits.length} total visits`);
      return visits;
    } catch (error) {
      console.error('Error getting all visits:', error);
      throw new Error(`Failed to get all visits: ${error}`);
    }
  }

  /**
   * Update the sync status of a visit record
   * 
   * @param id The ID of the visit record
   * @param status The new sync status ('synced')
   * @returns Promise<void>
   */
  async updateSyncStatus(id: number, status: 'synced'): Promise<void> {
    const db = await this.getDatabase();
    
    const updateQuery = `
      UPDATE ${TABLES.VISITS}
      SET sync_status = ?
      WHERE id = ?
    `;

    try {
      await db.executeSql(updateQuery, [status, id]);
      console.log(`Updated sync status for visit ${id} to ${status}`);
    } catch (error) {
      console.error('Error updating sync status:', error);
      throw new Error(`Failed to update sync status: ${error}`);
    }
  }

  /**
   * Delete a visit record
   * 
   * @param id The ID of the visit record to delete
   * @returns Promise<void>
   */
  async deleteVisit(id: number): Promise<void> {
    const db = await this.getDatabase();
    
    const deleteQuery = `
      DELETE FROM ${TABLES.VISITS}
      WHERE id = ?
    `;

    try {
      await db.executeSql(deleteQuery, [id]);
      console.log(`Deleted visit record with ID: ${id}`);
    } catch (error) {
      console.error('Error deleting visit record:', error);
      throw new Error(`Failed to delete visit record: ${error}`);
    }
  }

  /**
   * Save user session to database
   * Only one session can exist at a time (enforced by CHECK constraint)
   * 
   * @param user The user session to save
   * @returns Promise<void>
   */
  async saveUserSession(user: User): Promise<void> {
    const db = await this.getDatabase();
    
    // First, clear any existing session
    await db.executeSql(`DELETE FROM ${TABLES.USER_SESSION}`);
    
    const insertQuery = `
      INSERT INTO ${TABLES.USER_SESSION}
      (id, user_id, name, phone_number, token, logged_in_at)
      VALUES (1, ?, ?, ?, ?, ?)
    `;

    try {
      await db.executeSql(insertQuery, [
        user.id,
        user.name,
        user.phoneNumber,
        user.token,
        new Date().toISOString(),
      ]);
      console.log('User session saved');
    } catch (error) {
      console.error('Error saving user session:', error);
      throw new Error(`Failed to save user session: ${error}`);
    }
  }

  /**
   * Get the current user session
   * 
   * @returns Promise<User | null> The current user session or null if not logged in
   */
  async getUserSession(): Promise<User | null> {
    const db = await this.getDatabase();
    
    const query = `SELECT * FROM ${TABLES.USER_SESSION} WHERE id = 1`;

    try {
      const results = await db.executeSql(query);
      
      if (results[0].rows.length > 0) {
        const row = results[0].rows.item(0);
        return {
          id: row.user_id,
          name: row.name,
          phoneNumber: row.phone_number,
          token: row.token,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user session:', error);
      throw new Error(`Failed to get user session: ${error}`);
    }
  }

  /**
   * Clear the user session (logout)
   * 
   * @returns Promise<void>
   */
  async clearUserSession(): Promise<void> {
    const db = await this.getDatabase();
    
    try {
      await db.executeSql(`DELETE FROM ${TABLES.USER_SESSION}`);
      console.log('User session cleared');
    } catch (error) {
      console.error('Error clearing user session:', error);
      throw new Error(`Failed to clear user session: ${error}`);
    }
  }

  /**
   * Close the database connection
   * 
   * @returns Promise<void>
   */
  async closeDatabase(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        console.log('Database closed');
        this.db = null;
      } catch (error) {
        console.error('Error closing database:', error);
        throw new Error(`Failed to close database: ${error}`);
      }
    }
  }

  /**
   * Drop all tables (for testing purposes)
   * 
   * @returns Promise<void>
   */
  async dropAllTables(): Promise<void> {
    const db = await this.getDatabase();
    
    try {
      await db.executeSql(`DROP TABLE IF EXISTS ${TABLES.VISITS}`);
      await db.executeSql(`DROP TABLE IF EXISTS ${TABLES.USER_SESSION}`);
      console.log('All tables dropped');
    } catch (error) {
      console.error('Error dropping tables:', error);
      throw new Error(`Failed to drop tables: ${error}`);
    }
  }

  /**
   * Map a database row to a VisitRecord object
   * 
   * @private
   * @param row The database row
   * @returns VisitRecord The mapped visit record
   */
  private _mapRowToVisitRecord(row: any): VisitRecord {
    return {
      id: row.id,
      patientName: row.patient_name,
      bloodPressure: row.blood_pressure,
      childSymptom: row.child_symptom,
      visitDate: row.visit_date,
      createdAt: row.created_at,
      syncStatus: row.sync_status as 'pending' | 'synced',
      userId: row.user_id,
    };
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();

// Export the class for testing purposes
export default DatabaseService;

// Export convenience functions for direct use
export const initDatabase = () => databaseService.initDatabase();
export const saveVisit = (record: VisitRecord) => databaseService.saveVisit(record);
export const getPendingVisits = () => databaseService.getPendingVisits();
export const getAllVisits = () => databaseService.getAllVisits();
export const updateSyncStatus = (id: number, status: 'synced') => databaseService.updateSyncStatus(id, status);
export const deleteVisit = (id: number) => databaseService.deleteVisit(id);
export const saveUserSession = (user: User) => databaseService.saveUserSession(user);
export const getUserSession = () => databaseService.getUserSession();
export const clearUserSession = () => databaseService.clearUserSession();
export const closeDatabase = () => databaseService.closeDatabase();
export const dropAllTables = () => databaseService.dropAllTables();
