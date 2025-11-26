import React, { useState, useRef } from 'react';
import { LocationData, LocationCategory } from '../types';
import { Button } from './Button';
import { Download, Upload, MapPin, Trash2, Edit2, Check, X, Plus } from 'lucide-react';

interface LocationManagerProps {
  locations: LocationData[];
  onAddLocation: (loc: LocationData) => void;
  onUpdateLocation: (loc: LocationData) => void;
  onDeleteLocation: (id: string) => void;
  onImportLocations: (locs: LocationData[]) => void;
  onEnablePickMode: () => void;
  pickedCoordinates: { lat: number; lng: number } | null;
  isPickModeActive: boolean;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onImportLocations,
  onEnablePickMode,
  pickedCoordinates,
  isPickModeActive
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LocationCategory>(LocationCategory.CITY);
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update inputs when pickedCoordinates change from the map
  React.useEffect(() => {
    if (pickedCoordinates) {
      setLat(pickedCoordinates.lat.toFixed(6));
      setLng(pickedCoordinates.lng.toFixed(6));
    }
  }, [pickedCoordinates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lat || !lng) return;

    const newLocation: LocationData = {
      id: editingId || crypto.randomUUID(),
      name,
      category,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    if (editingId) {
      onUpdateLocation(newLocation);
      setEditingId(null);
    } else {
      onAddLocation(newLocation);
    }
    
    // Reset form
    setName('');
    setLat('');
    setLng('');
    setCategory(LocationCategory.CITY);
  };

  const handleEdit = (loc: LocationData) => {
    setEditingId(loc.id);
    setName(loc.name);
    setCategory(loc.category);
    setLat(loc.lat.toString());
    setLng(loc.lng.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setLat('');
    setLng('');
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(locations, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "topografie_daten.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          onImportLocations(imported);
        } else {
          alert('Ungültiges Dateiformat. Erwarte ein JSON-Array.');
        }
      } catch (err) {
        alert('Fehler beim Lesen der Datei.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper for input styles - Dark Mode
  const inputClass = "block w-full rounded-xl border-none bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 shadow-sm ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-slate-900/80 transition-all outline-none";

  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
      {/* Editor Section */}
      <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md relative z-10">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
          <Edit2 className="w-4 h-4 mr-2 text-blue-400" />
          {editingId ? 'Ort bearbeiten' : 'Neuer Ort'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Name des Ortes (z.B. Berlin)"
              required
            />
          </div>
          
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as LocationCategory)}
              className={inputClass}
            >
              {Object.values(LocationCategory).map((cat) => (
                <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={`${inputClass} pl-3`}
                placeholder="Lat"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 pointer-events-none">N/S</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={`${inputClass} pl-3`}
                placeholder="Lng"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 pointer-events-none">E/W</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
             <Button 
              type="button" 
              variant={isPickModeActive ? "success" : "secondary"}
              size="sm"
              onClick={onEnablePickMode}
              className="flex-1"
            >
              <MapPin className="w-4 h-4 mr-1.5" />
              {isPickModeActive ? 'Wähle...' : 'Karte'}
            </Button>
            <Button type="submit" size="sm" className="flex-[2]">
              {editingId ? <><Check className="w-4 h-4 mr-2"/> Speichern</> : <><Plus className="w-4 h-4 mr-2"/> Hinzufügen</>}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" size="sm" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-auto p-4 bg-black/10">
        {locations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8 animate-fade-in-up delay-100">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">Keine Orte vorhanden</p>
            <p className="text-xs mt-1 opacity-50">Nutze das Formular oder importiere Daten.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10 sticky top-0 bg-[#162032] z-10 pt-2 -mt-2 mb-2">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gespeicherte Orte</span>
               <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{locations.length}</span>
            </div>
            {locations.map((loc, index) => (
              <div 
                key={loc.id} 
                className="group glass-card rounded-xl p-3 flex items-center justify-between transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 hover:scale-[1.02] animate-pop-in"
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-200 text-sm truncate">{loc.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-bold bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded-md border border-blue-500/20">
                      {loc.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(loc)} 
                    className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors hover:scale-110 active:scale-90"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteLocation(loc.id)} 
                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors hover:scale-110 active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={handleExport}>
          <Download className="w-3 h-3 mr-1.5" /> Export
        </Button>
        <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-3 h-3 mr-1.5" /> Import
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleImport}
        />
      </div>
    </div>
  );
};