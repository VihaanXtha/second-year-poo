import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Store, Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { StatCardData, ActivityItem } from '../types';

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards: StatCardData[] = stats
    ? [
        {
          id: 1,
          title: 'Total Revenue',
          value: `Rs. ${stats.total_revenue.toLocaleString()}`,
          change: '12.5%',
          changeType: 'increase',
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          id: 2,
          title: 'Active Users',
          value: stats.total_users.toLocaleString(),
          change: '8.2%',
          changeType: 'increase',
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          id: 3,
          title: 'Total Vendors',
          value: stats.total_vendors.toLocaleString(),
          change: '3.1%',
          changeType: 'increase',
          icon: Store,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          id: 4,
          title: 'Total Products',
          value: stats.total_products.toLocaleString(),
          change: '5.4%',
          changeType: 'increase',
          icon: Package,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
        },
      ]
    : [];

  const activityData: ActivityItem[] = stats?.recent_orders?.map((order: any) => ({
    id: order.id,
    userName: order.user?.name || 'Unknown',
    userAvatar: `https://i.pravatar.cc/32?u=${order.user_id}`,
    action: 'placed order',
    target: `#${order.order_number}`,
    time: new Date(order.created_at).toLocaleDateString(),
    status: order.status === 'delivered' ? 'Completed' : order.status === 'cancelled' ? 'Pending' : 'Active',
    amount: `Rs. ${Number(order.total).toLocaleString()}`,
    statusColor: order.status === 'delivered'
      ? 'bg-green-100 text-green-700'
      : order.status === 'cancelled'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700',
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.id} data={card} />
        ))}
      </div>

      <DataTable
        data={activityData}
        columns={[
          { key: 'user', header: 'User', render: (item: ActivityItem) => (
            <div className="flex items-center gap-3">
              <img src={item.userAvatar} alt={item.userName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
              <div>
                <p className="font-semibold text-slate-900 text-sm">{item.userName}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>
            </div>
          )},
          { key: 'action', header: 'Action', render: (item: ActivityItem) => (
            <div>
              <span className="font-medium text-slate-700 text-sm">{item.action}</span>{' '}
              <span className="text-slate-400 font-mono text-xs">{item.target}</span>
            </div>
          )},
          { key: 'status', header: 'Status', render: (item: ActivityItem) => (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.statusColor}`}>
              {item.status}
            </span>
          )},
          { key: 'amount', header: 'Amount', className: 'text-right', render: (item: ActivityItem) => (
            <span className="font-mono font-bold text-slate-900 text-sm">{item.amount}</span>
          )},
        ]}
        title="Recent Orders"
        searchable={false}
        currentPage={1}
        setCurrentPage={() => {}}
        totalPages={1}
        startIndex={0}
        endIndex={activityData.length}
        totalItems={activityData.length}
      />
    </div>
  );
};
