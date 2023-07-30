import { PineconeClient } from "@pinecone-database/pinecone";

export const pinecone = new PineconeClient();

export const initPinecone = async () => {
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT) {
    throw new Error(
      "PINECONE_API_KEY and PINECONE_ENVIRONMENT environment variables must be set"
    );
  }

  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY as string,
    environment: process.env.PINECONE_ENVIRONMENT as string,
  });
};
