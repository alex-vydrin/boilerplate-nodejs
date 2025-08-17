import { IUseCase, UseCaseResult } from '../../interfaces/usecase.interface';
import { IPaginatedRepository } from '../../interfaces/repository.interface';
import { User } from '../../entities/user.entity';
import { logger } from '../../utils/logger';

export interface GetUserRequest {
  id: string;
}

export class GetUserUseCase implements IUseCase<GetUserRequest, UseCaseResult<User>> {
  constructor(private userRepository: IPaginatedRepository<User>) {}

  async execute(request: GetUserRequest): Promise<UseCaseResult<User>> {
    try {
      logger.info('Getting user by ID', { userId: request.id });

      const user = await this.userRepository.findById(request.id);

      if (!user) {
        return {
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        };
      }

      // Remove sensitive data before returning
      const { password, ...userWithoutPassword } = user;

      logger.info('User retrieved successfully', { userId: request.id });

      return {
        success: true,
        data: userWithoutPassword as User,
      };
    } catch (error) {
      logger.error('Error getting user', { error, userId: request.id });

      return {
        success: false,
        error: {
          message: 'Failed to get user',
          code: 'INTERNAL_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
