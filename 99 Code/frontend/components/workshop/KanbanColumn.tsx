'use client';

interface KanbanColumnProps {
  title: string;
  color: 'blue' | 'amber' | 'green';
  count: number;
  children: React.ReactNode;
}

const colorMap = {
  blue: {
    dot: 'bg-primary',
    badge: 'bg-primary/10 text-primary',
  },
  amber: {
    dot: 'bg-cta',
    badge: 'bg-cta/10 text-cta',
  },
  green: {
    dot: 'bg-success',
    badge: 'bg-success/10 text-success',
  },
};

export function KanbanColumn({ title, color, count, children }: KanbanColumnProps) {
  const colors = colorMap[color];

  return (
    <div className="min-h-[200px] lg:min-h-[400px]" data-testid={`kanban-column-${color === 'blue' ? 'new' : color === 'amber' ? 'inProgress' : 'completed'}`}>
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${colors.badge}`}>
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
