import { IUseCase, UseCaseResult } from '../../interfaces/usecase.interface';
import { IPaginatedRepository } from '../../interfaces/repository.interface';
import { logger } from '../../utils/logger';

export interface DeleteUserRequest {
  id: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export class DeleteUserUseCase implements IUseCase<DeleteUserRequest, UseCaseResult<DeleteUserResponse>> {
  constructor(private userRepository: IPaginatedRepository<any>) {}

  async execute(request: DeleteUserRequest): Promise<UseCaseResult<DeleteUserResponse>> {
    try {
      const { id } = request;

      logger.info('Deleting user', { userId: id });

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        };
      }

      // Delete user
      const deleted = await this.userRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: {
            message: 'Failed to delete user',
            code: 'DELETE_FAILED',
          },
        };
      }

      logger.info('User deleted successfully', { userId: id });

      return {
        success: true,
        data: {
          success: true,
          message: 'User deleted successfully',
        },
      };
    } catch (error) {
      logger.error('Error deleting user', { error, userId: request.id });

      return {
        success: false,
        error: {
          message: 'Failed to delete user',
          code: 'INTERNAL_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
