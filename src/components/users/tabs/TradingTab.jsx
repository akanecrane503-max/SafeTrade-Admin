import { useState, useEffect } from 'react';
import { Power, TrendingUp, TrendingDown, Loader2, CheckCircle2, XCircle, CircleDashed } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';
import { useToast } from '../../common/Toast.jsx';
import * as tradingService from '../../../services/tradingService';
import * as tradeService from '../../../services/tradeService'; 
import { formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/helpers';
import Dropdown from '../../common/Dropdown.jsx';

const MODE_OPTIONS = [
  { label: 'Neutral (Standard)', value: 'neutral' },
  { label: '⚡ FORCE AUTO-WIN', value: 'win' },
  { label: '💀 FORCE AUTO-LOSE', value: 'lose' },
];

export default function TradingTab({ user, onRefetch }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const [tradeMode, setTradeMode] = useState('neutral');
  const [updatingMode, setUpdatingMode] = useState(false);

  const [openTrades, setOpenTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [enabled, setEnabled] = useState(Boolean(user?.tradingEnabled));

  const [tradeHistory, setTradeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  const [settlingTrade, setSettlingTrade] = useState(null);
  const [settlingOutcome, setSettlingOutcome] = useState(null);
  const [confirmSettleOpen, setConfirmSettleOpen] = useState(false);
  const [settlingLoading, setSettlingLoading] = useState(false);

  // 1. FETCH USER DATA, TRADES & MODE
  useEffect(() => {
    async function loadUserData() {
      if (!user?.id && !user?.email) return;
      setTradesLoading(true);
      try {
        // Fetch Trades
        let query = supabase.from("trade_history").select("*").eq("status", "open");
        if (user.id) query = query.eq("user_id", user.id);
        else if (user.email) query = query.eq("user_email", user.email);

        const { data, error } = await query;
        if (error) throw error;
        setOpenTrades(data || []);

        // Fetch Profile Data (Mode and Enabled)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("mode, trading_enabled") 
          .eq("id", user.id)
          .single();
          
        if (!profileError && profileData) {
          setTradeMode(profileData.mode || 'neutral');
          setEnabled(Boolean(profileData.trading_enabled));
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setTradesLoading(false);
      }
    }
    loadUserData();
  }, [user?.id, user?.email]);

  // 1b. FETCH COMPLETED TRADE HISTORY
  useEffect(() => {
    async function loadTradeHistory() {
      if (!user?.id) return;
      setHistoryLoading(true);
      try {
        const trades = await tradeService.getUserTrades(user.id);
        setTradeHistory((trades || []).filter((t) => t.status !== 'open'));
      } catch (err) {
        console.error("Failed to load trade history", err);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadTradeHistory();
  }, [user?.id]);

  // 2. HANDLE AUTO WIN / LOSE MODE CHANGE
  async function handleModeChange(newMode) {
    if (newMode === tradeMode) return;
    setUpdatingMode(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ mode: newMode })
        .eq("id", user.id);

      if (error) throw error;
      
      setTradeMode(newMode);
      addToast(`Trade mode updated to ${newMode.toUpperCase()}`, 'success');
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Failed to update trade mode', 'error');
      setTradeMode(tradeMode); 
    } finally {
      setUpdatingMode(false);
    }
  }

  // 3. TOGGLE TRADING STATUS (FORCES RELOAD VIA DIRECT DB CALL)
  async function handleToggle() {
    setLoading(true);
    try {
      // Update Database directly here to ensure it works
      const newStatus = !enabled;
      const { error } = await supabase
        .from("profiles")
        .update({ trading_enabled: newStatus })
        .eq("id", user.id);

      if (error) throw error;
      
      setEnabled(newStatus); // Immediately update local state
      addToast(`Trading ${newStatus ? 'enabled' : 'disabled'}`, 'success');
      setConfirmOpen(false);
      
      if (onRefetch) await onRefetch();
    } catch (err) {
      addToast(err.message || 'Failed to update trading status', 'error');
    } finally {
      setLoading(false);
    }
  }

  // 4. FORCE SETTLE INDIVIDUAL TRADE
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
      addToast(`Trade forced to ${settlingOutcome.toUpperCase()}!`, 'success');
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
          <button onClick={() => setConfirmOpen(true)} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors', enabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20')}>
            {enabled ? 'Disable Trading' : 'Enable Trading'}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">Trade Outcome Override</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tradeMode === 'win' ? 'bg-emerald-500/20' : tradeMode === 'lose' ? 'bg-red-500/20' : 'bg-slate-600/20')}>
              {tradeMode === 'win' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {tradeMode === 'lose' && <XCircle className="w-5 h-5 text-red-400" />}
              {tradeMode === 'neutral' && <CircleDashed className="w-5 h-5 text-slate-400" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {tradeMode === 'win' && 'Auto-Win Mode (ACTIVE)'}
                {tradeMode === 'lose' && 'Auto-Lose Mode (ACTIVE)'}
                {tradeMode === 'neutral' && 'Neutral Mode'}
              </p>
              <p className="text-xs text-slate-500">
                {tradeMode === 'win' && '⚠️ This user will WIN every single trade they place.'}
                {tradeMode === 'lose' && '⚠️ This user will LOSE every single trade they place.'}
                {tradeMode === 'neutral' && 'Trades resolve based on market conditions.'}
              </p>
            </div>
          </div>
          <div className="min-w-[160px]">
            <Dropdown options={MODE_OPTIONS} value={tradeMode} onChange={handleModeChange} disabled={updatingMode} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">Active Trades <span className="text-xs font-normal text-slate-500 ml-2">({openTrades.length})</span></h3>
        {tradesLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
        ) : openTrades.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-800/20 rounded-xl border border-slate-700/50">This user has no active open trades.</div>
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
                      <p className="text-xs text-slate-400">{trade.direction} • ${Number(trade.amount).toLocaleString()} • Entry: ${Number(trade.entry_price).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openSettleConfirmation(trade, 'win')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors">🟢 Force Win</button>
                    <button onClick={() => openSettleConfirmation(trade, 'lose')} className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors">🔴 Force Lose</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-5">
          Trade History <span className="text-xs font-normal text-slate-500 ml-2">({tradeHistory.length})</span>
        </h3>
        {historyLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
        ) : tradeHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-800/20 rounded-xl border border-slate-700/50">This user has no completed trades yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-3 py-2 font-medium text-slate-500">Coin</th>
                  <th className="px-3 py-2 font-medium text-slate-500">Direction</th>
                  <th className="px-3 py-2 font-medium text-slate-500">Amount</th>
                  <th className="px-3 py-2 font-medium text-slate-500">Result</th>
                  <th className="px-3 py-2 font-medium text-slate-500">Profit</th>
                  <th className="px-3 py-2 font-medium text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tradeHistory.map((trade) => {
                  const isWin = trade.result === 'win';
                  return (
                    <tr key={trade.id}>
                      <td className="px-3 py-2.5 font-medium text-slate-200">{trade.coin}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn('inline-flex items-center gap-1 text-xs font-medium', trade.direction === 'long' ? 'text-emerald-400' : 'text-red-400')}>
                          {trade.direction === 'long' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {trade.direction === 'long' ? 'Long' : 'Short'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-300">${Number(trade.amount).toLocaleString()}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', isWin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                          {isWin ? 'Win' : 'Lose'}
                        </span>
                      </td>
                      <td className={cn('px-3 py-2.5 font-medium', isWin ? 'text-emerald-400' : 'text-red-400')}>
                        {isWin ? '+' : ''}${Number(trade.profit).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">{formatDateTime(trade.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleToggle} loading={loading} title={`${enabled ? 'Disable' : 'Enable'} trading for this user?`} message={enabled ? 'They will be unable to open new trades until re-enabled.' : 'They will regain the ability to open new trades.'} confirmLabel={enabled ? 'Disable' : 'Enable'} variant={enabled ? 'danger' : 'primary'} />
      <ConfirmDialog open={confirmSettleOpen} onClose={() => { setConfirmSettleOpen(false); setSettlingTrade(null); setSettlingOutcome(null); }} onConfirm={handleForceSettle} loading={settlingLoading} title={`Force ${settlingOutcome === 'win' ? 'WIN' : 'LOSE'} this trade?`} message={`This will immediately settle the ${settlingTrade?.symbol || ''} trade.`} confirmLabel={`Force ${settlingOutcome === 'win' ? 'Win' : 'Lose'}`} variant={settlingOutcome === 'win' ? 'primary' : 'danger'} />
    </div>
  );
}
