import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

import { initPinecone, pinecone } from "@/lib/pinecone";
import { getRedisClient } from "@/lib/upstash";

export const runtime = "edge";

const QA_UNDERLYING_PROMPT_TEMPLATE = `Given the following conversation and a follow up question, return the conversation history excerpt that includes any relevant context to the question if it exists and rephrase the follow up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Your answer should follow the following format:
\`\`\`
Use the following pieces of conversation context to answer the users question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
Relevant chat history excerpt:
<Relevant chat history excerpt as context here or "N/A" if nothing found>

Question: <Rephrased question here>
\`\`\`
Your answer:
`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const { stream, handlers } = LangChainStream();

  await initPinecone();

  const pineconeIndex = pinecone.Index("my-index");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    {
      pineconeIndex,
      namespace: "demo-ai-chat",
      textKey: "content",
    }
  );

  const mainLLM = new ChatOpenAI({
    streaming: true,
    modelName: "gpt-4",
    callbacks: [handlers],
  });

  const underlyingLLM = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
  });

  const chatHistory = new UpstashRedisChatMessageHistory({
    sessionId: "chat-session-1",
    client: await getRedisClient(),
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    mainLLM,
    vectorStore.asRetriever(),
    {
      memory: new BufferMemory({
        memoryKey: "chat_history",
        inputKey: "question",
        outputKey: "text",
        returnMessages: true,
        chatHistory,
      }),
      questionGeneratorChainOptions: {
        llm: underlyingLLM,
        template: QA_UNDERLYING_PROMPT_TEMPLATE,
      },
    }
  );

  chain
    .call({
      question: messages[messages.length - 1].content,
    })
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
