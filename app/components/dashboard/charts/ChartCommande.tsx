"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  ventes: {
    label: "Ventes (€)",
    color: "#2563eb",
  },
} satisfies ChartConfig;

interface ChartCommandeProps {
  data: Array<{ month: string; ventes: number }>;
}

export function ChartCommande({ data }: ChartCommandeProps) {
  // Convertir les centimes en euros pour l'affichage
  const chartData = data.map((item) => ({
    month: item.month,
    ventes: item.ventes / 100,
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full ">
      <BarChart accessibilityLayer data={chartData}>
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis tickLine={false} tickMargin={10} axisLine={false} />

        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="ventes" fill="var(--color-ventes)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
