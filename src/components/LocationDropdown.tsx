'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface LocationDropdownProps {
  selectedLocation: string;
  onSelect: (location: string) => void;
}

export default function LocationDropdown({ selectedLocation, onSelect }: LocationDropdownProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Load locations from JSON file
  useEffect(() => {
    async function loadLocations() {
      try {
        const response = await fetch('/test-data/locations.json');
        if (!response.ok) throw new Error('Failed to load locations');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    }
    
    loadLocations();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fuzzy search filter
  const filteredLocations = locations.filter(location => 
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleLocationSelect(location: string) {
    onSelect(location);
    setSearchTerm('');
    setIsOpen(false);
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Location
      </label>
      
      <div className="relative">
        <div 
          className="flex items-center justify-between w-full border border-gray-300 rounded-md p-2 bg-white cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={`flex-1 truncate ${selectedLocation ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedLocation || "Select a location"}
          </div>
          <button 
            type="button"
            className="focus:outline-none text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onSelect('');
            }}
          >
            {selectedLocation && <X size={16} />}
          </button>
        </div>

        {isOpen && (
          <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
            <div className="sticky top-0 bg-white p-2 border-b">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="py-1">
              {filteredLocations.length > 0 ? (
                filteredLocations.slice(0, 100).map((location, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleLocationSelect(location)}
                  >
                    {location}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No locations found</div>
              )}
              
              {filteredLocations.length > 100 && (
                <div className="px-4 py-2 text-xs text-gray-500 italic">
                  Showing first 100 results, continue typing to narrow your search...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
