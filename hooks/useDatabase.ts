import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

interface BookmarkItem {
  id: number;
  url: string;
  title: string;
  created_at: string;
}

interface HistoryItem {
  id: number;
  url: string;
  title: string;
  visited_at: string;
}

export function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync('browser.db');
      
      // Create tables if they don't exist
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT NOT NULL,
          title TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT NOT NULL,
          title TEXT NOT NULL,
          visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url);
        CREATE INDEX IF NOT EXISTS idx_history_url ON history(url);
        CREATE INDEX IF NOT EXISTS idx_history_visited_at ON history(visited_at DESC);
      `);

      setDb(database);
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  const addBookmark = async (url: string, title: string): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // Check if bookmark already exists
      const existing = await db.getFirstAsync(
        'SELECT id FROM bookmarks WHERE url = ?',
        [url]
      );
      
      if (existing) {
        throw new Error('Bookmark already exists');
      }
      
      await db.runAsync(
        'INSERT INTO bookmarks (url, title) VALUES (?, ?)',
        [url, title]
      );
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  const removeBookmark = async (id: number): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    try {
      await db.runAsync('DELETE FROM bookmarks WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  };

  const getBookmarks = async (): Promise<BookmarkItem[]> => {
    if (!db) return [];
    
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM bookmarks ORDER BY created_at DESC'
      );
      return result as BookmarkItem[];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  };

  const addToHistory = async (url: string, title: string): Promise<void> => {
    if (!db) return;
    
    try {
      // Remove existing entry for this URL to avoid duplicates
      await db.runAsync('DELETE FROM history WHERE url = ?', [url]);
      
      // Add new entry
      await db.runAsync(
        'INSERT INTO history (url, title) VALUES (?, ?)',
        [url, title]
      );
      
      // Keep only last 1000 history items
      await db.runAsync(`
        DELETE FROM history WHERE id NOT IN (
          SELECT id FROM history ORDER BY visited_at DESC LIMIT 1000
        )
      `);
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  const getHistory = async (): Promise<HistoryItem[]> => {
    if (!db) return [];
    
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM history ORDER BY visited_at DESC LIMIT 100'
      );
      return result as HistoryItem[];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  };

  const removeHistoryItem = async (id: number): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    try {
      await db.runAsync('DELETE FROM history WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error removing history item:', error);
      throw error;
    }
  };

  const clearHistory = async (): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    try {
      await db.runAsync('DELETE FROM history');
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  };

  return {
    addBookmark,
    removeBookmark,
    getBookmarks,
    addToHistory,
    getHistory,
    removeHistoryItem,
    clearHistory,
  };
}