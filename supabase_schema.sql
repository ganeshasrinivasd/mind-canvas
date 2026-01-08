-- Supabase Schema for MindCanvas Neural Intelligence Platform
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents metadata table (references Neo4j graph)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('topic', 'text', 'pdf')),
  style_preset TEXT NOT NULL CHECK (style_preset IN ('study', 'executive', 'legal', 'technical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  neo4j_doc_id TEXT NOT NULL,  -- References Neo4j Document.id
  char_count INTEGER,
  page_count INTEGER,
  is_archived BOOLEAN DEFAULT FALSE
);

-- View snapshots table (saves canvas state)
CREATE TABLE IF NOT EXISTS view_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  viewport JSONB NOT NULL,           -- {x, y, zoom}
  node_state JSONB NOT NULL,         -- {nodeId: {pos, collapsed, locked, color}}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_current BOOLEAN DEFAULT TRUE
);

-- Insights table (for Phase 5 - proactive suggestions)
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_ids UUID[] NOT NULL,      -- Can span multiple docs
  insight_type TEXT NOT NULL CHECK (insight_type IN ('gap', 'connection', 'contradiction', 'community', 'question')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_archived ON documents(is_archived);
CREATE INDEX IF NOT EXISTS idx_view_snapshots_doc ON view_snapshots(document_id);
CREATE INDEX IF NOT EXISTS idx_view_snapshots_current ON view_snapshots(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_insights_docs ON insights USING GIN(document_ids);
CREATE INDEX IF NOT EXISTS idx_insights_dismissed ON insights(dismissed);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- View snapshots policies
CREATE POLICY "Users can view snapshots of their documents"
  ON view_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = view_snapshots.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert snapshots for their documents"
  ON view_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = view_snapshots.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update snapshots of their documents"
  ON view_snapshots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = view_snapshots.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete snapshots of their documents"
  ON view_snapshots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = view_snapshots.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Insights policies (allow read for any insights related to user's documents)
CREATE POLICY "Users can view insights for their documents"
  ON insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = ANY(insights.document_ids)
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can dismiss insights for their documents"
  ON insights FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = ANY(insights.document_ids)
      AND documents.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to mark previous snapshots as not current
CREATE OR REPLACE FUNCTION mark_previous_snapshots_not_current()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE view_snapshots
    SET is_current = false
    WHERE document_id = NEW.document_id
    AND id != NEW.id
    AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one current snapshot per document
CREATE TRIGGER ensure_single_current_snapshot
  BEFORE INSERT OR UPDATE ON view_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION mark_previous_snapshots_not_current();
