-- Migration: Add user_requests table for public form submissions
-- Created: 2026-01-21

-- Create user_requests table
CREATE TABLE IF NOT EXISTS user_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, rejected
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolved_by INTEGER,
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_requests_email ON user_requests(email);
