import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

// Only initialize Pinecone if API key is available
let pc: Pinecone | null = null;
if (process.env.PINECONE_API_KEY) {
  pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
}

// GET method to list all available namespaces in the ycaisus index
export async function GET() {
  try {
    // Check if Pinecone is initialized
    if (!pc) {
      return NextResponse.json(
        { error: 'Pinecone API key not configured' },
        { status: 500 }
      );
    }

    // Get the ycaisus index
    const index = pc.index('ycaisus');
    
    // List all namespaces in the index
    const stats = await index.describeIndexStats();
    
    console.log('Index stats:', stats);
    
    // Extract namespace names from the stats
    const namespaces = stats.namespaces ? Object.keys(stats.namespaces) : [];
    
    // Extract record counts for each namespace
    const namespaceStats = stats.namespaces ? Object.fromEntries(
      Object.entries(stats.namespaces).map(([name, data]: [string, any]) => [
        name, 
        data.recordCount || 0
      ])
    ) : {};
    
    return NextResponse.json({ 
      namespaces: namespaces,
      namespaceStats: namespaceStats,
      count: namespaces.length
    });

  } catch (error) {
    console.error('Error listing namespaces:', error);
    return NextResponse.json(
      { error: 'Failed to list namespaces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {

  try {
    // Check if Pinecone is initialized
    if (!pc) {
      return NextResponse.json(
        { error: 'Pinecone API key not configured' },
        { status: 500 }
      );
    }

    const { query, namespace } = await request.json();

    if (!query || !namespace) {
      return NextResponse.json(
        { error: 'Query and namespace are required' },
        { status: 400 }
      );
    }

    try {
      const index = pc.index('ycaisus');

      console.log('Searching in namespace:', namespace);
      console.log('Query:', query);

      // Generate embeddings for the query using Pinecone's inference API
      const model = 'multilingual-e5-large';
      
      let queryEmbedding: number[];
      try {
        const embeddingResponse = await pc.inference.embed(
          model,
          [query],
          { inputType: 'query', truncate: 'END' }
        );
        
        const embedding = embeddingResponse.data?.[0];
        
        if (!embedding) {
          throw new Error('Failed to generate query embedding');
        }
        
        // Handle both dense and sparse embeddings
        if ('values' in embedding) {
          queryEmbedding = embedding.values as number[];
        } else if ('vector' in embedding) {
          queryEmbedding = (embedding as any).vector;
        } else {
          throw new Error('Unsupported embedding format');
        }
        
        console.log('Generated embedding for query, dimension:', queryEmbedding.length);
      } catch (embeddingError) {
        console.error('Error generating query embedding:', embeddingError);
        return NextResponse.json(
          { error: 'Failed to generate query embedding' },
          { status: 500 }
        );
      }

      // Perform vector search using the generated embedding
      const queryResponse = await index.namespace(namespace).query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
        includeValues: false
      });

      console.log('Search results:', queryResponse);

      // Extract and format results
      const results = queryResponse.matches?.map(match => {
        const metadata = match.metadata || {};
        const score = match.score || 0;
        
        // Format the result based on available metadata
        let formattedResult = '';
        
        if (metadata.text) {
          formattedResult += `<div class="text-lg font-semibold mb-2">${metadata.text}</div>`;
        }
        
        if (metadata.title) {
          formattedResult += `<div class="text-sm text-gray-400 mb-2">Title: ${metadata.title}</div>`;
        }
        
        if (metadata.url) {
          formattedResult += `<div class="text-sm text-blue-400 mb-2"><a href="${metadata.url}" target="_blank" rel="noopener noreferrer">${metadata.url}</a></div>`;
        }
        
        if (metadata.source) {
          formattedResult += `<div class="text-sm text-gray-500 mb-2">Source: ${metadata.source}</div>`;
        }
        
        formattedResult += `<div class="text-xs text-gray-600">Relevance Score: ${(score * 100).toFixed(1)}%</div>`;
        
        return formattedResult || `<div class="text-gray-400">No metadata available (Score: ${(score * 100).toFixed(1)}%)</div>`;
      }) || [];

      return NextResponse.json({ 
        results: results,
        count: results.length,
        query: query,
        namespace: namespace
      });

    } catch (indexError) {
      console.error('Index error:', indexError);
      return NextResponse.json(
        { error: `Namespace '${namespace}' not found or inaccessible` },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 