// Données mock — à remplacer par des appels API réels en Phase 5

export type SportFilter = 'Tous' | 'MMA' | 'Boxe' | 'Padel' | 'Basket' | 'Football';
export type TypeFilter  = 'Tous' | 'Découverte' | 'Progression';
export type CoachFilter = 'Tous' | 'Karim D.' | 'Sofia M.' | 'Marcus L.';
export type Period      = 'semaine' | 'mois' | 'année';

export const SPORT_OPTIONS:  SportFilter[]  = ['Tous', 'MMA', 'Boxe', 'Padel', 'Basket', 'Football'];
export const TYPE_OPTIONS:   TypeFilter[]   = ['Tous', 'Découverte', 'Progression'];
export const COACH_OPTIONS:  CoachFilter[]  = ['Tous', 'Karim D.', 'Sofia M.', 'Marcus L.'];

export const WEEK_DATA_FULL = [
  { jour: 'Lun', revenus: 216, sessions: 1, participants: 12, objectif: 200, sport: 'Padel',    type: 'Progression', coach: 'Sofia M.' },
  { jour: 'Mar', revenus: 220, sessions: 1, participants: 11, objectif: 200, sport: 'Basket',   type: 'Progression', coach: 'Marcus L.' },
  { jour: 'Mer', revenus: 210, sessions: 1, participants: 14, objectif: 200, sport: 'MMA',      type: 'Progression', coach: 'Karim D.' },
  { jour: 'Jeu', revenus: 195, sessions: 1, participants: 13, objectif: 200, sport: 'Boxe',     type: 'Progression', coach: 'Karim D.' },
  { jour: 'Ven', revenus: 0,   sessions: 0, participants: 0,  objectif: 200, sport: '',         type: '',            coach: '' },
  { jour: 'Sam', revenus: 210, sessions: 1, participants: 14, objectif: 200, sport: 'MMA',      type: 'Découverte',  coach: 'Karim D.' },
  { jour: 'Dim', revenus: 0,   sessions: 0, participants: 0,  objectif: 200, sport: '',         type: '',            coach: '' },
];

export const MONTH_DATA_FULL = [
  { semaine: 'S1', revenus: 530,  sessions: 3, participants: 34, objectif: 600 },
  { semaine: 'S2', revenus: 645,  sessions: 3, participants: 38, objectif: 600 },
  { semaine: 'S3', revenus: 1051, sessions: 5, participants: 60, objectif: 600 },
  { semaine: 'S4', revenus: 735,  sessions: 4, participants: 41, objectif: 600 },
];

export const MONTH_DAILY_DATA = [
  { jour: '1',  revenus: 0,   cumulé: 0    },
  { jour: '2',  revenus: 150, cumulé: 150  },
  { jour: '3',  revenus: 200, cumulé: 350  },
  { jour: '4',  revenus: 0,   cumulé: 350  },
  { jour: '5',  revenus: 180, cumulé: 530  },
  { jour: '6',  revenus: 0,   cumulé: 530  },
  { jour: '7',  revenus: 180, cumulé: 710  },
  { jour: '8',  revenus: 0,   cumulé: 710  },
  { jour: '9',  revenus: 150, cumulé: 860  },
  { jour: '10', revenus: 0,   cumulé: 860  },
  { jour: '11', revenus: 220, cumulé: 1080 },
  { jour: '12', revenus: 225, cumulé: 1305 },
  { jour: '13', revenus: 0,   cumulé: 1305 },
  { jour: '14', revenus: 216, cumulé: 1521 },
  { jour: '15', revenus: 220, cumulé: 1741 },
  { jour: '16', revenus: 210, cumulé: 1951 },
  { jour: '17', revenus: 195, cumulé: 2146 },
  { jour: '18', revenus: 0,   cumulé: 2146 },
  { jour: '19', revenus: 210, cumulé: 2356 },
  { jour: '20', revenus: 0,   cumulé: 2356 },
  { jour: '21', revenus: 180, cumulé: 2536 },
  { jour: '22', revenus: 180, cumulé: 2716 },
  { jour: '23', revenus: 0,   cumulé: 2716 },
  { jour: '24', revenus: 165, cumulé: 2881 },
  { jour: '25', revenus: 0,   cumulé: 2881 },
  { jour: '26', revenus: 200, cumulé: 3081 },
  { jour: '27', revenus: 0,   cumulé: 3081 },
  { jour: '28', revenus: 190, cumulé: 3271 },
  { jour: '29', revenus: 0,   cumulé: 3271 },
  { jour: '30', revenus: 210, cumulé: 3481 },
];

export const YEAR_DATA = [
  { mois: 'Jan', revenus: 1200, sessions: 8,  participants: 72,  objectif: 2000 },
  { mois: 'Fév', revenus: 1850, sessions: 12, participants: 108, objectif: 2000 },
  { mois: 'Mar', revenus: 2400, sessions: 15, participants: 142, objectif: 2000 },
  { mois: 'Avr', revenus: 3481, sessions: 18, participants: 198, objectif: 2000 },
  { mois: 'Mai', revenus: 2800, sessions: 16, participants: 168, objectif: 2500 },
  { mois: 'Jun', revenus: 3200, sessions: 18, participants: 190, objectif: 2500 },
  { mois: 'Jul', revenus: 4100, sessions: 22, participants: 245, objectif: 3000 },
  { mois: 'Aoû', revenus: 3800, sessions: 20, participants: 220, objectif: 3000 },
  { mois: 'Sep', revenus: 3500, sessions: 19, participants: 205, objectif: 3000 },
  { mois: 'Oct', revenus: 4200, sessions: 23, participants: 260, objectif: 3500 },
  { mois: 'Nov', revenus: 3900, sessions: 21, participants: 238, objectif: 3500 },
  { mois: 'Déc', revenus: 4500, sessions: 24, participants: 275, objectif: 3500 },
];

export const YEAR_COMPARE_DATA = [
  { mois: 'Jan', '2024': 800,  '2025': 1200 },
  { mois: 'Fév', '2024': 1100, '2025': 1850 },
  { mois: 'Mar', '2024': 1500, '2025': 2400 },
  { mois: 'Avr', '2024': 1800, '2025': 3481 },
  { mois: 'Mai', '2024': 2000, '2025': 2800 },
  { mois: 'Jun', '2024': 2200, '2025': 3200 },
  { mois: 'Jul', '2024': 2800, '2025': 4100 },
  { mois: 'Aoû', '2024': 2500, '2025': 3800 },
  { mois: 'Sep', '2024': 2300, '2025': 3500 },
  { mois: 'Oct', '2024': 2600, '2025': 4200 },
  { mois: 'Nov', '2024': 2400, '2025': 3900 },
  { mois: 'Déc', '2024': 2900, '2025': 4500 },
];
