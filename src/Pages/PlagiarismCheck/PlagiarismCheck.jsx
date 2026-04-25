import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
    ShieldCheck, ShieldAlert, ArrowLeft, Upload, FileText,
    AlertTriangle, CheckCircle2, Loader2, X,
    Globe, Database, Users, Hash, BarChart2, Zap
} from 'lucide-react';
import axiosPlagiarism from '../../utils/axiosPlagiarism.js';
import SectionHeader from '../../Components/SectionHeader/SectionHeader.jsx';
import EmptyState from '../../Components/EmptyState/EmptyState.jsx';

const MAX_FILES = 5;

const SkeletonLine = ({ w = 'w-full', h = 'h-4' }) => (
    <div className={`${w} ${h} bg-gray-100 rounded animate-pulse`} />
);

const SectionCard = ({ children, className = '' }) => (
    <div className={`h-full overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
        {children}
    </div>
);


const riskCfg = {
    HIGH:   { badge: 'bg-red-100 text-red-700 border border-red-200',             bar: 'bg-red-500',     icon: ShieldAlert,   text: 'High Risk',  dot: 'bg-red-500' },
    MEDIUM: { badge: 'bg-amber-100 text-amber-700 border border-amber-200',       bar: 'bg-amber-400',   icon: AlertTriangle, text: 'Moderate',   dot: 'bg-amber-400' },
    LOW:    { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', bar: 'bg-emerald-500', icon: CheckCircle2,  text: 'Low Risk',   dot: 'bg-emerald-500' },
};

const pct = (score) => Math.round((score ?? 0) * 100);
const scoreColor = (risk) =>
    risk === 'HIGH' ? 'text-red-500' : risk === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500';


const ScoreBar = ({ score, risk }) => (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
            className={`h-full rounded-full transition-all duration-700 ${riskCfg[risk]?.bar ?? 'bg-gray-300'}`}
            style={{ width: `${score}%` }}
        />
    </div>
);

const TermChips = ({ terms }) =>
    terms?.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-2">
            {terms.map(term => (
                <span key={term} className="text-[10px] px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-gray-500">
                    {term}
                </span>
            ))}
        </div>
    ) : null;

const FileChip = ({ file, onRemove }) => (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
        <FileText size={12} className="text-violet-400 shrink-0" />
        <span className="text-xs text-gray-600 truncate max-w-[160px]">{file.name}</span>
        <button onClick={() => onRemove(file.name)} className="ml-auto text-gray-300 hover:text-red-400 transition">
            <X size={12} />
        </button>
    </div>
);

// Internal pair row

const InternalPairRow = ({ pair }) => {
    const risk  = pair.verdict?.risk ?? 'LOW';
    const cfg   = riskCfg[risk];
    const Icon  = cfg.icon;
    const score = pct(pair.combined);
    const terms = [...(pair.topPhrases ?? []), ...(pair.topWords ?? [])].slice(0, 5);

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 hover:shadow-sm border-transparent mt-3 ${
            risk === 'HIGH' ? 'bg-red-50' : risk === 'MEDIUM' ? 'bg-amber-50' : 'bg-gray-50'
        }`}>
            <Icon size={18} className={`${scoreColor(risk)} shrink-0 mt-0.5`} strokeWidth={1.75} />
            <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{pair.docA}</p>
                        <p className="text-[10px] text-gray-400">vs</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{pair.docB}</p>
                    </div>
                    <div className="shrink-0 text-right">
                        <span className={`text-base font-black ${scoreColor(risk)}`}>{score}%</span>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${scoreColor(risk)}`}>{cfg.text}</p>
                    </div>
                </div>
                <ScoreBar score={score} risk={risk} />
                <TermChips terms={terms} />
            </div>
        </div>
    );
};

// Repository file row

const RepoFileRow = ({ fileName, highestScore, topVerdict }) => {
    const risk  = topVerdict?.risk ?? 'LOW';
    const cfg   = riskCfg[risk];
    const Icon  = cfg.icon;
    const score = pct(highestScore);

    return (
        <div className={`p-4 rounded-xl border transition-all duration-150 hover:shadow-sm border-transparent mt-3 ${
            risk === 'HIGH' ? 'bg-red-50' : risk === 'MEDIUM' ? 'bg-amber-50' : 'bg-gray-50'
        }`}>
            <div className="flex items-start gap-3">
                <Icon size={18} className={`${scoreColor(risk)} shrink-0 mt-0.5`} strokeWidth={1.75} />
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
                        <div className="shrink-0 text-right">
                            <span className={`text-base font-black ${scoreColor(risk)}`}>{score}%</span>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${scoreColor(risk)}`}>{cfg.text}</p>
                        </div>
                    </div>
                    <ScoreBar score={score} risk={risk} />
                </div>
            </div>
        </div>
    );
};

// Online result row

const OnlineFileRow = ({ result }) => {
    const [expanded, setExpanded] = useState(false);
    const risk  = result.matches?.[0]?.verdict?.risk ?? 'LOW';
    const score = pct(result.highestScore);
    const cfg   = riskCfg[risk];
    const Icon  = cfg.icon;

    return (
        <div className={`p-4 rounded-xl border transition-all duration-150 hover:shadow-sm border-transparent mt-3 ${
            risk === 'HIGH' ? 'bg-red-50' : risk === 'MEDIUM' ? 'bg-amber-50' : 'bg-gray-50'
        }`}>
            <div className="flex items-start gap-3">
                <Icon size={18} className={`${scoreColor(risk)} shrink-0 mt-0.5`} strokeWidth={1.75} />
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate">{result.fileName}</p>
                        <div className="shrink-0 text-right">
                            <span className={`text-base font-black ${scoreColor(risk)}`}>{score}%</span>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${scoreColor(risk)}`}>{cfg.text}</p>
                        </div>
                    </div>
                    <ScoreBar score={score} risk={risk} />
                    {result.matches?.length > 0 && (
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="text-[11px] text-violet-500 font-semibold hover:underline mt-1"
                        >
                            {expanded ? 'Hide' : 'Show'} {result.matches.length} web source{result.matches.length !== 1 ? 's' : ''}
                        </button>
                    )}
                </div>
            </div>

            {expanded && result.matches?.length > 0 && (
                <div className="mt-3 ml-7 space-y-2">
                    {result.matches.map((m, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <a
                                        href={m.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-violet-600 hover:underline truncate block"
                                    >
                                        {m.title}
                                    </a>
                                    <p className="text-[10px] text-gray-400 truncate">{m.url}</p>
                                </div>
                                <span className={`text-xs font-bold shrink-0 ${scoreColor(m.verdict?.risk)}`}>
                                    {pct(m.combined)}%
                                </span>
                            </div>
                            <TermChips terms={[...(m.topPhrases ?? []), ...(m.topWords ?? [])].slice(0, 5)} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PlagiarismCheck = () => {
    const navigate = useNavigate();

    const inputRef                = useRef(null);
    const [files, setFiles]       = useState([]);
    const [checking, setChecking] = useState(false);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState(null);
    const [saveToRepo, setSaveToRepo] = useState(false);

    const addFiles = (incoming) => {
        setFiles(prev => {
            const names  = new Set(prev.map(f => f.name));
            const merged = [...prev];
            for (const f of incoming)
                if (!names.has(f.name) && merged.length < MAX_FILES) { merged.push(f); names.add(f.name); }
            return merged;
        });
    };

    const removeFile        = (name) => setFiles(prev => prev.filter(f => f.name !== name));
    const handleInputChange = (e)    => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ''; };
    const handleDrop        = (e)    => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); };

    const handleCheck = async () => {
        if (files.length < 1) return;
        setChecking(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            for (const f of files) formData.append('files', f);
            formData.append('storeInRepository', saveToRepo ? 'true' : 'false');
            const res = await axiosPlagiarism.post('/check', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.status !== 200 || !res.data?.success)
                throw new Error(res.data?.message ?? 'Unexpected server response');
            setResult(res.data);
        } catch (err) {
            setError(err?.response?.data?.message ?? err.message ?? 'Check failed. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    // Pull from actual response shape
    const internalPairs   = result?.internalResults?.pairs             ?? [];
    const internalSummary = result?.internalResults?.summary           ?? null;
    const repoResults     = result?.repositoryResults?.results         ?? [];
    const repoSummary     = result?.repositoryResults?.summary         ?? null;
    const onlineResults   = result?.onlineResults                      ?? [];

    // Info strip values (mirrors the course metadata row)
    const infoCards = result ? [
        { icon: FileText,  label: 'Files Checked',    value: `${result.totalFiles ?? files.length}` },
        { icon: Users,     label: 'Internal Pairs',   value: `${result.internalResults?.totalPairs ?? 0}` },
        { icon: Database,  label: 'Repo Documents',   value: `${result.repositoryResults?.totalRepoDoc ?? 0}` },
        { icon: BarChart2, label: 'Flagged',          value: `${internalSummary?.flagged ?? 0} found` },
    ] : [];

    return (
        <div className="gilroy space-y-6">

            {/* Back + Header */}
            <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="graphik text-3xl font-semibold text-gray-900">Plagiarism Check</h1>
                        <p className="text-base text-gray-500 mt-1">Upload up to {MAX_FILES} files to compare against each other, the repository, and the web</p>
                    </div>

                    {/* Run button */}
                    <div className="flex flex-col items-end gap-2">
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            accept=".pdf,.txt,.docx"
                            className="hidden"
                            onChange={handleInputChange}
                        />
                        <button
                            onClick={handleCheck}
                            disabled={checking || files.length < 1}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                            {checking
                                ? <><Loader2 size={15} className="animate-spin" strokeWidth={1.75} /> Analysing…</>
                                : <><Zap size={15} strokeWidth={1.75} /> Run Check</>
                            }
                        </button>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={saveToRepo}
                                onChange={e => setSaveToRepo(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-gray-300 accent-violet-600 cursor-pointer"
                            />
                            <span className="text-xs text-gray-500 font-medium">Save to repository</span>
                        </label>
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    {files.map(f => <FileChip key={f.name} file={f} onRemove={removeFile} />)}
                    {files.length < MAX_FILES && (
                        <button
                            onClick={() => inputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={e => e.preventDefault()}
                            className="flex items-center gap-1.5 text-xs text-violet-500 border border-dashed border-violet-300 rounded-lg px-3 py-1.5 hover:bg-violet-50 transition"
                        >
                            <Upload size={11} /> Add more
                        </button>
                    )}

                </div>
            )}

            {files.length === 0 && (
                <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl px-6 py-10 flex flex-col items-center gap-3 hover:border-violet-300 hover:bg-violet-50/20 transition bg-white"
                >
                    <Upload size={24} className="text-gray-300" />
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-500">
                            Drag & drop files here, or <span className="text-violet-500 font-semibold">browse</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT · max 10 MB each · up to {MAX_FILES} files</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <AlertTriangle size={12} className="shrink-0" />{error}
                </div>
            )}

            {/* Info strip — mirrors course metadata cards */}
            {result && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {infoCards.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Icon size={13} className="text-gray-400" strokeWidth={2} />
                                <span className="text-xs font-medium text-gray-400">{label}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Grid */}
            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:max-h-[720px] gap-6">

                    {/* Left 2/3 — Internal results */}
                    <div className="lg:col-span-2 overflow-y-auto">
                        <SectionCard>
                            <SectionHeader
                                icon={Users}
                                title="Between Uploaded Files"
                                iconBg="bg-violet-50"
                                iconColor="text-violet-500"
                                count={internalPairs.length}
                                navigate={false}
                            />
                            {checking ? (
                                <div className="space-y-3 mt-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />)}
                                </div>
                            ) : internalPairs.length === 0 ? (
                                <EmptyState message="No significant similarity found between the uploaded files." />
                            ) : (
                                internalPairs.map((pair, i) => <InternalPairRow key={i} pair={pair} />)
                            )}
                        </SectionCard>
                    </div>

                    {/* Right 1/3 — Repo + Online stacked */}
                    <div className="grid grid-rows-[1fr_1fr] gap-6 lg:max-h-[720px]">

                        {/* Repository */}
                        <SectionCard>
                            <SectionHeader
                                icon={Database}
                                title="Repository"
                                iconBg="bg-blue-50"
                                iconColor="text-blue-500"
                                count={repoSummary?.totalMatches ?? 0}
                                navigate={false}
                            />
                            {repoResults.length === 0 ? (
                                <EmptyState message="No repository matches." />
                            ) : (
                                repoResults.map((r, i) => (
                                    <RepoFileRow
                                        key={i}
                                        fileName={r.fileName}
                                        highestScore={r.highestScore}
                                        topVerdict={r.topVerdict}
                                    />
                                ))
                            )}
                        </SectionCard>

                        {/* Online / Web */}
                        <SectionCard>
                            <SectionHeader
                                icon={Globe}
                                title="Web Sources"
                                iconBg="bg-teal-50"
                                iconColor="text-teal-500"
                                count={onlineResults.reduce((acc, r) => acc + (r.totalMatches ?? 0), 0)}
                                navigate={false}
                            />
                            {onlineResults.length === 0 ? (
                                <EmptyState message="No web matches found." />
                            ) : (
                                onlineResults.map((r, i) => <OnlineFileRow key={i} result={r} />)
                            )}
                        </SectionCard>
                    </div>
                </div>
            )}

            {/* Errors footer */}
            {result?.errors?.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                    <AlertTriangle size={12} className="shrink-0" />
                    Failed to process: {result.errors.join(', ')}
                </div>
            )}
        </div>
    );
};

export default PlagiarismCheck;