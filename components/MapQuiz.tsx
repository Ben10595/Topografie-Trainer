import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, useMapEvents, Polyline, CircleMarker } from 'react-leaflet';
import { LocationData, LocationCategory, QuizState } from '../types';
import { Button } from './Button';
import { calculateDistance } from '../utils/geo';
import { Play, RotateCcw, Trophy, XCircle, MapPin, Navigation } from 'lucide-react';

// Interaction handler for the map
const MapEvents = ({ 
  onMapClick 
}: { 
  onMapClick: (e: { lat: number; lng: number }) => void 
}) => {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

interface MapQuizProps {
  locations: LocationData[];
  isPickMode: boolean;
  onPickCoordinate: (lat: number, lng: number) => void;
  onQuizStatusChange: (isActive: boolean) => void;
}

export const MapQuiz: React.FC<MapQuizProps> = ({
  locations,
  isPickMode,
  onPickCoordinate,
  onQuizStatusChange
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('Alle');
  const [quizState, setQuizState] = useState<QuizState>({
    isActive: false,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    showResult: false,
    lastGuessDistance: null,
    lastGuessCoords: null,
    isFinished: false
  });

  // Notify App parent component when quiz status changes
  useEffect(() => {
    onQuizStatusChange(quizState.isActive);
  }, [quizState.isActive, onQuizStatusChange]);

  const currentQuestion = quizState.isActive && !quizState.isFinished 
    ? quizState.questions[quizState.currentQuestionIndex] 
    : null;

  const handleStartQuiz = () => {
    if (locations.length === 0) {
      alert("Bitte lege zuerst Orte an, bevor du ein Quiz startest.");
      return;
    }

    const filtered = filterCategory === 'Alle' 
      ? locations 
      : locations.filter(l => l.category === filterCategory);

    if (filtered.length === 0) {
      alert("Keine Orte in dieser Kategorie gefunden.");
      return;
    }

    // Shuffle
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    setQuizState({
      isActive: true,
      questions: shuffled,
      currentQuestionIndex: 0,
      score: 0,
      showResult: false,
      lastGuessDistance: null,
      lastGuessCoords: null,
      isFinished: false
    });
  };

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    // Priority 1: Pick Mode (Location Manager)
    if (isPickMode) {
      onPickCoordinate(coords.lat, coords.lng);
      return;
    }

    // Priority 2: Quiz Mode
    if (quizState.isActive && !quizState.showResult && !quizState.isFinished && currentQuestion) {
      const distance = calculateDistance(
        currentQuestion.lat, currentQuestion.lng,
        coords.lat, coords.lng
      );

      // Threshold for "correct" answer: 50km
      const isCorrect = distance <= 50;

      setQuizState(prev => ({
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        showResult: true,
        lastGuessDistance: distance,
        lastGuessCoords: coords
      }));
    }
  };

  const nextQuestion = () => {
    if (quizState.currentQuestionIndex >= quizState.questions.length - 1) {
      setQuizState(prev => ({ ...prev, isFinished: true, showResult: false }));
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showResult: false,
        lastGuessDistance: null,
        lastGuessCoords: null
      }));
    }
  };

  const resetQuiz = () => {
    setQuizState({
      isActive: false,
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      showResult: false,
      lastGuessDistance: null,
      lastGuessCoords: null,
      isFinished: false
    });
  };

  const isCorrect = quizState.lastGuessDistance !== null && quizState.lastGuessDistance <= 50;

  return (
    <div className="h-full relative flex flex-col w-full">
      
      {/* 
        HUD - Fullscreen Quiz Header (The Floating Glass Bar) 
        Only visible when quiz is ACTIVE
      */}
      {quizState.isActive && !quizState.isFinished && (
        <div className="absolute top-0 left-0 right-0 p-6 z-[500] pointer-events-none flex justify-center">
          <div className="glass-bar-dark rounded-2xl px-8 py-4 flex items-center gap-8 shadow-2xl pointer-events-auto transform transition-all animate-slide-down border border-white/10">
            
            {/* Score Pill */}
            <div className="flex flex-col items-center border-r border-white/10 pr-6">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Score</span>
              {/* Key ensures animation triggers on change */}
              <span key={quizState.score} className="text-2xl font-bold font-mono text-blue-400 animate-pulse-once">
                {quizState.score} <span className="text-white/30 text-lg">/ {quizState.questions.length}</span>
              </span>
            </div>

            {/* Question Center */}
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Finde diesen Ort auf der Karte</div>
              <div key={currentQuestion?.id} className="text-3xl font-bold text-white drop-shadow-md flex items-center justify-center gap-3 animate-fade-in-up">
                <MapPin className="text-red-400 animate-pulse w-6 h-6" />
                {currentQuestion?.name}
              </div>
            </div>

            {/* Actions */}
            <div className="pl-6 border-l border-white/10">
              <Button onClick={resetQuiz} variant="glass" size="sm" className="rounded-full h-10 w-10 p-0 flex items-center justify-center hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/30 transition-transform">
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 
        Standard Header (Not in Quiz Mode) 
        Styled as a transparent overlay control inside the map container
      */}
      {!quizState.isActive && (
        <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-start pointer-events-none">
          <div className="glass-card rounded-2xl p-2 pointer-events-auto flex items-center gap-2 shadow-lg bg-slate-900/80 border-slate-700 animate-fade-in-up">
             <div className="pl-2 pr-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Filter</label>
                <select 
                  className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer min-w-[120px]"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option className="text-black" value="Alle">Alle Kategorien</option>
                  {Object.values(LocationCategory).map(c => (
                    <option className="text-black" key={c} value={c}>{c}</option>
                  ))}
                </select>
             </div>
             <div className="h-8 w-px bg-slate-600 mx-1"></div>
             <Button onClick={handleStartQuiz} variant="primary" className="rounded-xl shadow-blue-500/20 border border-blue-500/50">
                <Play className="w-4 h-4 mr-2 fill-current" /> Quiz starten
             </Button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer 
          center={[51.1657, 10.4515]} // Center of Germany
          zoom={6} 
          style={{ height: '100%', width: '100%', background: '#aad3df' }}
          zoomControl={false}
          className="outline-none"
        >
          {/* German OpenStreetMap Tiles (Light, German Labels) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          />
          <MapEvents onMapClick={handleMapClick} />

          {/* Render markers only if NOT in quiz mode */}
          {!quizState.isActive && locations.map(loc => (
            <CircleMarker 
              key={loc.id} 
              center={[loc.lat, loc.lng]}
              pathOptions={{ 
                color: '#1e293b', // Darker border for light map
                weight: 2,
                fillColor: '#3b82f6', 
                fillOpacity: 0.8 
              }}
              radius={8}
            >
              <Popup className="glass-popup">
                <div className="text-center">
                  <strong className="text-lg block text-white">{loc.name}</strong>
                  <span className="text-xs uppercase font-bold text-blue-400 bg-blue-900/30 border border-blue-500/30 px-2 py-0.5 rounded-full mt-1 inline-block">{loc.category}</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Quiz Result Visualization */}
          {quizState.isActive && quizState.showResult && currentQuestion && quizState.lastGuessCoords && (
            <>
              {/* Correct Location - Green */}
              <CircleMarker 
                center={[currentQuestion.lat, currentQuestion.lng]} 
                pathOptions={{ color: '#fff', weight: 3, fillColor: '#22c55e', fillOpacity: 1 }} 
                radius={10}
              />
              
              {/* User Guess */}
              <CircleMarker 
                center={[quizState.lastGuessCoords.lat, quizState.lastGuessCoords.lng]} 
                pathOptions={{ 
                  color: '#fff', 
                  weight: 3,
                  fillColor: isCorrect ? '#22c55e' : '#ef4444', 
                  fillOpacity: 1 
                }} 
                radius={10}
              />

              {/* Connection Line */}
              <Polyline 
                positions={[
                  [currentQuestion.lat, currentQuestion.lng],
                  [quizState.lastGuessCoords.lat, quizState.lastGuessCoords.lng]
                ]}
                pathOptions={{ color: '#334155', dashArray: '10, 10', weight: 3, opacity: 0.8 }}
              />
            </>
          )}
        </MapContainer>

        {/* 
           Quiz Feedback Overlay (Floating Card)
           Shows up when the user clicks a point
        */}
        {quizState.isActive && quizState.showResult && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
             <div className="glass-panel bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 text-center animate-pop-in duration-300 origin-bottom">
                
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'} animate-marker-bounce`}>
                   {isCorrect ? <Trophy className="w-8 h-8" /> : <Navigation className="w-8 h-8" />}
                </div>

                <h4 className={`text-2xl font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? 'Exzellent!' : 'Daneben!'}
                </h4>
                
                <div className="bg-slate-800/50 rounded-xl p-3 mb-6 mx-2 border border-slate-700">
                   <p className="text-slate-400 text-xs uppercase tracking-wide font-bold mb-1">Entfernung zum Ziel</p>
                   <p className="text-3xl font-black text-white tracking-tight">{quizState.lastGuessDistance} <span className="text-lg text-slate-500 font-normal">km</span></p>
                </div>

                <Button onClick={nextQuestion} size="lg" fullWidth className="rounded-xl shadow-lg shadow-blue-500/20 animate-pulse-once delay-300">
                  Nächste Frage
                </Button>
             </div>
          </div>
        )}

        {/* Quiz Finished Screen */}
        {quizState.isFinished && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[1000] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="glass-panel bg-slate-900 rounded-3xl p-10 shadow-2xl max-w-md w-full text-center border border-slate-700 animate-pop-in">
              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-300 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-yellow-500/20 animate-marker-bounce">
                 <Trophy className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-2">Quiz beendet!</h2>
              <p className="text-slate-400 mb-8">Hier ist deine Auswertung.</p>

              <div className="flex gap-4 mb-8">
                 <div className="flex-1 bg-blue-900/30 border border-blue-500/30 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-blue-400">{quizState.score}</div>
                    <div className="text-xs text-blue-300/70 font-bold uppercase">Richtig</div>
                 </div>
                 <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-white">{quizState.questions.length}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Gesamt</div>
                 </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleStartQuiz} variant="primary" size="lg" fullWidth className="rounded-xl">
                  Neues Quiz starten
                </Button>
                <Button onClick={resetQuiz} variant="secondary" size="lg" fullWidth className="rounded-xl">
                  Zurück zum Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Standard Mode Instructions */}
        {locations.length === 0 && !quizState.isActive && (
          <div className="absolute bottom-8 right-8 max-w-xs z-[400] pointer-events-none">
            <div className="glass-card p-4 rounded-xl border-l-4 border-blue-500 shadow-xl pointer-events-auto bg-slate-800/90 animate-fade-in-up delay-300">
              <p className="text-slate-200 text-sm font-medium">
                👋 Willkommen! Füge links neue Orte hinzu, um die Karte zu füllen und dein Wissen zu testen.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};