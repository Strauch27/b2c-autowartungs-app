import { ServiceType } from '../types/service';

export interface ServiceCardData {
  type: ServiceType;
  name: string;
  description: string;
  icon: string;
  featured?: boolean;
}

export const AVAILABLE_SERVICES: ServiceCardData[] = [
  {
    type: ServiceType.INSPECTION,
    name: 'Inspektion/Wartung',
    description:
      'Umfassende Inspektion nach Herstellervorgaben inkl. Ölwechsel, Filterwechsel und Fahrzeugprüfung',
    icon: 'wrench',
    featured: true,
  },
  {
    type: ServiceType.OIL_SERVICE,
    name: 'Ölservice',
    description:
      'Motoröl ablassen und erneuern, Ölfilter wechseln, Service-Intervall zurücksetzen',
    icon: 'droplet',
  },
  {
    type: ServiceType.BRAKE_SERVICE,
    name: 'Bremsservice',
    description:
      'Bremsbeläge und Bremsscheiben prüfen und wechseln, Bremssystem kontrollieren',
    icon: 'disc',
  },
  {
    type: ServiceType.TUV,
    name: 'TÜV/HU',
    description:
      'Hauptuntersuchung durch zertifizierte Prüforganisation, inkl. Vorbereitung',
    icon: 'shield-check',
  },
  {
    type: ServiceType.CLIMATE_SERVICE,
    name: 'Klimaservice',
    description:
      'Klimaanlage desinfizieren, Kältemittel auffüllen, Funktion prüfen',
    icon: 'snowflake',
  },
];

export function getServiceInfo(serviceType: ServiceType): ServiceCardData | undefined {
  return AVAILABLE_SERVICES.find((s) => s.type === serviceType);
}
