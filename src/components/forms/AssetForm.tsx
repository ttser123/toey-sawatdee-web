import { useState } from 'react';
import { useFinanceStore } from '@/lib/finance-store';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const AssetForm = () => {
  const store = useFinanceStore();
  const [form, setForm] = useState({ label: '', amount: '' });
  const [editDraft, setEditDraft] = useState<{ id: string | null, label: string, amount: string }>({
    id: null,
    label: '',
    amount: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.amount) return;
    store.addAsset({ label: form.label, amount: parseFloat(form.amount) });
    setForm({ label: '', amount: '' });
  };

  const handleSaveEdit = () => {
    if (!editDraft.id) return;

    // Gate 1: The Ghost Trap (Empty Label)
    const cleanLabel = editDraft.label.trim();
    if (!cleanLabel) {
      setError("Error: Asset label cannot be empty.");
      return;
    }

    // Gate 2 & 3: The NaN & Negative Asset Traps
    const parsedAmount = parseFloat(editDraft.amount);
    if (isNaN(parsedAmount)) {
      setError("Error: Invalid amount entered.");
      return;
    }

    if (parsedAmount < 0) {
      setError("Error: Asset balance cannot be negative. For debts, use the Expense ledger.");
      return;
    }

    setError(null);

    store.updateAsset(editDraft.id, {
      label: cleanLabel,
      amount: parsedAmount
    });
    setEditDraft({ id: null, label: '', amount: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
      {/* 70% LEDGER */}
      <div className="w-full lg:w-[70%] card-blueprint p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs sm:text-sm font-mono">
            <span className="material-symbols-outlined bg-slate-100 p-1.5 text-slate-600 rounded-sm text-lg">database</span>
            Asset_Ledger // Current_Inventory
          </h3>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase font-mono">Total_Entries: {store.assets.length}</span>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-sm border-rose-500 bg-rose-50 mb-4">
            <span className="material-symbols-outlined h-4 w-4">error</span>
            <AlertTitle className="font-black font-mono uppercase tracking-widest text-rose-800">Validation Error</AlertTitle>
            <AlertDescription className="font-mono text-xs text-rose-600 font-bold">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left font-mono text-[10px] sm:text-[11px] min-w-[400px]">
            <thead>
              <tr className="text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-3 pl-2">Asset_Label</th>
                <th className="pb-3 text-right">Value_Amount</th>
                <th className="pb-3 text-right pr-2 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {store.assets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 uppercase italic text-[9px] sm:text-[11px]">Ledger_Empty // Waiting_for_Data</td>
                </tr>
              ) : (
                store.assets.map(a => (
                  <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2">
                      {editDraft.id === a.id ? (
                        <input 
                          type="text" 
                          className="blueprint-input py-1 px-2 w-full text-[10px] sm:text-[11px] font-bold" 
                          value={editDraft.label} 
                          onChange={e => setEditDraft({ ...editDraft, label: e.target.value })} 
                        />
                      ) : (
                        <span className="font-bold text-slate-700">{a.label}</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {editDraft.id === a.id ? (
                        <input 
                          type="number" 
                          step="0.01"
                          className="blueprint-input py-1 px-2 w-28 sm:w-32 text-[10px] sm:text-[11px] font-black text-right" 
                          value={editDraft.amount} 
                          onChange={e => setEditDraft({ ...editDraft, amount: e.target.value })} 
                        />
                      ) : (
                        <span className="font-black text-indigo-600">{formatCurrency(a.amount, store.displayCurrency)}</span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex justify-end gap-2 sm:gap-3">
                        {editDraft.id === a.id ? (
                          <>
                            <button 
                              onClick={handleSaveEdit}
                              className="text-emerald-600 hover:text-emerald-700 transition-all"
                              title="Save Changes"
                            >
                              <span className="material-symbols-outlined text-sm font-black">check</span>
                            </button>
                            <button 
                              onClick={() => {
                                setEditDraft({ id: null, label: '', amount: '' });
                                setError(null);
                              }}
                              className="text-slate-400 hover:text-slate-600 transition-all"
                              title="Cancel Edit"
                            >
                              <span className="material-symbols-outlined text-sm font-black">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => {
                                setEditDraft({ id: a.id, label: a.label, amount: a.amount.toString() });
                                setError(null);
                              }}
                              className="text-slate-300 hover:text-indigo-600 transition-all"
                              title="Edit Asset"
                            >
                              <span className="material-symbols-outlined text-sm sm:text-base">edit_note</span>
                            </button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button 
                                  className="text-slate-300 hover:text-rose-600 transition-all"
                                  title="Delete Asset"
                                >
                                  <span className="material-symbols-outlined text-sm sm:text-base">delete_forever</span>
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-slate-300 shadow-2xl rounded-sm">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-mono uppercase font-black tracking-widest text-slate-800">Confirm Deletion</AlertDialogTitle>
                                  <AlertDialogDescription className="font-mono text-xs text-slate-500">
                                    Are you sure you want to delete asset <span className="font-bold text-slate-700">"{a.label}"</span>? This will affect any linked goals. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="font-mono text-xs font-black uppercase tracking-widest rounded-sm border-slate-300">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => store.removeAsset(a.id)}
                                    className="font-mono text-xs font-black uppercase tracking-widest rounded-sm bg-rose-600 hover:bg-rose-700 text-white shadow-none"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30% ADD FORM */}
      <div className="w-full lg:w-[30%] card-blueprint p-4 sm:p-6 space-y-6 bg-slate-50/50 border-dashed">
        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] sm:text-xs font-mono">
          <span className="material-symbols-outlined text-sm">add_box</span>
          Initialize_New_Asset
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Asset_Name</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Main Bank Account" 
              className="blueprint-input w-full text-xs" 
              value={form.label} 
              onChange={e => setForm({ ...form, label: e.target.value })} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Initial Balance</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              className="blueprint-input w-full font-mono text-xs" 
              value={form.amount} 
              onChange={e => setForm({ ...form, amount: e.target.value })} 
            />
          </div>
          <button className="blueprint-btn-primary w-full py-3 text-[9px] sm:text-[10px] tracking-widest">+ COMMIT TO LEDGER</button>
        </form>
        
        <div className="p-3 sm:p-4 bg-white rounded-sm border border-slate-200">
          <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono leading-relaxed uppercase">
            Notice: Assets represent liquid or semi-liquid funds that can be allocated to goals or used for survival runway.
          </p>
        </div>
      </div>
    </div>
  );
};
