'use client';

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart,
} from 'recharts';
import { TrendingUp, Calendar, BarChart3, Activity, Download, FileText, Filter, X } from 'lucide-react';

import { useRevenueFilters } from '@/hooks/use-revenue-filters';
import { exportCSV, exportPDF }  from '@/lib/revenue-export';
import {
  SPORT_OPTIONS, TYPE_OPTIONS, COACH_OPTIONS,
  MONTH_DAILY_DATA, YEAR_DATA, YEAR_COMPARE_DATA,
  type Period,
} from '@/components/coach/revenue-data';

// ─── Tooltip ────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#FF7A00] rounded-lg p-3 shadow-lg">
      <p className="text-[#FF7A00] font-bold text-sm mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}€</span>
        </p>
      ))}
    </div>
  );
};

// ─── Skeletons ───────────────────────────────────────────────────────────────
function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-pulse" style={{ minHeight: height }}>
      <div className="h-5 w-48 bg-[#333] rounded mb-6" />
      <div className="flex items-end gap-2 h-[250px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 bg-orange-500/10 rounded-t" style={{ height: `${30 + (i * 13) % 70}%` }} />
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

// ─── KPI Card ────────────────────────────────────────────────────────────────
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

// ─── Composant principal ──────────────────────────────────────────────────────
const PERIODS: { key: Period; label: string; icon: React.ElementType }[] = [
  { key: 'semaine', label: 'SEMAINE', icon: Calendar  },
  { key: 'mois',    label: 'MOIS',    icon: BarChart3  },
  { key: 'année',   label: 'ANNÉE',   icon: Activity   },
];

const PERIOD_LABELS: Record<Period, string> = { semaine: 'Semaine', mois: 'Mois', année: 'Année' };

export default function RevenueCharts() {
  const f = useRevenueFilters();

  return (
    <div className="space-y-6">

      {/* ── Barre d'actions ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {PERIODS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => f.switchPeriod(key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all ${
                f.activePeriod === key
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

        {f.activePeriod !== 'année' && (
          <button
            onClick={() => f.setShowFilters(!f.showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
              f.hasActiveFilter
                ? 'bg-orange-500/20 border border-[#FF7A00] text-[#FF7A00]'
                : 'bg-[#2a2a2a] border border-[#3a3a3a] text-gray-400 hover:border-[#FF7A00] hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            FILTRES
            {f.hasActiveFilter && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {f.activeFilterCount}
              </span>
            )}
          </button>
        )}

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => f.setShowExportMenu(!f.showExportMenu)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm bg-[#2a2a2a] border border-[#3a3a3a] text-gray-400 hover:border-[#FF7A00] hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
            EXPORTER
          </button>
          {f.showExportMenu && (
            <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-[#FF7A00]/30 rounded-lg shadow-xl z-50 overflow-hidden min-w-[200px]">
              <button
                onClick={() => { exportCSV(f.getExportData(), `passionspark-revenus-${f.activePeriod}`); f.setShowExportMenu(false); }}
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
                onClick={() => { exportPDF(f.getExportData(), `passionspark-revenus-${f.activePeriod}`, `Revenus — ${PERIOD_LABELS[f.activePeriod]}`); f.setShowExportMenu(false); }}
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

      {/* ── Panneau filtres ── */}
      {f.showFilters && f.activePeriod !== 'année' && (
        <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-[#FF7A00]">FILTRER LES DONNÉES</span>
            {f.hasActiveFilter && (
              <button onClick={f.resetFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition">
                <X className="w-3 h-3" /> RÉINITIALISER
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-6">
            {([
              { label: 'PAR SPORT',  options: SPORT_OPTIONS,  current: f.sportFilter,  set: f.setSportFilter  },
              { label: 'PAR TYPE',   options: TYPE_OPTIONS,   current: f.typeFilter,   set: f.setTypeFilter   },
              { label: 'PAR COACH',  options: COACH_OPTIONS,  current: f.coachFilter,  set: f.setCoachFilter  },
            ] as const).map(({ label, options, current, set }) => (
              <div key={label}>
                <div className="text-xs text-gray-500 mb-2 font-semibold">{label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => (set as (v: typeof opt) => void)(opt)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                        current === opt
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#1a1a1a] border border-[#3a3a3a] text-gray-400 hover:border-[#FF7A00] hover:text-white'
                      }`}
                    >
                      {opt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Vue SEMAINE ── */}
      {f.activePeriod === 'semaine' && (
        <div className="space-y-6">
          {f.isLoading ? <KPISkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="TOTAL SEMAINE"    value={`${f.weekTotal}€`}        trend="+12%"                   positive />
              <KPICard label="SESSIONS"         value={String(f.weekSessions)}   trend="5 jours actifs"                   />
              <KPICard label="PARTICIPANTS"     value={String(f.weekParticipants)} trend="Moy. 12.8/session"              />
              <KPICard label="MOY. JOURNALIÈRE" value={`${f.weekAvg}€`}          trend="+8% vs sem. dern."     positive />
            </div>
          )}
          {f.isLoading ? <ChartSkeleton height={400} /> : (
            <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-xl mb-4">REVENUS PAR JOUR</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={f.weekData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="jour"    stroke="#888" tick={{ fill: '#ccc', fontWeight: 700 }} />
                  <YAxis stroke="#888" tick={{ fill: '#ccc' }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar  dataKey="revenus" name="Revenus" fill="#FF7A00" radius={[6,6,0,0]} barSize={40} animationDuration={800} />
                  <Line dataKey="objectif" name="Objectif" stroke="#FFB700" strokeWidth={2} strokeDasharray="8 4" dot={false} animationDuration={1200} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Vue MOIS ── */}
      {f.activePeriod === 'mois' && (
        <div className="space-y-6">
          {f.isLoading ? <KPISkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="TOTAL AVRIL"       value={`${f.monthTotal}€`}              trend="+23% vs mars"          positive />
              <KPICard label="SESSIONS"          value={String(f.monthSessionsTotal)}    trend={`${f.monthSessionsTotal} sessions`} />
              <KPICard label="PARTICIPANTS"      value={String(f.monthParticipants)}     trend="Moy. 11.5/session"              />
              <KPICard label="MEILLEURE SEMAINE" value="1 051€"                          trend="Semaine 3"              positive />
            </div>
          )}
          {f.isLoading ? <ChartSkeleton /> : (
            <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-xl mb-4">REVENUS JOURNALIERS — AVRIL 2025</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={MONTH_DAILY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="jour" stroke="#888" tick={{ fill: '#ccc', fontSize: 11 }} interval={1} />
                  <YAxis stroke="#888" tick={{ fill: '#ccc' }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenus" name="Revenus" fill="#FF7A00" radius={[4,4,0,0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Vue ANNÉE ── */}
      {f.activePeriod === 'année' && (
        <div className="space-y-6">
          {f.isLoading ? <KPISkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="TOTAL 2025"    value={`${(f.yearTotal / 1000).toFixed(1)}K€`} trend="+45% vs 2024"         positive />
              <KPICard label="SESSIONS"      value={String(f.yearSessions)}                 trend={`${f.yearSessions} sessions`} />
              <KPICard label="PARTICIPANTS"  value={`${(f.yearParticipants / 1000).toFixed(1)}K`} trend="Total annuel"       />
              <KPICard label="MOY. MENSUELLE" value={`${f.yearAvgMonth}€`}                 trend="Progression constante"  positive />
            </div>
          )}
          {f.isLoading ? <ChartSkeleton /> : (
            <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-xl mb-4">REVENUS MENSUELS — 2025</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={YEAR_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="mois" stroke="#888" tick={{ fill: '#ccc', fontWeight: 700 }} />
                  <YAxis stroke="#888" tick={{ fill: '#ccc' }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar  dataKey="revenus"  name="Revenus"  fill="#FF7A00" radius={[6,6,0,0]} barSize={35} animationDuration={800} />
                  <Line dataKey="objectif" name="Objectif" stroke="#FFB700" strokeWidth={2} strokeDasharray="8 4" dot={false} animationDuration={1200} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
          {f.isLoading ? <ChartSkeleton height={350} /> : (
            <div className="bg-[#2a2a2a] border border-[#FF7A00]/20 rounded-lg p-6 animate-in fade-in duration-500" style={{ animationDelay: '100ms' }}>
              <h3 className="font-semibold text-xl mb-4">COMPARAISON 2024 VS 2025</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={YEAR_COMPARE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="mois" stroke="#888" tick={{ fill: '#ccc', fontWeight: 700 }} />
                  <YAxis stroke="#888" tick={{ fill: '#ccc' }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line dataKey="2024" name="2024" stroke="#666"    strokeWidth={2} dot={{ fill: '#666',    r: 4 }} animationDuration={1000} />
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
