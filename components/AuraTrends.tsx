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
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 py-6 sm:py-8">
      {/* 7-Day Trend */}
      <section 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6"
        aria-label="Last 7 days trend chart"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
          <span aria-hidden="true">📊 </span>Last 7 Days
        </h2>
        <div className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={format7Days} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#4B5563', fontSize: 12 }}
                tickLine={{ stroke: '#4B5563' }}
              />
              <YAxis 
                tick={{ fill: '#4B5563', fontSize: 12 }}
                tickLine={{ stroke: '#4B5563' }}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value as number;
                    return (
                      <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-lg border border-gray-300 dark:border-gray-600">
                        <p className="font-semibold text-gray-900 dark:text-white">{payload[0].payload.date}</p>
                        <p className={`font-medium ${value > 0 ? 'text-green-700 dark:text-green-400' : value < 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          Points: {value > 0 ? '+' : ''}{value}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          Events: {payload[0].payload.events}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#6B7280" strokeWidth={1} />
              <Bar
                dataKey="total"
                fill="#60A5FA"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      
      {/* 30-Day Cumulative Trend */}
      <section 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6"
        aria-label="Last 30 days trend chart"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
          <span aria-hidden="true">📈 </span>Last 30 Days
        </h2>
        <div className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={format30Days} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#4B5563', fontSize: 10 }}
                tickLine={{ stroke: '#4B5563' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fill: '#4B5563', fontSize: 12 }}
                tickLine={{ stroke: '#4B5563' }}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value as number;
                    return (
                      <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-lg border border-gray-300 dark:border-gray-600">
                        <p className="font-semibold text-gray-900 dark:text-white">{payload[0].payload.date}</p>
                        <p className={`font-medium ${value > 0 ? 'text-green-700 dark:text-green-400' : value < 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          Points: {value > 0 ? '+' : ''}{value}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          Events: {payload[0].payload.events}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#6B7280" strokeWidth={1} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#4ADE80"
                strokeWidth={2}
                dot={{ fill: '#4ADE80', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
