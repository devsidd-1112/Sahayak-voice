/**
 * SQLite Database Configuration
 * 
 * Configuration for local SQLite database used for offline storage
 */

// Database name
export const DB_NAME = 'sahayak_voice.db';

// Database version
export const DB_VERSION = '1.0';

// Database display name
export const DB_DISPLAY_NAME = 'Sahayak Voice Local Database';

// Database size (in bytes)
export const DB_SIZE = 5 * 1024 * 1024; // 5 MB

// Table names
export const TABLES = {
  VISITS: 'visits',
  USER_SESSION: 'user_session',
};

// SQL statements for table creation
export const CREATE_TABLES_SQL = {
  VISITS: `
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT,
      blood_pressure TEXT,
      child_symptom TEXT,
      visit_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      user_id TEXT NOT NULL
    );
  `,
  VISITS_INDEXES: `
    CREATE INDEX IF NOT EXISTS idx_sync_status ON visits(sync_status);
    CREATE INDEX IF NOT EXISTS idx_user_id ON visits(user_id);
    CREATE INDEX IF NOT EXISTS idx_visit_date ON visits(visit_date);
  `,
  USER_SESSION: `
    CREATE TABLE IF NOT EXISTS user_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      token TEXT NOT NULL,
      logged_in_at TEXT NOT NULL
    );
  `,
};
