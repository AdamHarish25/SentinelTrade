"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface MarketSentimentProps {
    score: number;
    isLoading: boolean;
}

export function MarketSentiment({ score, isLoading }: MarketSentimentProps) {
    const color = score > 60 ? "#10B981" : score > 40 ? "#F59E0B" : "#EF4444"
    const chartData = [{ name: 'Sentiment', value: score, fill: color }]

    return (
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
                <CardTitle>Market Sentiment</CardTitle>
                <CardDescription>Greed & Fear Index</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center relative">
                <div className="h-[250px] w-full relative">
                    {isLoading ? (
                        <Skeleton className="h-[250px] w-[250px] rounded-full opacity-20 mx-auto" />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="80%"
                                    outerRadius="100%"
                                    barSize={20}
                                    data={chartData}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar
                                        background
                                        dataKey="value"
                                        cornerRadius={30}
                                        fill={color}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center">
                                <span className="text-4xl font-bold text-foreground">{score}</span>
                                <p className="text-sm text-muted-foreground">{score > 60 ? 'Greed' : score > 40 ? 'Neutral' : 'Fear'}</p>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
