import { IDetailedHealthResponseDto, ISimpleHealthResponseDto } from '../interfaces';

export interface IHealthService {
  /**
   * Get basic health status
   * @returns Promise<ISimpleHealthResponseDto>
   */
  getHealth(): Promise<ISimpleHealthResponseDto>;
}
