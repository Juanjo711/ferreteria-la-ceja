"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCOP } from "@/lib/format";
import type { DailySales } from "@/lib/queries/admin";

/**
 * Gráfico de barras de los últimos 7 días. Recharts en cliente.
 *
 * El componente acepta los datos ya pre-calculados por el server (un array
 * de {date, label, total}) — toda la lógica de fechas/agrupación vive en
 * src/lib/queries/admin.ts.
 */
export function SalesChart({ data }: { data: DailySales[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e2" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fontWeight: 700, fill: "#574236" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#574236" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${v / 1000}k` : String(v)
            }
            width={50}
          />
          <Tooltip
            cursor={{ fill: "rgba(242, 122, 26, 0.08)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #dec1b1",
              fontSize: 12,
              padding: "6px 10px",
            }}
            formatter={(value) => [
              typeof value === "number" ? formatCOP(value) : String(value ?? "—"),
              "Ventas",
            ]}
          />
          <Bar dataKey="total" fill="#F27A1A" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
