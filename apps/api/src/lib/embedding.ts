import OpenAI from "openai";

const EMBEDDING_DIMENSIONS = 1536;
const EMBEDDING_MODEL = "text-embedding-3-small";

/** Maximum number of texts per OpenAI embedding API call. */
const BATCH_SIZE = 100;

export class OpenAIEmbeddingProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async embedQuery(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    const embedding = response.data[0].embedding;
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`
      );
    }
    return embedding;
  }

  /**
   * Embed multiple texts in batches.
   *
   * OpenAI accepts an array of strings as input. We chunk into batches of
   * BATCH_SIZE to stay within API limits and return embeddings in the same
   * order as the input texts.
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const allEmbeddings: number[][] = new Array(texts.length);

    for (let offset = 0; offset < texts.length; offset += BATCH_SIZE) {
      const batch = texts.slice(offset, offset + BATCH_SIZE);

      const response = await this.client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
      });

      // OpenAI returns embeddings with an `index` field matching input order
      for (const item of response.data) {
        const embedding = item.embedding;
        if (embedding.length !== EMBEDDING_DIMENSIONS) {
          throw new Error(
            `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`
          );
        }
        allEmbeddings[offset + item.index] = embedding;
      }
    }

    return allEmbeddings;
  }
}
