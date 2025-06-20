'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [dialRotation, setDialRotation] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const lastScrollTime = useRef(0);
  const scrollDelay = 150; // Minimum time between scroll events in milliseconds

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
  }, []);

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

  const handleDialScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Check if enough time has passed since last scroll
    const currentTime = Date.now();
    if (currentTime - lastScrollTime.current < scrollDelay) {
      return; // Ignore this scroll event
    }
    lastScrollTime.current = currentTime;
    
    if (namespaces.length === 0) return;
    
    const delta = e.deltaY;
    const segmentAngle = 180 / (namespaces.length - 1);
    
    // Find current selected index
    const currentIndex = namespaces.indexOf(selectedNamespace);
    
    // Calculate new index based on scroll direction (with boundaries)
    let newIndex;
    if (delta > 0) {
      newIndex = Math.min(currentIndex + 1, namespaces.length - 1); // Stop at bottom
    } else {
      newIndex = Math.max(currentIndex - 1, 0); // Stop at top
    }
    
    // Set new rotation and selected namespace
    const newRotation = newIndex * segmentAngle;
    setDialRotation(newRotation);
    setSelectedNamespace(namespaces[newIndex]);
  };

  const selectNamespace = (namespace: string, index: number) => {
    setSelectedNamespace(namespace);
    const segmentAngle = 180 / (namespaces.length - 1);
    setDialRotation(index * segmentAngle);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Loading Overlay */}
      {namespacesLoading && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} w-full`}>
        {/* Left side - Search */}
        <div className={`${isMobile ? 'w-full' : 'flex-1'} flex flex-col justify-center items-center p-8`}>
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light mb-2">Search</h1>
              <p className="text-gray-400 text-sm">YC Opportunities At Your Fingertips</p>
            </div>

            {/* Mobile Namespace Dropdown */}
            {isMobile && namespaces.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Select Namespace</label>
                <select
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                  disabled={namespacesLoading}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                >
                  {namespaces.map((namespace) => (
                    <option key={namespace} value={namespace}>
                      {namespace} ({namespaceStats[namespace] || 0} items)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Input */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="What are you looking for?"
                  disabled={!selectedNamespace || namespacesLoading}
                  className="w-full px-0 py-4 bg-transparent border-0 border-b border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors text-lg font-light disabled:opacity-50"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !selectedNamespace || namespacesLoading || !query.trim()}
              className="w-full py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>

            <center>
            <p className="text-gray-400 text-sm mt-4">A <u><a className="text-white" href="https://jasonxu.me/contact">Jason Xu</a></u> project</p>
            </center>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Namespace Dial (Desktop Only) */}
        {!isMobile && (
          <div className="w-96 flex flex-col justify-center items-end p-8">
            {namespacesError ? (
              <div className="text-center">
                <p className="text-red-400 text-sm">{namespacesError}</p>
              </div>
            ) : namespaces.length === 0 ? (
              <div className="text-center">
                <p className="text-yellow-400 text-sm">No namespaces available</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-start">
                {/* Orbital Text Container */}
                <div 
                  className="relative w-[500px] h-[500px] cursor-pointer select-none"
                  onWheel={handleDialScroll}
                  style={{ transform: 'translateX(-350px)' }}
                >
                  {/* Namespace Options in Orbital Pattern */}
                  {namespaces.map((namespace, index) => {
                    const angle = (index * 180) / (namespaces.length - 1) - dialRotation; // 180 degree arc
                    const radian = (angle * Math.PI) / 180;
                    const radius = 240;
                    const x = Math.cos(radian) * radius;
                    const y = Math.sin(radian) * radius;
                    const isSelected = namespace === selectedNamespace;
                    
                    // Calculate rotation for text to point inward
                    const textRotation = angle; // Adding 180 to point outward
                    
                    // Calculate fade based on distance from selected
                    const selectedIndex = namespaces.indexOf(selectedNamespace);
                    const distance = Math.abs(index - selectedIndex);
                    const maxDistance = Math.max(selectedIndex, namespaces.length - 1 - selectedIndex);
                    const fadeOpacity = maxDistance > 0 ? Math.max(0.1, 1 - (distance / maxDistance) * 0.9) : 1;
                    
                    return (
                      <div
                        key={namespace}
                        className={`text-left absolute transform -translate-y-1/2 cursor-pointer transition-all duration-500 ${
                          isSelected ? 'scale-125 z-10' : 'scale-100 hover:scale-110'
                        }`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                        }}
                        onClick={() => selectNamespace(namespace, index)}
                      >
                        <div className={`transition-all duration-300 whitespace-nowrap ${
                          isSelected 
                            ? 'text-white' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={{ opacity: fadeOpacity }}
                        >
                          <div className={`font-light transition-all duration-300 ${
                            isSelected ? 'text-3xl' : 'text-xl'
                          }`}>
                            {namespace}
                          </div>
                          <div className={`text-xs opacity-70 mt-1 transition-all duration-300 ${
                            isSelected ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {namespaceStats[namespace] || 0} items
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Center Reference Point */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
                </div>
                
                {/* Instructions */}
                <div className="absolute bottom-8 text-center">
                  <p className="text-gray-500 text-sm">Scroll to navigate • Click to select</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Overlay */}
      {results.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-light">
                Results for "{query}"
              </h2>
              <button
                onClick={() => setResults([])}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="border border-gray-800 rounded-lg p-6 hover:border-gray-600 transition-colors"
                  dangerouslySetInnerHTML={{ __html: result }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
