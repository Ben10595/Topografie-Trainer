export enum LocationCategory {
  CITY = 'Stadt',
  COUNTRY = 'Land',
  RIVER = 'Fluss',
  LAKE = 'See',
  MOUNTAIN = 'Gebirge',
  SEA = 'Meer',
  OTHER = 'Sonstiges',
}

export interface LocationData {
  id: string;
  name: string;
  category: LocationCategory;
  lat: number;
  lng: number;
}

export interface QuizState {
  isActive: boolean;
  questions: LocationData[];
  currentQuestionIndex: number;
  score: number;
  showResult: boolean;
  lastGuessDistance: number | null;
  lastGuessCoords: { lat: number; lng: number } | null;
  isFinished: boolean;
}

export const DEFAULT_LOCATIONS: LocationData[] = [
  { id: '1', name: 'Berlin', category: LocationCategory.CITY, lat: 52.52, lng: 13.405 },
  { id: '2', name: 'Paris', category: LocationCategory.CITY, lat: 48.8566, lng: 2.3522 },
  { id: '3', name: 'Rom', category: LocationCategory.CITY, lat: 41.9028, lng: 12.4964 },
  { id: '4', name: 'London', category: LocationCategory.CITY, lat: 51.5074, lng: -0.1278 },
  { id: '5', name: 'Madrid', category: LocationCategory.CITY, lat: 40.4168, lng: -3.7038 },
  { id: '6', name: 'Zugspitze', category: LocationCategory.MOUNTAIN, lat: 47.421, lng: 10.985 },
  { id: '7', name: 'Bodensee', category: LocationCategory.LAKE, lat: 47.636, lng: 9.389 },
];
