"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface SmartMoneyPulseProps {
    flowData?: {
        accumulation: number;
        distribution: number;
        neutral: number;
    };
    isLoading: boolean;
}

export function SmartMoneyPulse({ flowData, isLoading }: SmartMoneyPulseProps) {
    const chartData = flowData ? [
        { name: "Accumulation", value: flowData.accumulation, color: "#10B981" },
        { name: "Distribution", value: flowData.distribution, color: "#EF4444" },
        { name: "Neutral", value: flowData.neutral, color: "#334155" },
    ] : []

    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
                <CardTitle>Smart Money Pulse</CardTitle>
                <CardDescription>Daily Flow Analysis (Volume Spikes)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    {isLoading ? (
                        <Skeleton className="h-full w-full rounded-full opacity-20" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#F8FAFC", borderRadius: "8px" }}
                                    itemStyle={{ color: "#F8FAFC" }}
                                />
                                <Legend verticalAlign="bottom" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
