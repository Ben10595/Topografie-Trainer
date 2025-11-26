import React, { useState, useEffect } from 'react';
import { LocationManager } from './components/LocationManager';
import { MapQuiz } from './components/MapQuiz';
import { LocationData, DEFAULT_LOCATIONS } from './types';
import { Map as MapIcon } from 'lucide-react';

const STORAGE_KEY = 'topografie_trainer_data_v1';

export default function App() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isPickMode, setIsPickMode] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<{lat: number, lng: number} | null>(null);
  
  // New state to control fullscreen layout
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLocations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved locations");
        setLocations(DEFAULT_LOCATIONS);
      }
    } else {
      setLocations(DEFAULT_LOCATIONS);
    }
  }, []);

  // Save to localStorage whenever locations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }, [locations]);

  const handleAddLocation = (newLoc: LocationData) => {
    setLocations(prev => [...prev, newLoc]);
    setIsPickMode(false);
    setPickedCoordinates(null);
  };

  const handleUpdateLocation = (updatedLoc: LocationData) => {
    setLocations(prev => prev.map(loc => loc.id === updatedLoc.id ? updatedLoc : loc));
    setIsPickMode(false);
    setPickedCoordinates(null);
  };

  const handleDeleteLocation = (id: string) => {
    if (confirm('Möchtest du diesen Ort wirklich löschen?')) {
      setLocations(prev => prev.filter(loc => loc.id !== id));
    }
  };

  const handleImportLocations = (imported: LocationData[]) => {
    if (confirm('Möchtest du die vorhandenen Orte ersetzen (OK) oder hinzufügen (Abbrechen)?')) {
      setLocations(imported);
    } else {
      setLocations(prev => [...prev, ...imported]);
    }
  };

  const onPickCoordinate = (lat: number, lng: number) => {
    if (isPickMode) {
      setPickedCoordinates({ lat, lng });
      setIsPickMode(false); // Auto-exit pick mode after selection
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-slate-200 selection:bg-blue-500 selection:text-white">
      
      {/* Header - Hidden in Fullscreen Quiz Mode */}
      <header 
        className={`
          glass-panel z-50 transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          ${isQuizActive ? '-mt-24 opacity-0 pointer-events-none absolute' : 'mt-0 opacity-100 relative'}
          px-6 py-4 flex items-center justify-center shrink-0 mb-4 mx-4 mt-4 rounded-2xl
        `}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 text-white animate-marker-bounce">
            <MapIcon className="w-6 h-6" />
          </div>
          <div className="text-center md:text-left animate-fade-in-up">
            <h1 className="text-xl font-bold tracking-tight text-white">Topografie-Trainer</h1>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Interaktives Geografie-Lernen</p>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden gap-4 px-4 pb-4 relative">
        
        {/* Left Side: Management - Hidden in Quiz Mode */}
        <div 
          className={`
            transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]
            ${isQuizActive 
              ? 'w-0 opacity-0 translate-x-[-100px] pointer-events-none absolute' 
              : 'w-full md:w-1/3 lg:w-[350px] opacity-100 translate-x-0 relative'}
            flex flex-col h-full overflow-hidden
          `}
        >
          <LocationManager 
            locations={locations}
            onAddLocation={handleAddLocation}
            onUpdateLocation={handleUpdateLocation}
            onDeleteLocation={handleDeleteLocation}
            onImportLocations={handleImportLocations}
            onEnablePickMode={() => setIsPickMode(true)}
            pickedCoordinates={pickedCoordinates}
            isPickModeActive={isPickMode}
          />
        </div>

        {/* Right Side: Map - Expands in Quiz Mode */}
        <div 
          className={`
            relative transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]
            ${isQuizActive 
              ? 'fixed inset-0 z-[100] m-0 rounded-none w-full h-full' // Fullscreen styles
              : 'w-full flex-1 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/5 glass-panel'} // Normal styles
          `}
        >
          <MapQuiz 
            locations={locations}
            isPickMode={isPickMode}
            onPickCoordinate={onPickCoordinate}
            onQuizStatusChange={setIsQuizActive}
          />
          
          {/* Pick Mode Overlay Hint */}
          {isPickMode && !isQuizActive && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl shadow-blue-600/40 z-[1000] font-medium animate-bounce border-2 border-white/20 backdrop-blur-sm">
              Klicke auf die Karte, um die Position zu wählen
            </div>
          )}
        </div>
      </main>
    </div>
  );
}