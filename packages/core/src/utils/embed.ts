import type { EmbedManyResult } from '@xsai/embed'

import { EmbeddingProvider } from '@tg-search/common'
import { useConfig } from '@tg-search/common/node'
import { Ok } from '@tg-search/result'
import { createOllama } from '@xsai-ext/providers-local'
import { embedMany } from '@xsai/embed'

async function callDashScopeEmbedding(contents: string[], embeddingConfig: any): Promise<EmbedManyResult> {
  const response = await fetch(`${embeddingConfig.apiBase || 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${embeddingConfig.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'TelegramSearch/1.0.0',
    },
    body: JSON.stringify({
      model: embeddingConfig.model || 'text-embedding-v4',
      input: contents,
      dimension: embeddingConfig.dimension?.toString() || '1536',
      encoding_format: 'float',
    }),
  })

  if (!response.ok) {
    throw new Error(`DashScope API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.data || !Array.isArray(data.data)) {
    throw new Error('Invalid response format from DashScope API')
  }

  return {
    embeddings: data.data.map((item: any) => item.embedding),
    usage: data.usage || { prompt_tokens: 0, total_tokens: 0 },
    input: contents,
  }
}

export async function embedContents(contents: string[]) {
  const embeddingConfig = useConfig().api.embedding

  let embeddings: EmbedManyResult
  switch (embeddingConfig.provider) {
    case EmbeddingProvider.OPENAI:
      embeddings = await embedMany({
        apiKey: embeddingConfig.apiKey,
        baseURL: embeddingConfig.apiBase || '',
        input: contents,
        model: embeddingConfig.model,
      })
      break
    case EmbeddingProvider.OLLAMA:
      embeddings = await embedMany({
        ...createOllama(embeddingConfig.apiBase).chat(embeddingConfig.model),
        input: contents,
      })
      break
    case EmbeddingProvider.DASHSCOPE:
      embeddings = await callDashScopeEmbedding(contents, embeddingConfig)
      break
    default:
      throw new Error(`Unsupported embedding model: ${embeddingConfig.provider}`)
  }

  return Ok({
    ...embeddings,
    dimension: embeddingConfig.dimension,
  })
}
