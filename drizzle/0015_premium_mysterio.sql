ALTER TABLE "chat_messages" ADD COLUMN "content_vector_2048" vector(2048);--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "description_vector_2048" vector(2048);--> statement-breakpoint
ALTER TABLE "stickers" ADD COLUMN "description_vector_2048" vector(2048);--> statement-breakpoint
CREATE INDEX "chat_messages_content_vector_2048_index" ON "chat_messages" USING hnsw ("content_vector_2048" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "photos_description_vector_2048_index" ON "photos" USING hnsw ("description_vector_2048" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "stickers_description_vector_2048_index" ON "stickers" USING hnsw ("description_vector_2048" vector_cosine_ops);