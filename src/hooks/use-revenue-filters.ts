'use client';

import { useState, useCallback } from 'react';
import {
  type SportFilter,
  type TypeFilter,
  type CoachFilter,
  type Period,
  WEEK_DATA_FULL,
  MONTH_DAILY_DATA,
  MONTH_DATA_FULL,
  YEAR_DATA,
} from '@/components/coach/revenue-data';

export function useRevenueFilters() {
  const [activePeriod,   setActivePeriod]   = useState<Period>('semaine');
  const [isLoading,      setIsLoading]       = useState(false);
  const [showExportMenu, setShowExportMenu]  = useState(false);
  const [showFilters,    setShowFilters]     = useState(false);
  const [sportFilter,    setSportFilter]     = useState<SportFilter>('Tous');
  const [typeFilter,     setTypeFilter]      = useState<TypeFilter>('Tous');
  const [coachFilter,    setCoachFilter]     = useState<CoachFilter>('Tous');

  const switchPeriod = useCallback((p: Period) => {
    setActivePeriod(p);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  const resetFilters = useCallback(() => {
    setSportFilter('Tous');
    setTypeFilter('Tous');
    setCoachFilter('Tous');
  }, []);

  const hasActiveFilter =
    sportFilter !== 'Tous' || typeFilter !== 'Tous' || coachFilter !== 'Tous';

  const activeFilterCount =
    (sportFilter !== 'Tous' ? 1 : 0) +
    (typeFilter  !== 'Tous' ? 1 : 0) +
    (coachFilter !== 'Tous' ? 1 : 0);

  // Semaine filtrée
  const weekData = WEEK_DATA_FULL.map((d) => {
    if (d.sessions === 0) return { ...d };
    const ok =
      (sportFilter === 'Tous' || d.sport === sportFilter) &&
      (typeFilter  === 'Tous' || d.type  === typeFilter)  &&
      (coachFilter === 'Tous' || d.coach === coachFilter);
    return ok ? { ...d } : { ...d, revenus: 0, sessions: 0, participants: 0 };
  });

  // KPIs semaine
  const weekTotal        = weekData.reduce((s, d) => s + d.revenus, 0);
  const weekSessions     = weekData.reduce((s, d) => s + d.sessions, 0);
  const weekParticipants = weekData.reduce((s, d) => s + d.participants, 0);
  const weekAvg          = Math.round(weekTotal / 7);

  // KPIs mois
  const monthTotal        = MONTH_DAILY_DATA[MONTH_DAILY_DATA.length - 1].cumulé;
  const monthSessionsTotal = MONTH_DATA_FULL.reduce((s, d) => s + d.sessions, 0);
  const monthParticipants  = MONTH_DATA_FULL.reduce((s, d) => s + d.participants, 0);

  // KPIs année
  const yearTotal        = YEAR_DATA.reduce((s, d) => s + d.revenus, 0);
  const yearSessions     = YEAR_DATA.reduce((s, d) => s + d.sessions, 0);
  const yearParticipants = YEAR_DATA.reduce((s, d) => s + d.participants, 0);
  const yearAvgMonth     = Math.round(yearTotal / 12);

  // Données pour l'export
  const getExportData = useCallback((): Record<string, unknown>[] => {
    if (activePeriod === 'semaine') {
      return weekData.map((d) => ({
        Jour:         d.jour,
        Revenus:      `${d.revenus}€`,
        Sessions:     d.sessions,
        Participants: d.participants,
        Objectif:     `${d.objectif}€`,
      }));
    }
    if (activePeriod === 'mois') {
      return MONTH_DAILY_DATA.map((d) => ({
        Jour:    d.jour,
        Revenus: `${d.revenus}€`,
        Cumulé:  `${d.cumulé}€`,
      }));
    }
    return YEAR_DATA.map((d) => ({
      Mois:         d.mois,
      Revenus:      `${d.revenus}€`,
      Sessions:     d.sessions,
      Participants: d.participants,
      Objectif:     `${d.objectif}€`,
    }));
  }, [activePeriod, weekData]);

  return {
    // état période
    activePeriod, switchPeriod,
    isLoading,
    // export
    showExportMenu, setShowExportMenu,
    getExportData,
    // filtres
    showFilters, setShowFilters,
    sportFilter,  setSportFilter,
    typeFilter,   setTypeFilter,
    coachFilter,  setCoachFilter,
    resetFilters,
    hasActiveFilter,
    activeFilterCount,
    // données filtrées
    weekData,
    // KPIs
    weekTotal, weekSessions, weekParticipants, weekAvg,
    monthTotal, monthSessionsTotal, monthParticipants,
    yearTotal, yearSessions, yearParticipants, yearAvgMonth,
  };
}
