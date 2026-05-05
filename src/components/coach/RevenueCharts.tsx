'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart,
} from 'recharts';
import { TrendingUp, Calendar, BarChart3, Activity, Download, FileText, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

type SportFilter = 'Tous' | 'MMA' | 'Boxe' | 'Padel' | 'Basket' | 'Football';
type TypeFilter = 'Tous' | 'Découverte' | 'Progression';
type CoachFilter = 'Tous' | 'Karim D.' | 'Sofia M.' | 'Marcus L.';

const weekDataFull = [
  { jour: 'Lun', revenus: 216, sessions: 1, participants: 12, objectif: 200, sport: 'Padel', type: 'Progression', coach: 'Sofia M.' },
  { jour: 'Mar', revenus: 220, sessions: 1, participants: 11, objectif: 200, sport: 'Basket', type: 'Progression', coach: 'Marcus L.' },
  { jour: 'Mer', revenus: 210, sessions: 1, participants: 14, objectif: 200, sport: 'MMA', type: 'Progression', coach: 'Karim D.' },
  { jour: 'Jeu', revenus: 195, sessions: 1, participants: 13, objectif: 200, sport: 'Boxe', type: 'Progression', coach: 'Karim D.' },
  { jour: 'Ven', revenus: 0, sessions: 0, participants: 0, objectif: 200, sport: '', type: '', coach: '' },
  { jour: 'Sam', revenus: 210, sessions: 1, participants: 14, objectif: 200, sport: 'MMA', type: 'Découverte', coach: 'Karim D.' },
  { jour: 'Dim', revenus: 0, sessions: 0, participants: 0, objectif: 200, sport: '', type: '', coach: '' },
];

const monthDataFull = [
  { semaine: 'S1', revenus: 530, sessions: 3, participants: 34, objectif: 600 },
  { semaine: 'S2', revenus: 645, sessions: 3, participants: 38, objectif: 600 },
  { semaine: 'S3', revenus: 1051, sessions: 5, participants: 60, objectif: 600 },
  { semaine: 'S4', revenus: 735, sessions: 4, participants: 41, objectif: 600 },
];

const monthDailyData = [
  { jour: '1', revenus: 0, cumulé: 0 },
  { jour: '2', revenus: 150, cumulé: 150 },
  { jour: '3', revenus: 200, cumulé: 350 },
  { jour: '4', revenus: 0, cumulé: 350 },
  { jour: '5', revenus: 180, cumulé: 530 },
  { jour: '6', revenus: 0, cumulé: 530 },
  { jour: '7', revenus: 180, cumulé: 710 },
  { jour: '8', revenus: 0, cumulé: 710 },
  { jour: '9', revenus: 150, cumulé: 860 },
  { jour: '10', revenus: 0, cumulé: 860 },
  { jour: '11', revenus: 220, cumulé: 1080 },
  { jour: '12', revenus: 225, cumulé: 1305 },
  { jour: '13', revenus: 0, cumulé: 1305 },
  { jour: '14', revenus: 216, cumulé: 1521 },
  { jour: '15', revenus: 220, cumulé: 1741 },
  { jour: '16', revenus: 210, cumulé: 1951 },
  { jour: '17', revenus: 195, cumulé: 2146 },
  { jour: '18', revenus: 0, cumulé: 2146 },
  { jour: '19', revenus: 210, cumulé: 2356 },
  { jour: '20', revenus: 0, cumulé: 2356 },
  { jour: '21', revenus: 180, cumulé: 2536 },
  { jour: '22', revenus: 180, cumulé: 2716 },
  { jour: '23', revenus: 0, cumulé: 2716 },
  { jour: '24', revenus: 165, cumulé: 2881 },
  { jour: '25', revenus: 0, cumulé: 2881 },
  { jour: '26', revenus: 200, cumulé: 3081 },
  { jour: '27', revenus: 0, cumulé: 3081 },
  { jour: '28', revenus: 190, cumulé: 3271 },
  { jour: '29', revenus: 0, cumulé: 3271 },
  { jour: '30', revenus: 210, cumulé: 3481 },
];

const yearData = [
  { mois: 'Jan', revenus: 1200, sessions: 8, participants: 72, objectif: 2000 },
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

const yearCompareData = [
  { mois: 'Jan', '2024': 800, '2025': 1200 },
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-[#FF7A00] rounded-lg p-3 shadow-lg">
        <p className="text-[#FF7A00] font-bold text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}€</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-pulse" style={{ minHeight: height }}>
      <div className="h-5 w-48 bg-[#333] rounded mb-6" />
      <div className="flex items-end gap-2 h-[250px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-orange-500/10 rounded-t"
            style={{
              height: `${30 + Math.random() * 70}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-4 animate-pulse">
          <div className="h-3 w-24 bg-[#333] rounded mb-2" />
          <div className="h-7 w-16 bg-[#333] rounded mb-2" />
          <div className="h-3 w-20 bg-[#333] rounded" />
        </div>
      ))}
    </div>
  );
}

function exportCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(';'),
    ...data.map(row => headers.map(h => row[h] ?? '').join(';'))
  ];
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('EXPORT CSV RÉUSSI');
}

function exportPDF(data: Record<string, any>[], filename: string, title: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);

  const tableRows = data.map(row =>
    `<tr>${headers.map(h => `<td style="padding:8px 12px;border-bottom:1px solid #333;color:#ccc;font-size:12px;">${row[h] ?? ''}</td>`).join('')}</tr>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&display=swap');
        body { background: #1a1a1a; color: white; font-family: 'Barlow Condensed', sans-serif; padding: 40px; }
        h1 { color: #FF7A00; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        h2 { color: #888; font-size: 14px; font-weight: 400; margin-bottom: 24px; font-family: Inter, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 10px 12px; background: #2a2a2a; color: #FF7A00; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #FF7A00; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #333; color: #555; font-size: 11px; text-align: center; font-family: Inter, sans-serif; }
      </style>
    </head>
    <body>
      <h1>PASSION SPARK — ${title}</h1>
      <h2>Exporté le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
      <table>
        <thead><tr>${headers.map(h => `<th>${h.toUpperCase()}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">Passion Spark — Vis ta passion. Maintenant.</div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    toast.success('EXPORT PDF LANCÉ');
  }
}

type Period = 'semaine' | 'mois' | 'année';

export default function RevenueCharts() {
  const [activePeriod, setActivePeriod] = useState<Period>('semaine');
  const [monthView, setMonthView] = useState<'barres' | 'cumulé'>('barres');
  const [isLoading, setIsLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sportFilter, setSportFilter] = useState<SportFilter>('Tous');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('Tous');
  const [coachFilter, setCoachFilter] = useState<CoachFilter>('Tous');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [activePeriod]);

  const weekData = weekDataFull.map(d => {
    if (d.sessions === 0) return { ...d };
    const matchSport = sportFilter === 'Tous' || d.sport === sportFilter;
    const matchType = typeFilter === 'Tous' || d.type === typeFilter;
    const matchCoach = coachFilter === 'Tous' || d.coach === coachFilter;
    if (matchSport && matchType && matchCoach) return { ...d };
    return { ...d, revenus: 0, sessions: 0, participants: 0 };
  });

  const hasActiveFilter = sportFilter !== 'Tous' || typeFilter !== 'Tous' || coachFilter !== 'Tous';

  const weekTotal = weekData.reduce((s, d) => s + d.revenus, 0);
  const weekSessions = weekData.reduce((s, d) => s + d.sessions, 0);
  const weekParticipants = weekData.reduce((s, d) => s + d.participants, 0);
  const weekAvg = Math.round(weekTotal / 7);

  const monthTotal = monthDailyData[monthDailyData.length - 1].cumulé;
  const monthSessionsTotal = monthDataFull.reduce((s, d) => s + d.sessions, 0);
  const monthParticipants = monthDataFull.reduce((s, d) => s + d.participants, 0);

  const yearTotal = yearData.reduce((s, d) => s + d.revenus, 0);
  const yearSessions = yearData.reduce((s, d) => s + d.sessions, 0);
  const yearParticipants = yearData.reduce((s, d) => s + d.participants, 0);
  const yearAvgMonth = Math.round(yearTotal / 12);

  const getExportData = useCallback(() => {
    if (activePeriod === 'semaine') {
      return weekData.map(d => ({
        Jour: d.jour,
        Revenus: `${d.revenus}€`,
        Sessions: d.sessions,
        Participants: d.participants,
        Objectif: `${d.objectif}€`,
      }));
    } else if (activePeriod === 'mois') {
      return monthDailyData.map(d => ({
        Jour: d.jour,
        Revenus: `${d.revenus}€`,
        Cumulé: `${d.cumulé}€`,
      }));
    } else {
      return yearData.map(d => ({
        Mois: d.mois,
        Revenus: `${d.revenus}€`,
        Sessions: d.sessions,
        Participants: d.participants,
        Objectif: `${d.objectif}€`,
      }));
    }
  }, [activePeriod, weekData]);

  const periodLabels: Record<Period, string> = {
    semaine: 'Semaine',
    mois: 'Mois',
    année: 'Année',
  };

  const periods: { key: Period; label: string; icon: any }[] = [
    { key: 'semaine', label: 'SEMAINE', icon: Calendar },
    { key: 'mois', label: 'MOIS', icon: BarChart3 },
    { key: 'année', label: 'ANNÉE', icon: Activity },
  ];

  const sportOptions: SportFilter[] = ['Tous', 'MMA', 'Boxe', 'Padel', 'Basket', 'Football'];
  const typeOptions: TypeFilter[] = ['Tous', 'Découverte', 'Progression'];
  const coachOptions: CoachFilter[] = ['Tous', 'Karim D.', 'Sofia M.', 'Marcus L.'];

  return (
    <div className="space-y-6">
      {/* BARRE D'ACTIONS */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {periods.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActivePeriod(key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all ${
                activePeriod === key
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#2a2a2a] border border-[#FF7A00]/20 text-gray-400 hover:border-[#FF7A00] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {activePeriod !== 'année' && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
              hasActiveFilter
                ? 'bg-orange-500/20 border border-[#FF7A00] text-[#FF7A00]'
                : 'bg-[#2a2a2a] border border-[#3a3a3a] text-gray-400 hover:border-[#FF7A00] hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            FILTRES
            {hasActiveFilter && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {(sportFilter !== 'Tous' ? 1 : 0) + (typeFilter !== 'Tous' ? 1 : 0) + (coachFilter !== 'Tous' ? 1 : 0)}
              </span>
            )}
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm bg-[#2a2a2a] border border-[#3a3a3a] text-gray-400 hover:border-[#FF7A00] hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
            EXPORTER
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-[#FF7A00]/30 rounded-lg shadow-xl z-50 overflow-hidden min-w-[200px]">
              <button
                onClick={() => {
                  exportCSV(getExportData(), `passionspark-revenus-${activePeriod}`);
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-orange-500/10 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4 text-green-400" />
                <div>
                  <div className="font-semibold text-xs">EXPORTER EN CSV</div>
                  <div className="text-[10px] text-gray-500">Tableur (Excel, Google Sheets)</div>
                </div>
              </button>
              <div className="border-t border-[#3a3a3a]" />
              <button
                onClick={() => {
                  exportPDF(getExportData(), `passionspark-revenus-${activePeriod}`, `Revenus — ${periodLabels[activePeriod]}`);
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-orange-500/10 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4 text-red-400" />
                <div>
                  <div className="font-semibold text-xs">EXPORTER EN PDF</div>
                  <div className="text-[10px] text-gray-500">Document imprimable</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PANNEAU DE FILTRES */}
      {showFilters && activePeriod !== 'année' && (
        <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-[#FF7A00]">FILTRER LES DONNÉES</span>
            {hasActiveFilter && (
              <button
                onClick={() => { setSportFilter('Tous'); setTypeFilter('Tous'); setCoachFilter('Tous'); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
              >
                <X className="w-3 h-3" />
                RÉINITIALISER
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">PAR SPORT</div>
              <div className="flex flex-wrap gap-1.5">
                {sportOptions.map(sport => (
                  <button
                    key={sport}
                    onClick={() => setSportFilter(sport)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                      sportFilter === sport
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#1a1a1a] border border-[#3a3a3a] text-gray-400 hover:border-[#FF7A00] hover:text-white'
                    }`}
                  >
                    {sport.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">PAR TYPE</div>
              <div className="flex flex-wrap gap-1.5">
                {typeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                      typeFilter === type
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#1a1a1a] border border-[#3a3a3a] text-gray-400 hover:border-[#FF7A00] hover:text-white'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">PAR COACH</div>
              <div className="flex flex-wrap gap-1.5">
                {coachOptions.map(coach => (
                  <button
                    key={coach}
                    onClick={() => setCoachFilter(coach)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                      coachFilter === coach
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#1a1a1a] border border-[#3a3a3a] text-gray-400 hover:border-[#FF7A00] hover:text-white'
                    }`}
                  >
                    {coach.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE SEMAINE */}
      {activePeriod === 'semaine' && (
        <div className="space-y-6">
          {isLoading ? <KPISkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="TOTAL SEMAINE" value={`${weekTotal}€`} trend="+12%" positive />
              <KPICard label="SESSIONS" value={String(weekSessions)} trend="5 jours actifs" />
              <KPICard label="PARTICIPANTS" value={String(weekParticipants)} trend="Moy. 12.8/session" />
              <KPICard label="MOY. JOURNALIÈRE" value={`${weekAvg}€`} trend="+8% vs sem. dern." positive />
            </div>
          )}

          {isLoading ? <ChartSkeleton height={400} /> : (
            <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-xl mb-4">REVENUS PAR JOUR</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={weekData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="jour" stroke="#888" tick={{ fill: '#ccc', fontWeight: 700 }} />
                  <YAxis stroke="#888" tick={{ fill: '#ccc' }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenus" name="Revenus" fill="#FF7A00" radius={[6, 6, 0, 0]} barSize={40} animationDuration={800} />
                  <Line dataKey="objectif" name="Objectif" stroke="#FFB700" strokeWidth={2} strokeDasharray="8 4" dot={false} animationDuration={1200} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* VUE MOIS */}
      {activePeriod === 'mois' && (
        <div className="space-y-6">
          {isLoading ? <KPISkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="TOTAL AVRIL" value={`${monthTotal}€`} trend="+23% vs mars" positive />
              <KPICard label="SESSIONS" value={String(monthSessionsTotal)} trend={`${monthSessionsTotal} sessions`} />
              <KPICard label="PARTICIPANTS" value={String(monthParticipants)} trend="Moy. 11.5/session" />
              <KPICard label="MEILLEURE SEMAINE" value="1 051€" trend="Semaine 3" positive />
            </div>
          )}

          {isLoading ? <ChartSkeleton /> : (
            <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-xl mb-4">REVENUS JOURNALIERS — AVRIL 2025</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="jour" stroke="#888" tick={{ fill: '#ccc', fontSize: 11 }} interval={1} />
                  <YAxis stroke="#888" tick={{ fill: '#ccc' }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenus" name="Revenus" fill="#FF7A00" radius={[4, 4, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* VUE ANNÉE */}
      {activePeriod === 'année' && (
        <div className="space-y-6">
          {isLoading ? <KPISkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="TOTAL 2025" value={`${(yearTotal / 1000).toFixed(1)}K€`} trend="+45% vs 2024" positive />
              <KPICard label="SESSIONS" value={String(yearSessions)} trend={`${yearSessions} sessions`} />
              <KPICard label="PARTICIPANTS" value={`${(yearParticipants / 1000).toFixed(1)}K`} trend="Total annuel" />
              <KPICard label="MOY. MENSUELLE" value={`${yearAvgMonth}€`} trend="Progression constante" positive />
            </div>
          )}

          {isLoading ? <ChartSkeleton /> : (
            <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-xl mb-4">REVENUS MENSUELS — 2025</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="mois" stroke="#888" tick={{ fill: '#ccc', fontWeight: 700 }} />
                  <YAxis stroke="#888" tick={{ fill: '#ccc' }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenus" name="Revenus" fill="#FF7A00" radius={[6, 6, 0, 0]} barSize={35} animationDuration={800} />
                  <Line dataKey="objectif" name="Objectif" stroke="#FFB700" strokeWidth={2} strokeDasharray="8 4" dot={false} animationDuration={1200} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {isLoading ? <ChartSkeleton height={350} /> : (
            <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-in fade-in duration-500" style={{ animationDelay: '100ms' }}>
              <h3 className="font-semibold text-xl mb-4">COMPARAISON 2024 VS 2025</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearCompareData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="mois" stroke="#888" tick={{ fill: '#ccc', fontWeight: 700 }} />
                  <YAxis stroke="#888" tick={{ fill: '#ccc' }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line dataKey="2024" name="2024" stroke="#666" strokeWidth={2} dot={{ fill: '#666', r: 4 }} animationDuration={1000} />
                  <Line dataKey="2025" name="2025" stroke="#FF7A00" strokeWidth={3} dot={{ fill: '#FF7A00', r: 5 }} animationDuration={1200} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KPICard({ label, value, trend, positive }: { label: string; value: string; trend: string; positive?: boolean }) {
  return (
    <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-gray-400 text-xs font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className={`flex items-center gap-1 text-xs mt-1 ${positive ? 'text-green-400' : 'text-gray-500'}`}>
        {positive && <TrendingUp className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  );
}
