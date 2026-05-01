import { LOGGING_SERVICE } from '@common/constants';
import { DecodedToken, IJwtService, ILoggingService } from '@domain/services';
import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService implements IJwtService {
  private readonly logger: ReturnType<ILoggingService['createServiceLogger']>;

  constructor(
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {
    this.logger = this.loggingService.createServiceLogger(JwtService.name);
  }

  decodeUserToken(token?: string): DecodedToken | null {
    try {
      if (!token) {
        this.logger.warn('Token is null or empty');
        return null;
      }

      const decoded = this.decodeToken(token);
      if (!decoded) {
        this.logger.warn('Failed to decode token');
        return null;
      }

      this.logger.info(`Token decoded successfully for user: ${decoded.sub || decoded.preferred_username}`);
      return decoded;
    } catch (error) {
      this.logger.error(`Error decoding user token: ${error.message}`);
      return null;
    }
  }

  decodeToken(token: string): DecodedToken | null {
    try {
      if (!token) {
        this.logger.warn('Token is empty or null');
        return null;
      }

      const cleanToken = this.cleanToken(token);
      const decoded = jwt.decode(cleanToken) as DecodedToken;

      if (!decoded) {
        this.logger.warn('Failed to decode token');
        return null;
      }

      this.logger.debug(`Token decoded successfully for user: ${decoded.sub || decoded.userId}`);
      return decoded;
    } catch (error) {
      this.logger.error(`Error decoding token: ${error.message}`);
      return null;
    }
  }

  private cleanToken(token: string): string {
    return token.replace(/^Bearer\s+/i, '').trim();
  }
}
