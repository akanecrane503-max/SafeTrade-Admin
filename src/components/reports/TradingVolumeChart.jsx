import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import EmptyState from '../common/EmptyState.jsx';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function TradingVolumeChart({ data, loading }) {
  return (
    <div className="card p-5">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-200">Trading Volume</h3>
        <p className="text-xs text-slate-500 mt-0.5">Long vs. short position volume</p>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : !data?.length ? (
        <div className="h-[300px] flex items-center justify-center">
          <EmptyState title="No volume data" description="Nothing to chart for this range yet." />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="label"
              stroke={CHART_COLORS.axis}
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={CHART_COLORS.axis}
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompactNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: CHART_COLORS.axis }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="longVolume"
              name="Long Volume"
              stroke={CHART_COLORS.success}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="shortVolume"
              name="Short Volume"
              stroke={CHART_COLORS.danger}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
