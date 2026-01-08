-- Migration: Add document_data column to store complete mind map
-- Run this in Supabase SQL Editor

-- Add JSONB column to store the complete document (semantic map, sources, etc.)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_data JSONB;

-- Remove neo4j_doc_id column as it's no longer needed
ALTER TABLE documents DROP COLUMN IF EXISTS neo4j_doc_id;

-- Add index for JSONB queries (optional, for future performance)
CREATE INDEX IF NOT EXISTS idx_documents_data ON documents USING GIN(document_data);
