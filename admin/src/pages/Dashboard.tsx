import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { CategoryChart } from '../components/CategoryChart';
import { ActivityTable } from '../components/ActivityTable';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface Stats {
  total_users: number;
  total_vendors: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  recent_users: any[];
  recent_orders: any[];
}

export const Dashboard: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/admin/stats');
        setStats(data);
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

  const statCards = stats ? [
    { id: 1, title: 'Total Revenue', value: `Rs. ${stats.total_revenue.toLocaleString()}`, change: '', changeType: 'increase' as const, icon: 'trending-up', color: 'text-green-400' },
    { id: 2, title: 'Active Users', value: stats.total_users.toLocaleString(), change: '', changeType: 'increase' as const, icon: 'users', color: 'text-blue-400' },
    { id: 3, title: 'Total Vendors', value: stats.total_vendors.toLocaleString(), change: '', changeType: 'increase' as const, icon: 'store', color: 'text-purple-400' },
    { id: 4, title: 'Total Products', value: stats.total_products.toLocaleString(), change: '', changeType: 'increase' as const, icon: 'package', color: 'text-amber-400' },
  ] : [];

  const activityData = stats?.recent_orders?.map((order: any) => ({
    id: order.id,
    userName: order.user?.name || 'Unknown',
    userAvatar: `https://i.pravatar.cc/32?u=${order.user_id}`,
    action: 'placed order',
    target: `#${order.order_number}`,
    time: new Date(order.created_at).toLocaleDateString(),
    status: order.status,
    amount: `Rs. ${Number(order.total).toLocaleString()}`,
    statusColor: order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400',
  })) || [];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.id} data={card} />
        ))}
      </div>

      <ActivityTable data={activityData} />
    </div>
  );
};
