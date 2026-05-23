import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
    Zap, Upload, Download, FileText,
    CheckCircle2, AlertCircle, Loader2,
    TrendingUp, TrendingDown, Target, Percent, Shield, X, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trade, BotMapping } from './logic/types';
import { parseMT5Report, parseMapping, decodeFile } from './logic/parser';
import { processPortfolio } from './logic/processor';
import { generateConsolidatedReport } from './logic/exporter';
import { EquityChart } from './components/EquityChart';

type Toast = { id: number; msg: string; type: 'ok' | 'err' };

const fmtUSD = (v: number) =>
    `${v >= 0 ? '+' : '-'}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function App() {
    const [trades,     setTrades]     = useState<Trade[]>([]);
    const [mapping,    setMapping]    = useState<globalThis.Map<string, BotMapping>>(new globalThis.Map());
    const [processing, setProcessing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [toasts,     setToasts]     = useState<Toast[]>([]);
    const toastId = useRef(0);

    const { processedTrades, stats, equityCurve } = useMemo(() => {
        const r = processPortfolio(trades, mapping);
        return { processedTrades: r.trades, stats: r.stats, equityCurve: r.equityCurve };
    }, [trades, mapping]);

    const hasData = trades.length > 0;

    // ── Toasts ────────────────────────────────────────────────────────────────
    const toast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
        const id = ++toastId.current;
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
    }, []);

    // ── File processing ───────────────────────────────────────────────────────
    const processFiles = useCallback(async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;
        setProcessing(true);
        const incoming: Trade[] = [];

        for (const file of Array.from(files)) {
            try {
                const content = await decodeFile(file);
                const lower   = content.toLowerCase();
                const isBacktest =
                    lower.includes('informe del probador') ||
                    lower.includes('strategy tester report') ||
                    lower.includes('transacciones');

                if (isBacktest) {
                    const parsed = parseMT5Report(content, file.name);
                    if (parsed.length > 0) incoming.push(...parsed);
                    else toast(`Sin operaciones: ${file.name}`, 'err');
                } else {
                    const newMap = parseMapping(content);
                    if (newMap.size > 0) {
                        setMapping(newMap);
                        toast(`Magic Map · ${newMap.size} bots`, 'ok');
                    } else {
                        toast(`No se reconoció: ${file.name}`, 'err');
                    }
                }
            } catch {
                toast(`Error: ${file.name}`, 'err');
            }
        }

        if (incoming.length > 0) {
            setTrades(prev => [...prev, ...incoming]);
            const bots = new Set(incoming.map(t => t.botName)).size;
            toast(`${incoming.length} ops · ${bots} bot${bots !== 1 ? 's' : ''}`, 'ok');
        }
        setProcessing(false);
    }, [toast]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
        e.target.value = '';
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragOver(false);
        processFiles(e.dataTransfer.files);
    };

    const handleExport = () => {
        generateConsolidatedReport(processedTrades, stats);
        toast('Informe exportado correctamente', 'ok');
    };

    return (
        <div className="h-screen bg-background text-text flex flex-col overflow-hidden">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <header className="flex-shrink-0 h-14 glass border-b border-white/[0.06] px-6 flex items-center justify-between gap-4 z-50">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-glow-green">
                        <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="leading-none">
                        <div className="text-[15px] font-black tracking-tight text-white">
                            MT5 Portfolio <span className="text-primary">FUSER</span>
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted/40 mt-0.5">
                            Automated Report Fusion
                        </div>
                    </div>
                </div>

                {/* Badge de estado cuando hay datos */}
                {hasData && (
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-surface2 rounded-full border border-white/[0.06] text-xs font-semibold text-muted">
                        <span className={`w-1.5 h-1.5 rounded-full ${stats.totalProfit >= 0 ? 'bg-primary' : 'bg-error'} animate-pulse`} />
                        <span className={`font-black tabular ${stats.totalProfit >= 0 ? 'text-primary' : 'text-error'}`}>
                            {fmtUSD(stats.totalProfit)}
                        </span>
                        <span className="text-white/10">·</span>
                        <span>{stats.totalTrades.toLocaleString()} trades</span>
                        {mapping.size > 0 && (
                            <>
                                <span className="text-white/10">·</span>
                                <span className="text-secondary/80">Magic Map ✓</span>
                            </>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                    {/* Botón: cargar mapeo de magic numbers */}
                    <label className={`relative flex items-center gap-2 h-9 px-4 rounded-lg border text-xs font-bold cursor-pointer transition-all
                        ${mapping.size > 0
                            ? 'bg-secondary/10 border-secondary/30 text-secondary/80 hover:bg-secondary/15'
                            : 'bg-surface2 border-border hover:border-secondary/40 hover:text-secondary text-muted'
                        }`}>
                        <Map className="w-3.5 h-3.5" />
                        {mapping.size > 0 ? `Mapeo · ${mapping.size}` : 'Mapeo'}
                        <input type="file" accept=".html,.htm,.csv,.json,.chr" className="hidden"
                            onChange={handleFileInput} />
                    </label>

                    {/* Botón: importar reportes HTML */}
                    <label className={`flex items-center gap-2 h-9 px-4 rounded-lg border text-xs font-bold cursor-pointer transition-all
                        ${processing
                            ? 'bg-surface2 border-border text-muted cursor-not-allowed'
                            : 'bg-surface2 border-border hover:border-primary/40 hover:text-primary text-muted'
                        }`}>
                        {processing
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Upload className="w-3.5 h-3.5" />
                        }
                        Importar
                        <input type="file" multiple accept=".html,.htm" className="hidden"
                            onChange={handleFileInput} disabled={processing} />
                    </label>

                    <motion.button
                        onClick={handleExport}
                        disabled={!hasData}
                        whileHover={hasData ? { scale: 1.02 } : {}}
                        whileTap={hasData ? { scale: 0.97 } : {}}
                        className={`flex items-center gap-2 h-9 px-5 rounded-lg text-sm font-black transition-all
                            bg-primary text-background
                            disabled:opacity-20 disabled:cursor-not-allowed
                            ${hasData ? 'shadow-glow-green hover:brightness-110' : ''}`}
                    >
                        <Download className="w-4 h-4" />
                        Exportar HTML
                    </motion.button>

                    {hasData && (
                        <button onClick={() => setTrades([])}
                            className="h-9 w-9 rounded-lg border border-border hover:border-error/40 hover:bg-error/8
                                flex items-center justify-center transition-all group"
                            title="Limpiar sesión">
                            <X className="w-3.5 h-3.5 text-muted/30 group-hover:text-error transition-colors" />
                        </button>
                    )}
                </div>
            </header>

            {/* ── Main ───────────────────────────────────────────────────── */}
            <main
                className="flex-1 overflow-y-auto custom-scrollbar"
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
            >
                {/* Drag overlay */}
                <AnimatePresence>
                    {isDragOver && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
                            style={{ background: 'rgba(0,214,143,0.04)' }}
                        >
                            <div className="border-2 border-dashed border-primary/40 rounded-3xl p-16 text-center">
                                <Upload className="w-12 h-12 text-primary/60 mx-auto mb-3" />
                                <p className="text-xl font-black text-primary/80">Suelta aquí</p>
                                <p className="text-sm text-muted/50 mt-1">Reportes HTML de MT5 o archivo de mapeo</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!hasData
                    ? <EmptyState onFileInput={handleFileInput} />
                    : <Dashboard stats={stats} equityCurve={equityCurve} />
                }
            </main>

            {/* ── Toasts ─────────────────────────────────────────────────── */}
            <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 32, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 32, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className={`flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-xl shadow-2xl text-[12px] font-semibold glass
                                ${t.type === 'ok' ? 'border-primary/20 text-primary' : 'border-error/20 text-error'}`}
                        >
                            {t.type === 'ok'
                                ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                : <AlertCircle  className="w-3.5 h-3.5 flex-shrink-0" />
                            }
                            {t.msg}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ── Empty State ───────────────────────────────────────────────────────────── */
function EmptyState({ onFileInput }: { onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="h-full flex flex-col items-center justify-center gap-8 p-12">
            {/* Icon */}
            <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-surface2 border border-white/[0.07] flex items-center justify-center
                    shadow-[0_0_60px_rgba(0,214,143,0.06)]">
                    <FileText className="w-10 h-10 text-muted/25" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Upload className="w-3 h-3 text-primary/60" />
                </div>
            </div>

            <div className="text-center max-w-sm">
                <h2 className="text-xl font-black text-white mb-2 tracking-tight">
                    Arrastra tus reportes aquí
                </h2>
                <p className="text-sm text-muted/60 leading-relaxed">
                    Carga los informes HTML del Strategy Tester de MT5.
                    Puedes incluir también un archivo de mapeo de Magic Numbers.
                </p>
            </div>

            <label className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary/10 border border-primary/25
                hover:bg-primary/15 hover:border-primary/40 transition-all cursor-pointer text-sm font-bold text-primary">
                <Upload className="w-4 h-4" />
                Seleccionar archivos
                <input type="file" multiple accept=".html,.htm" className="hidden" onChange={onFileInput} />
            </label>

            {/* Tips */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mt-2">
                {[
                    ['📂', 'Carga masiva', 'Arrastra N reportes HTML de MT5 simultáneamente'],
                    ['🔢', 'Magic Numbers', 'Reasigna IDs con tu archivo de mapeo'],
                    ['📄', 'Un clic', 'Exporta el informe consolidado listo para revisar'],
                ].map(([icon, title, desc]) => (
                    <div key={title} className="bg-surface2/60 border border-white/[0.05] rounded-xl p-3.5 text-center">
                        <div className="text-xl mb-1.5">{icon}</div>
                        <p className="text-[11px] font-bold text-white/80 mb-1">{title}</p>
                        <p className="text-[10px] text-muted/50 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Dashboard ─────────────────────────────────────────────────────────────── */
function Dashboard({ stats, equityCurve }: {
    stats: ReturnType<typeof processPortfolio>['stats'];
    equityCurve: ReturnType<typeof processPortfolio>['equityCurve'];
}) {
    const pos = stats.totalProfit >= 0;
    const pf  = stats.profitFactor;
    const dd  = stats.maxDrawdownPercent;

    const metrics = [
        {
            label: 'Beneficio Neto',
            value: `${pos ? '+' : '-'}$${Math.abs(stats.totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `${stats.tradingDays}d · ${stats.totalTrades.toLocaleString()} trades`,
            icon: pos ? TrendingUp : TrendingDown,
            color: pos ? 'green' : 'red',
            glow: pos ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)',
        },
        {
            label: 'Win Rate',
            value: `${stats.winRate.toFixed(1)}%`,
            sub: `${stats.wins}W · ${stats.losses}L`,
            icon: Percent,
            color: stats.winRate >= 50 ? 'green' : 'red',
            glow: stats.winRate >= 50 ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)',
        },
        {
            label: 'Profit Factor',
            value: pf.toFixed(2),
            sub: pf >= 1.5 ? 'Excelente' : pf >= 1 ? 'Aceptable' : 'Bajo',
            icon: Target,
            color: pf >= 1.5 ? 'green' : pf >= 1 ? 'amber' : 'red',
            glow: pf >= 1.5 ? 'rgba(16,185,129,0.7)' : pf >= 1 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)',
        },
        {
            label: 'Max Drawdown',
            value: `${dd.toFixed(2)}%`,
            sub: `-$${Math.abs(stats.maxDrawdown).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            icon: Shield,
            color: dd < 10 ? 'green' : dd < 20 ? 'amber' : 'red',
            glow: dd < 10 ? 'rgba(16,185,129,0.7)' : dd < 20 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)',
        },
    ] as const;

    const COLOR_MAP = {
        green: { text: 'text-primary',  bg: 'bg-primary/10',  border: 'border-primary/20'  },
        amber: { text: 'text-warning',  bg: 'bg-warning/10',  border: 'border-warning/20'  },
        red:   { text: 'text-error',    bg: 'bg-error/10',    border: 'border-error/20'    },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-5"
        >
            {/* ── 4 Key metrics ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => {
                    const c = COLOR_MAP[m.color];
                    const Icon = m.icon;
                    return (
                        <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, ease: [0.21, 1.02, 0.73, 1] }}
                            className="stat-card relative"
                        >
                            {/* Top accent bar */}
                            <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl"
                                style={{ background: `linear-gradient(90deg, transparent, ${m.glow}, transparent)` }} />

                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-7 h-7 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted/60 leading-none">
                                    {m.label}
                                </span>
                            </div>

                            <p className={`text-2xl font-black tabular tracking-tight leading-none ${c.text}`}>
                                {m.value}
                            </p>
                            <p className="text-[10px] text-muted/40 tabular mt-2">{m.sub}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Equity curve — full width, tall ──────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
                className="chart-panel"
                style={{ height: '520px' }}
            >
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-4 rounded-full bg-primary/50" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/70">
                            Curva de Equidad Consolidada
                        </span>
                    </div>
                    {equityCurve.length > 0 && (
                        <span className="text-[10px] text-muted/35 tabular">
                            {new Date(equityCurve[0].rawTime).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                            {' → '}
                            {new Date(equityCurve[equityCurve.length - 1].rawTime).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                            <span className="ml-2 text-muted/20">·</span>
                            <span className="ml-2">{equityCurve.length.toLocaleString()} pts</span>
                        </span>
                    )}
                </div>
                <div style={{ height: 'calc(100% - 53px)' }}>
                    <EquityChart data={equityCurve} />
                </div>
            </motion.div>
        </motion.div>
    );
}
