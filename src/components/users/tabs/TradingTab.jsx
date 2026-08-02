import { useState, useEffect } from 'react';
import { Power, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; // Import supabase directly
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as tradingService from '../../../services/tradingService';
import * as tradeService from '../../../services/tradeService'; 
import { cn } from '../../../utils/helpers';

export default function TradingTab({ user, onRefetch }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const [openTrades, setOpenTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  
  const [settlingTrade, setSettlingTrade] = useState(null);
  const [settlingOutcome, setSettlingOutcome] = useState(null);
  const [confirmSettleOpen, setConfirmSettleOpen] = useState(false);
  const [settlingLoading, setSettlingLoading] = useState(false);

  const enabled = Boolean(user.tradingEnabled);

  // 1. DIRECT SUPABASE QUERY TO FETCH TRADES
  useEffect(() => {
    async function loadUserTrades() {
      if (!user?.id) return;
      setTradesLoading(true);
      try {
        // We query Supabase directly here to avoid any column name mismatches
        const { data, error } = await supabase
          .from("trade_history")
          .select("*")
          .eq("user_id", user.id) // Querying by the user's ID
          .eq("status", "open");

        if (error) throw error;
        setOpenTrades(data || []);
      } catch (err) {
        console.error("Failed to load user trades", err);
        addToast("Could not load trades. Check if 'user_id' column exists in trade_history.", 'error');
      } finally {
        setTradesLoading(false);
      }
    }
    loadUserTrades();
  }, [user?.id]);

  // 2. Toggle Trading Status
  async function handleToggle() {
    setLoading(true);
    try {
      await tradingService.toggleUserTrading(user.id, !enabled);
      addToast(`Trading ${!enabled ? 'enabled' : 'disabled'} for this user`, 'success');
      setConfirmOpen(false);
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to update trading status', 'error');
    } finally {
      setLoading(false);
    }
  }

  // 3. Force Settle Trade
  function openSettleConfirmation(trade, outcome) {
    setSettlingTrade(trade);
    setSettlingOutcome(outcome);
    setConfirmSettleOpen(true);
  }

  async function handleForceSettle() {
    if (!settlingTrade || !settlingOutcome) return;
    setSettlingLoading(true);
    try {
      await tradeService.adminForceSettleTrade(settlingTrade.id, settlingOutcome);
      addToast(`Trade ${settlingTrade.id.slice(0,8)} forced to ${settlingOutcome.toUpperCase()}!`, 'success');
      setOpenTrades((prev) => prev.filter(t => t.id !== settlingTrade.id));
      setConfirmSettleOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to settle trade', 'error');
    } finally {
      setSettlingLoading(false);
      setSettlingTrade(null);
      setSettlingOutcome(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* --- TRADING STATUS CARD --- */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">Trading Status</h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', enabled ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
              <Power className={cn('w-5 h-5', enabled ? 'text-emerald-400' : 'text-red-400')} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Trading is currently {enabled ? 'ON' : 'OFF'}</p>
              <p className="text-xs text-slate-500">
                {enabled ? 'This user can open and manage trades.' : 'This user is blocked from opening new trades.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors', enabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20')}
          >
            {enabled ? 'Disable Trading' : 'Enable Trading'}
          </button>
        </div>
      </div>

      {/* --- FORCE WIN / LOSE SECTION --- */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">
          Active Trades <span className="text-xs font-normal text-slate-500 ml-2">({openTrades.length})</span>
        </h3>

        {tradesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : openTrades.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-800/20 rounded-xl border border-slate-700/50">
            This user has no active open trades.
          </div>
        ) : (
          <div className="space-y-3">
            {openTrades.map((trade) => {
              const isLong = trade.direction === 'Long';
              return (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                  
                  <div className="flex items-center gap-4">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', isLong ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
                      {isLong ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{trade.symbol}</p>
                      <p className="text-xs text-slate-400">
                        {trade.direction} • ${Number(trade.amount).toLocaleString()} • Entry: ${Number(trade.entry_price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openSettleConfirmation(trade, 'win')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors"
                    >
                      🟢 Force Win
                    </button>
                    <button
                      onClick={() => openSettleConfirmation(trade, 'lose')}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      🔴 Force Lose
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- CONFIRM DIALOGS --- */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleToggle}
        loading={loading}
        title={`${enabled ? 'Disable' : 'Enable'} trading for this user?`}
        message={enabled ? 'They will be unable to open new trades until re-enabled.' : 'They will regain the ability to open new trades.'}
        confirmLabel={enabled ? 'Disable' : 'Enable'}
        variant={enabled ? 'danger' : 'primary'}
      />

      <ConfirmDialog
        open={confirmSettleOpen}
        onClose={() => { setConfirmSettleOpen(false); setSettlingTrade(null); setSettlingOutcome(null); }}
        onConfirm={handleForceSettle}
        loading={settlingLoading}
        title={`Force ${settlingOutcome === 'win' ? 'WIN' : 'LOSE'} this trade?`}
        message={`This will immediately settle the ${settlingTrade?.symbol || ''} trade as a ${settlingOutcome === 'win' ? 'WIN (User receives profit)' : 'LOSE (User loses stake)'}. This action cannot be undone.`}
        confirmLabel={`Force ${settlingOutcome === 'win' ? 'Win' : 'Lose'}`}
        variant={settlingOutcome === 'win' ? 'primary' : 'danger'}
      />
    </div>
  );
}
