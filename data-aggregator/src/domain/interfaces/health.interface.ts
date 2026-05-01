export enum HealthStatus {
  UP = 'up',
  DOWN = 'down',
  UNKNOWN = 'unknown',
}

export interface ISimpleHealthResponseDto {
  status: string;
  timestamp?: string;
  version?: string;
  environment?: string;
}

export interface IServiceHealthStatus {
  name: string;
  status: HealthStatus;
  message?: string;
  responseTime?: number;
}

export interface IDetailedHealthResponseDto {
  status: HealthStatus;
  timestamp: string;
  version: string;
  environment: string;
  services: IServiceHealthStatus[];
  overallStatus: HealthStatus;
}
