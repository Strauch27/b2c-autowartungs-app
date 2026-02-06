'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEuro } from '@/lib/utils/currency';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import {
  Wrench,
  Droplet,
  Disc,
  ShieldCheck,
  Snowflake,
  LucideIcon,
} from 'lucide-react';

interface ServiceCardProps {
  name: string;
  description: string;
  icon: string;
  price?: number; // in cents
  featured?: boolean;
  loading?: boolean;
  selected?: boolean;
  onSelect: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  wrench: Wrench,
  droplet: Droplet,
  disc: Disc,
  'shield-check': ShieldCheck,
  snowflake: Snowflake,
};

export function ServiceCard({
  name,
  description,
  icon,
  price,
  featured = false,
  loading = false,
  selected = false,
  onSelect,
}: ServiceCardProps) {
  const { t } = useLanguage();
  const IconComponent = iconMap[icon] || Wrench;

  return (
    <Card
      className={`relative transition-all hover:shadow-lg ${
        selected ? 'ring-2 ring-primary' : ''
      } ${featured ? 'border-primary' : ''}`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="text-xs">
            {t.serviceCard.featured}
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${featured ? 'bg-primary/10' : 'bg-muted'}`}>
            <IconComponent
              className={`h-6 w-6 ${featured ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">
              {t.serviceCard.calculating}
            </span>
          </div>
        ) : price !== undefined ? (
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">{formatEuro(price)}</p>
            <p className="text-xs text-muted-foreground">
              {t.serviceCard.forYourVehicle}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {t.serviceCard.priceOnRequest}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={selected ? 'default' : 'outline'}
          onClick={onSelect}
          disabled={loading}
        >
          {selected ? t.serviceCard.selected : t.serviceCard.select}
        </Button>
      </CardFooter>
    </Card>
  );
}
