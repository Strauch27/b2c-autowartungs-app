import { ServiceType } from '../types/service';

export interface ServiceCardData {
  type: ServiceType;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  featured?: boolean;
}

export const AVAILABLE_SERVICES: ServiceCardData[] = [
  {
    type: ServiceType.INSPECTION,
    nameKey: 'inspection',
    descriptionKey: 'inspectionDesc',
    icon: 'wrench',
    featured: true,
  },
  {
    type: ServiceType.OIL_SERVICE,
    nameKey: 'oilService',
    descriptionKey: 'oilServiceDesc',
    icon: 'droplet',
  },
  {
    type: ServiceType.BRAKE_SERVICE,
    nameKey: 'brakeService',
    descriptionKey: 'brakeServiceDesc',
    icon: 'disc',
  },
  {
    type: ServiceType.TUV,
    nameKey: 'tuv',
    descriptionKey: 'tuvDesc',
    icon: 'shield-check',
  },
  {
    type: ServiceType.CLIMATE_SERVICE,
    nameKey: 'climateService',
    descriptionKey: 'climateServiceDesc',
    icon: 'snowflake',
  },
];

export function getServiceInfo(serviceType: ServiceType): ServiceCardData | undefined {
  return AVAILABLE_SERVICES.find((s) => s.type === serviceType);
}
