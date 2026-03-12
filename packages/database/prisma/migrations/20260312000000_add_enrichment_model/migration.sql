-- Add enrichment_model column to track which LLM model was used for vectorization
ALTER TABLE "skills" ADD COLUMN "enrichment_model" TEXT;
