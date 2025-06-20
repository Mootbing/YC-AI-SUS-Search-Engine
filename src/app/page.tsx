'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [namespaceStats, setNamespaceStats] = useState<{[key: string]: number}>({});
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [namespacesLoading, setNamespacesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [namespacesError, setNamespacesError] = useState<string | null>(null);

  // Fetch available namespaces on component mount
  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        setNamespacesLoading(true);
        setNamespacesError(null);
        
        const response = await fetch('/api/search', {
          method: 'GET',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch namespaces');
        }

        const data = await response.json();
        const availableNamespaces = data.namespaces || [];
        const stats = data.namespaceStats || {};
        
        setNamespaces(availableNamespaces);
        setNamespaceStats(stats);
        
        // Set the first namespace as selected if available
        if (availableNamespaces.length > 0 && !selectedNamespace) {
          setSelectedNamespace(availableNamespaces[0]);
        }
      } catch (error) {
        console.error('Error fetching namespaces:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load available namespaces';
        setNamespacesError(errorMessage);
      } finally {
        setNamespacesLoading(false);
      }
    };

    fetchNamespaces();
  }, []); // Empty dependency array - only run on mount

  const handleSearch = async () => {
    if (!query.trim() || !selectedNamespace) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          namespace: selectedNamespace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search request failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error performing search. Please try again.';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      {/* Glass morphic container */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            YC AI SUS Search
          </h1>
          <p className="text-gray-400 text-lg">
            Search through curated startup and tech content
          </p>
        </div>

        {/* Search container with glass effect */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
          {/* Namespace selector */}
          <div className="mb-6">
            
            {namespacesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : namespacesError ? (
              <div className="backdrop-blur-xl bg-red-500/10 rounded-2xl border border-red-400/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <p className="text-red-300">{namespacesError}</p>
                </div>
              </div>
            ) : namespaces.length === 0 ? (
              <div className="backdrop-blur-xl bg-yellow-500/10 rounded-2xl border border-yellow-400/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <p className="text-yellow-300">No namespaces available. Please check your Pinecone configuration.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {namespaces.map((namespace) => (
                  <button
                    key={namespace}
                    onClick={() => setSelectedNamespace(namespace)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedNamespace === namespace
                        ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-300'
                        : 'bg-white/5 border-2 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <div>{namespace}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {namespaceStats[namespace] || 0}+ matches
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search input */}
          {!namespacesLoading && <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your search query..."
                disabled={!selectedNamespace || namespacesLoading}
                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !selectedNamespace || namespacesLoading}
                className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>}
        </div>

        {/* Error display */}
        {error && (
          <div className="backdrop-blur-xl bg-red-500/10 rounded-3xl border border-red-400/20 shadow-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Results container */}
        {results.length > 0 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Search Results for "{query}" in {selectedNamespace}
            </h2>
            <div className="space-y-6">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200"
                  dangerouslySetInnerHTML={{ __html: result }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Searching through {selectedNamespace}...</p>
          </div>
        )}
      </div>
    </div>
  );
}
