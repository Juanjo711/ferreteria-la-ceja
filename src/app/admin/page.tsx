import {
  getAdminKpis,
  getLast7DaysSales,
  getRecentOrders,
  getTopProducts,
} from "@/lib/queries/admin";
import { formatCOP } from "@/lib/format";
import { KpiCard } from "@/components/admin/KpiCard";
import { SalesChart } from "@/components/admin/SalesChart";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { TopProductsList } from "@/components/admin/TopProductsList";

export const metadata = { title: "Panel — Dashboard" };

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export default async function AdminDashboardPage() {
  const [kpis, sales7d, recent, top] = await Promise.all([
    getAdminKpis(),
    getLast7DaysSales(),
    getRecentOrders(5),
    getTopProducts(5),
  ]);

  const now = new Date();
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline">Dashboard</h1>
          <p className="text-on-surface-variant capitalize">{monthLabel}</p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label="Ventas del mes"
          value={formatCOP(kpis.ventasDelMes)}
          icon="payments"
          tone="primary"
        />
        <KpiCard
          label="Pedidos pendientes"
          value={String(kpis.pedidosPendientes)}
          icon="pending_actions"
          tone="warning"
          hint={kpis.pedidosPendientes > 0 ? "Por confirmar" : undefined}
          hintTone={kpis.pedidosPendientes > 0 ? "danger" : "neutral"}
        />
        <KpiCard
          label="Clientes nuevos"
          value={String(kpis.clientesNuevosDelMes)}
          icon="person_add"
          tone="tertiary"
          hint="este mes"
          hintTone="positive"
        />
        <KpiCard
          label="Alertas inventario"
          value={String(kpis.alertasInventario)}
          icon="warning"
          tone="error"
          hint={kpis.alertasInventario > 0 ? "Stock bajo" : undefined}
          hintTone={kpis.alertasInventario > 0 ? "danger" : "neutral"}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-on-surface font-headline">
                Rendimiento de ventas
              </h2>
              <p className="text-sm text-secondary">Últimos 7 días (pedidos no cancelados)</p>
            </div>
          </div>
          <SalesChart data={sales7d} />
        </div>
        <TopProductsList products={top} />
      </section>

      <RecentOrdersTable orders={recent} />
    </div>
  );
}
