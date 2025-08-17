import { IUseCaseWithValidation, UseCaseResult } from '../../interfaces/usecase.interface';
import { IPaginatedRepository } from '../../interfaces/repository.interface';
import { User, CreateUserRequest } from '../../entities/user.entity';
import { logger } from '../../utils/logger';

export class CreateUserUseCase implements IUseCaseWithValidation<CreateUserRequest, UseCaseResult<User>> {
  constructor(private userRepository: IPaginatedRepository<User>) {}

  async validate(request: CreateUserRequest): Promise<boolean> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      return false;
    }

    // Validate name length
    if (!request.name || request.name.length < 2 || request.name.length > 100) {
      return false;
    }

    // Validate password strength
    if (!request.password || request.password.length < 8) {
      return false;
    }

    // Check if user already exists
    const existingUsers = await this.userRepository.findByField('email', request.email);
    if (existingUsers.length > 0) {
      return false;
    }

    return true;
  }

  async execute(request: CreateUserRequest): Promise<UseCaseResult<User>> {
    try {
      logger.info('Creating new user', { email: request.email });

      // Validate request
      const isValid = await this.validate(request);
      if (!isValid) {
        return {
          success: false,
          error: {
            message: 'Invalid user data or user already exists',
            code: 'VALIDATION_ERROR',
          },
        };
      }

      // Create user (password would be hashed in a real application)
      const user = await this.userRepository.create({
        email: request.email,
        name: request.name,
        password: request.password, // In real app, hash this
        isActive: true,
      });

      logger.info('User created successfully', { userId: user.id });

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      logger.error('Error creating user', { error, email: request.email });

      return {
        success: false,
        error: {
          message: 'Failed to create user',
          code: 'INTERNAL_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
