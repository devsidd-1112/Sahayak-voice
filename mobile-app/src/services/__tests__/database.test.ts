/**
 * Database Service Tests
 * 
 * Unit tests for the database service initialization and basic operations
 */

import DatabaseService from '../database';
import { VisitRecord, User } from '../../types';

// Mock the SQLite module
jest.mock('react-native-sqlite-storage', () => {
  const mockExecuteSql = jest.fn((sql: string, params?: any[]) => {
    // Mock successful execution
    return Promise.resolve([
      {
        rows: {
          length: 0,
          item: (index: number) => null,
        },
        insertId: 1,
        rowsAffected: 1,
      },
    ]);
  });

  return {
    openDatabase: jest.fn(() =>
      Promise.resolve({
        executeSql: mockExecuteSql,
        close: jest.fn(() => Promise.resolve()),
      })
    ),
    enablePromise: jest.fn(),
  };
});

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = new DatabaseService();
    jest.clearAllMocks();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const db = await dbService.initDatabase();
      expect(db).toBeDefined();
    });

    it('should create visits table on initialization', async () => {
      const SQLite = require('react-native-sqlite-storage');
      await dbService.initDatabase();
      
      // Check that executeSql was called for table creation
      const mockDb = await SQLite.openDatabase();
      expect(mockDb.executeSql).toHaveBeenCalled();
    });

    it('should create user_session table on initialization', async () => {
      const SQLite = require('react-native-sqlite-storage');
      await dbService.initDatabase();
      
      const mockDb = await SQLite.openDatabase();
      expect(mockDb.executeSql).toHaveBeenCalled();
    });

    it('should create indexes on initialization', async () => {
      const SQLite = require('react-native-sqlite-storage');
      await dbService.initDatabase();
      
      const mockDb = await SQLite.openDatabase();
      // Verify executeSql was called multiple times (tables + indexes)
      expect(mockDb.executeSql).toHaveBeenCalledTimes(3);
    });
  });

  describe('Visit Record Operations', () => {
    const mockVisitRecord: VisitRecord = {
      patientName: 'Test Patient',
      bloodPressure: '120/80',
      childSymptom: 'Fever',
      visitDate: '2024-01-20',
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      userId: 'user123',
    };

    it('should save a visit record', async () => {
      const id = await dbService.saveVisit(mockVisitRecord);
      expect(id).toBe(1);
    });

    it('should handle save errors gracefully', async () => {
      // First initialize the database successfully
      await dbService.initDatabase();
      
      // Then mock executeSql to fail on the next call (the INSERT)
      const SQLite = require('react-native-sqlite-storage');
      const mockDb = await SQLite.openDatabase();
      mockDb.executeSql.mockRejectedValueOnce(new Error('Database error'));

      await expect(dbService.saveVisit(mockVisitRecord)).rejects.toThrow(
        'Failed to save visit record'
      );
    });
  });

  describe('User Session Operations', () => {
    const mockUser: User = {
      id: 'user123',
      name: 'Test User',
      phoneNumber: '1234567890',
      token: 'test-token',
    };

    it('should save user session', async () => {
      await expect(dbService.saveUserSession(mockUser)).resolves.not.toThrow();
    });

    it('should handle session save errors gracefully', async () => {
      // First initialize the database successfully
      await dbService.initDatabase();
      
      // Then mock executeSql to fail on subsequent calls (DELETE and INSERT)
      const SQLite = require('react-native-sqlite-storage');
      const mockDb = await SQLite.openDatabase();
      // Mock successful DELETE, then failed INSERT
      mockDb.executeSql.mockResolvedValueOnce([{rows: {length: 0}, rowsAffected: 0}]);
      mockDb.executeSql.mockRejectedValueOnce(new Error('Database error'));

      await expect(dbService.saveUserSession(mockUser)).rejects.toThrow(
        'Failed to save user session'
      );
    });
  });

  describe('Database Cleanup', () => {
    it('should close database connection', async () => {
      await dbService.initDatabase();
      await expect(dbService.closeDatabase()).resolves.not.toThrow();
    });

    it('should drop all tables', async () => {
      await dbService.initDatabase();
      await expect(dbService.dropAllTables()).resolves.not.toThrow();
    });
  });
});
