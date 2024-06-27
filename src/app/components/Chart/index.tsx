// @ts-nocheck
'use client';

import React, { useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';
import LineChartComponent from './LineChart';
import BarChartComponent from './BarChart';
import AreaChartComponent from './AreaChart';
import RadarChartComponent from './RadarChart';
import Loading from '@/components/Loading';
import './Chart.css';

interface ChartProps {
    data: any[];
    dataKey: string;
    chartType: 'line' | 'area' | 'bar' | 'radar';
}

const chartComponents = {
    line: LineChartComponent,
    area: AreaChartComponent,
    bar: BarChartComponent,
    radar: RadarChartComponent,
};

const Chart: React.FC<ChartProps> = ({ data, dataKey, chartType }) => {
    const ChartComponent = chartComponents[chartType] || LineChartComponent;

    useEffect(() => {
        const originalConsoleError = console.error;

        console.error = (...args: any[]) => {
            if (typeof args[0] === "string" && /defaultProps/.test(args[0])) {
                return;
            }

            originalConsoleError(...args);
        };

        return () => {
            console.error = originalConsoleError;
        };
    }, []);

    return (
        <div className="chart-wrapper">
            {(!data || data.length === 0) ? (
                <Loading />
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <ChartComponent data={data} dataKey={dataKey} />
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default Chart;
