
'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { useEffect, useState } from 'react'
import { getMonthlyChartData, ChartData } from '@/apis/app/dashboard'

interface OverviewProps {
    businessId: string
}

export function Overview({ businessId }: OverviewProps) {
    const [data, setData] = useState<ChartData[]>([])

    useEffect(() => {
        getMonthlyChartData(businessId).then(setData)
    }, [businessId])

    if (!data.length) return <div>No hay datos suficientes</div>

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: any) => `S/.${value}`}
                />
                <Tooltip formatter={(value: any) => `S/.${value}`} />
                <Legend />
                <Bar dataKey="sales" name="Ventas" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Compras" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
