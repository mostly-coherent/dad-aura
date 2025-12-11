'use client';

import { AuraTrend } from '@/types/aura';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';

interface AuraTrendsProps {
  last7Days: AuraTrend[];
  last30Days: AuraTrend[];
}

export default function AuraTrends({ last7Days, last30Days }: AuraTrendsProps) {
  // Format data for charts
  const format7Days = last7Days.map(trend => ({
    date: format(parseISO(trend.date), 'EEE'),
    total: trend.total,
    events: trend.events,
  }));
  
  const format30Days = last30Days.map(trend => ({
    date: format(parseISO(trend.date), 'M/d'),
    total: trend.total,
    events: trend.events,
  }));
  
  
  return (
    <div className="space-y-8 px-6 py-8">
      {/* 7-Day Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          📊 Last 7 Days
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={format7Days}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-lg border border-gray-200 dark:border-gray-600">
                      <p className="font-semibold">{payload[0].payload.date}</p>
                      <p className={`${payload[0].value as number > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Points: {payload[0].value}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Events: {payload[0].payload.events}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="#666" />
            <Bar
              dataKey="total"
              fill="#60A5FA"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 30-Day Cumulative Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          📈 Last 30 Days (Daily Points)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={format30Days}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-lg border border-gray-200 dark:border-gray-600">
                      <p className="font-semibold">{payload[0].payload.date}</p>
                      <p className={`${payload[0].value as number > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Points: {payload[0].value}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Events: {payload[0].payload.events}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="#666" />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#4ADE80"
              strokeWidth={2}
              dot={{ fill: '#4ADE80', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

