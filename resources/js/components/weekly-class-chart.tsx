import { LineChartIcon, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { format } from 'date-fns';

interface Props {
    chartData: {
        date: string;
        total: number;
    }[];
    stroke: string;
}

export function WeeklyClassesChart({ chartData, stroke }: Props) {
    const chartConfig = {
        total: {
            label: 'date',
            color: stroke,
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-[#0ea5e9]" />
                    Daily Classes Trend
                </CardTitle>
                <CardDescription>
                    Track how many classes you had this week.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-56 w-full">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            hide
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    nameKey="date"
                                    labelFormatter={(date) =>
                                        format(new Date(date), 'dd MMM, yyyy')
                                    }
                                />
                            }
                        />
                        <Line
                            dataKey="total"
                            type="linear"
                            stroke="var(--color-total)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Check your daily classes this week.
            </CardFooter>
        </Card>
    );
}
