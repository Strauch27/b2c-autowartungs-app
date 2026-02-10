'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { KanbanColumn } from './KanbanColumn';
import { OrderCard } from './OrderCard';

interface Order {
  id: string;
  bookingNumber: string;
  customer: string;
  vehicle: string;
  vehicleBrandLogo?: string;
  vehiclePlate: string;
  vehicleMileage?: number;
  vehicleYear?: number;
  service: string;
  status: 'pending' | 'inProgress' | 'completed' | 'cancelled';
  backendStatus?: string;
  date: string;
  deliveryDeadline?: Date;
  extensionApproved?: boolean;
}

interface KanbanBoardProps {
  orders: Order[];
  onAccept: (orderId: string, backendStatus?: string) => void;
  onComplete: (orderId: string, backendStatus?: string) => void;
  onOpenDetails: (order: Order) => void;
  onOpenExtension: (orderId: string, customerName: string) => void;
}

export function KanbanBoard({ orders, onAccept, onComplete, onOpenDetails, onOpenExtension }: KanbanBoardProps) {
  const t = useTranslations('workshopDashboard');
  const [mobileTab, setMobileTab] = useState<'new' | 'inProgress' | 'completed'>('new');

  const newOrders = orders.filter(o => o.status === 'pending');
  const inProgressOrders = orders.filter(o => o.status === 'inProgress');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const renderColumn = (columnOrders: Order[], column: 'new' | 'inProgress' | 'completed') => {
    return columnOrders.map(order => (
      <OrderCard
        key={order.id}
        bookingNumber={order.bookingNumber || order.id}
        vehicle={order.vehicle}
        vehicleBrandLogo={order.vehicleBrandLogo}
        vehiclePlate={order.vehiclePlate}
        vehicleMileage={order.vehicleMileage}
        vehicleYear={order.vehicleYear}
        service={order.service}
        customer={order.customer}
        date={order.date}
        column={column}
        backendStatus={order.backendStatus}
        deliveryDeadline={order.deliveryDeadline}
        extensionApproved={order.extensionApproved}
        onAccept={() => onAccept(order.id, order.backendStatus)}
        onComplete={() => onComplete(order.id, order.backendStatus)}
        onExtension={() => onOpenExtension(order.id, order.customer)}
        onViewDetails={() => onOpenDetails(order)}
      />
    ));
  };

  // Mobile: tabbed view
  const mobileTabs = [
    { key: 'new' as const, label: t('kanban.new'), count: newOrders.length },
    { key: 'inProgress' as const, label: t('kanban.inProgress'), count: inProgressOrders.length },
    { key: 'completed' as const, label: t('kanban.completed'), count: completedOrders.length },
  ];

  return (
    <div data-testid="kanban-board">
      {/* Mobile tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1 lg:hidden">
        {mobileTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mobileTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Mobile: single column */}
      <div className="lg:hidden">
        {mobileTab === 'new' && (
          <KanbanColumn title={t('kanban.new')} color="blue" count={newOrders.length}>
            {renderColumn(newOrders, 'new')}
          </KanbanColumn>
        )}
        {mobileTab === 'inProgress' && (
          <KanbanColumn title={t('kanban.inProgress')} color="amber" count={inProgressOrders.length}>
            {renderColumn(inProgressOrders, 'inProgress')}
          </KanbanColumn>
        )}
        {mobileTab === 'completed' && (
          <KanbanColumn title={t('kanban.completed')} color="green" count={completedOrders.length}>
            {renderColumn(completedOrders, 'completed')}
          </KanbanColumn>
        )}
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden gap-5 lg:grid lg:grid-cols-3">
        <KanbanColumn title={t('kanban.new')} color="blue" count={newOrders.length}>
          {renderColumn(newOrders, 'new')}
        </KanbanColumn>
        <KanbanColumn title={t('kanban.inProgress')} color="amber" count={inProgressOrders.length}>
          {renderColumn(inProgressOrders, 'inProgress')}
        </KanbanColumn>
        <KanbanColumn title={t('kanban.completed')} color="green" count={completedOrders.length}>
          {renderColumn(completedOrders, 'completed')}
        </KanbanColumn>
      </div>
    </div>
  );
}
