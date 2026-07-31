import React, { useState } from 'react';
import { Layers, Plus, Trash2, Wand2, Check } from 'lucide-react';

interface RollYardageEditorProps {
  rolls: number[];
  onChange: (updatedRolls: number[]) => void;
  itemName: string;
}

export const RollYardageEditor: React.FC<RollYardageEditorProps> = ({
  rolls,
  onChange,
  itemName,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [genCount, setGenCount] = useState(10);
  const [genAvg, setGenAvg] = useState(60);
  const [showBulkGen, setShowBulkGen] = useState(false);

  // Add roll manually
  const [newYard, setNewYard] = useState('');

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newYard);
    if (!isNaN(val) && val > 0) {
      onChange([...rolls, val]);
      setNewYard('');
    }
  };

  const handleUpdateRoll = (index: number, value: string) => {
    const val = parseFloat(value);
    const updated = [...rolls];
    if (!isNaN(val)) {
      updated[index] = val;
    } else {
      updated[index] = 0;
    }
    onChange(updated);
  };

  const handleRemoveRoll = (index: number) => {
    const updated = rolls.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Quick paste parser (e.g., "102.9 63.7 109.2 98.5" or "102.9, 63.7, 109.2")
  const handleParseQuickInput = () => {
    if (!quickInput.trim()) return;
    const tokens = quickInput.split(/[\s,;\n]+/);
    const parsed: number[] = [];
    tokens.forEach((t) => {
      const num = parseFloat(t);
      if (!isNaN(num) && num > 0) {
        parsed.push(Math.round(num * 100) / 100);
      }
    });

    if (parsed.length > 0) {
      onChange([...rolls, ...parsed]);
      setQuickInput('');
    }
  };

  // Bulk Generator
  const handleGenerateBulk = () => {
    const generated: number[] = [];
    for (let i = 0; i < genCount; i++) {
      const variation = ((i % 5) - 2) * 1.25;
      const yard = Math.max(1, Math.round((genAvg + variation) * 100) / 100);
      generated.push(yard);
    }
    onChange([...rolls, ...generated]);
    setShowBulkGen(false);
  };

  const totalYards = rolls.reduce((sum, r) => sum + r, 0);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-3">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800">
            Detail Roll ({rolls.length} Roll)
          </span>
          <span className="text-slate-400">|</span>
          <span className="font-semibold text-blue-700">
            Total: {totalYards.toFixed(2)} Yards
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowBulkGen(!showBulkGen)}
          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-medium flex items-center gap-1 transition"
        >
          <Wand2 className="w-3.5 h-3.5" />
          {showBulkGen ? 'Tutup Generator' : 'Auto Generate Roll'}
        </button>
      </div>

      {/* Bulk Generator Box */}
      {showBulkGen && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded p-2.5 space-y-2">
          <p className="font-bold text-indigo-900">⚡ Auto Generator Roll Kain Grosir</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">
                Jumlah Roll:
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={genCount}
                onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-indigo-300 rounded px-2 py-1 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">
                Rata-rata Yard/Roll:
              </label>
              <input
                type="number"
                step="0.1"
                value={genAvg}
                onChange={(e) => setGenAvg(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-indigo-300 rounded px-2 py-1 text-slate-900 font-mono"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateBulk}
            className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition flex items-center justify-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Tambah {genCount} Roll (~{(genCount * genAvg).toFixed(0)} Yards)
          </button>
        </div>
      )}

      {/* Quick Text Input Parser */}
      <div className="space-y-1">
        <label className="block font-semibold text-slate-700 text-[11px]">
          Copy-Paste Angka Yardage (pisahkan dengan koma atau spasi):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Contoh: 102.9, 63.7, 109.2, 98.5"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-800 placeholder-slate-400"
          />
          <button
            type="button"
            onClick={handleParseQuickInput}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded transition"
          >
            Import
          </button>
        </div>
      </div>

      {/* Grid of Individual Roll Cards */}
      <div className="max-h-48 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
          {rolls.map((yard, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-white border border-slate-300 rounded p-1"
            >
              <span className="text-[10px] font-mono text-slate-400 w-5 text-right font-semibold">
                #{idx + 1}
              </span>
              <input
                type="number"
                step="0.01"
                value={yard}
                onChange={(e) => handleUpdateRoll(idx, e.target.value)}
                className="w-full bg-transparent font-mono font-bold text-slate-900 border-b border-transparent focus:border-blue-500 focus:outline-none text-xs text-right"
              />
              <span className="text-[10px] text-slate-400">Yds</span>
              <button
                type="button"
                onClick={() => handleRemoveRoll(idx)}
                className="text-slate-400 hover:text-rose-600 transition p-0.5"
                title="Hapus Roll Ini"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Single Roll Form */}
      <form onSubmit={handleAddSingle} className="flex gap-2 items-center pt-1 border-t border-slate-200">
        <input
          type="number"
          step="0.01"
          placeholder="Tambah Yard Roll (misal 58.50)..."
          value={newYard}
          onChange={(e) => setNewYard(e.target.value)}
          className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-900"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Roll Baru
        </button>
      </form>
    </div>
  );
};
