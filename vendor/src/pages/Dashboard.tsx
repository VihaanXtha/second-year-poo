import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { SalesChart } from '../components/SalesChart';
import { CategoryChart } from '../components/CategoryChart';
import { OrdersTable } from '../components/OrdersTable';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface SalesData {
  day: string;
  sales: number;
  orders: number;
}

export const Dashboard: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [stats, setStats] = useState<{ total_orders: number; total_products: number; pending_orders: number } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [salesData, ordersData] = await Promise.all([
          apiFetch('/vendor/sales?period=weekly'),
          apiFetch('/vendor/orders'),
        ]);
        setSales((salesData.sales || []).map((s: any) => ({ day: s.date || `${s.month}/${s.year}`, sales: s.revenue, orders: s.orders })));
        setOrders(ordersData.data || []);
        setStats({
          total_orders: ordersData.total || ordersData.data?.length || 0,
          total_products: 0,
          pending_orders: ordersData.data?.filter((o: any) => o.status === 'pending').length || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch]);

  if (loading) {
    return <div className="text-slate-400">Loading dashboard...</div>;
  }

  const statCards = [
    { id: 1, title: 'Total Sales', value: `Rs. ${sales.reduce((a, b) => a + b.sales, 0).toLocaleString()}`, change: '', changeType: 'increase' as const, icon: 'trending_up', color: 'text-[#dc2626]' },
    { id: 2, title: 'Active Listings', value: stats?.total_products?.toString() || '0', change: '', changeType: 'increase' as const, icon: 'inventory_2', color: 'text-[#38bdf8]' },
    { id: 3, title: 'Pending Orders', value: stats?.pending_orders?.toString() || '0', change: '', changeType: 'increase' as const, icon: 'pending_actions', color: 'text-amber-400' },
    { id: 4, title: 'Total Orders', value: stats?.total_orders?.toString() || '0', change: '', changeType: 'increase' as const, icon: 'receipt_long', color: 'text-purple-400' },
  ];

  const categoryData = [
    { name: 'PC Components', value: 85, color: '#dc2626' },
    { name: 'IoT Gear', value: 34, color: '#38bdf8' },
    { name: 'Networking', value: 22, color: '#10b981' },
    { name: 'Laptops', value: 15, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Vendor Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.id} data={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesChart data={sales} />
        <CategoryChart data={categoryData} />
      </div>

      <OrdersTable data={orders.map((o: any) => ({
        id: o.id,
        orderId: `#${o.order_number}`,
        customerName: o.user?.name || 'Unknown',
        customerAvatar: `https://i.pravatar.cc/32?u=${o.user_id}`,
        product: 'Multiple items',
        date: new Date(o.created_at).toLocaleDateString(),
        status: o.status,
        amount: `Rs. ${Number(o.total).toLocaleString()}`,
        statusColor: o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : o.status === 'shipped' ? 'bg-purple-100 text-purple-700' : o.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700',
      }))} />
    </div>
  );
};
