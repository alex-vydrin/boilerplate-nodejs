import {
    IUseCaseWithValidation,
    UseCaseResult,
} from "../../interfaces/usecase.interface";
import { User, CreateUserParams } from "../../entities/user.entity";
import { getUserRepository } from "../../repositories/factory";
import { logger } from "../../utils/logger";

export class CreateUserUseCase
    implements IUseCaseWithValidation<CreateUserParams, UseCaseResult<User>>
{
    private userRepository = getUserRepository();

    async validate(request: CreateUserParams): Promise<boolean> {
        const { email, name } = request;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // Validate name length
        if (!name || name.length < 2 || name.length > 100) {
            return false;
        }

        // Check if email already exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            return false;
        }

        return true;
    }

    async execute(request: CreateUserParams): Promise<UseCaseResult<User>> {
        try {
            logger.info("Creating user", { email: request.email });

            // Validate request
            const isValid = await this.validate(request);
            if (!isValid) {
                return {
                    success: false,
                    error: {
                        message: "Invalid user data or email already exists",
                        code: "VALIDATION_ERROR",
                    },
                };
            }

            // Create user
            const user = await this.userRepository.create(request);

            logger.info("User created successfully", { userId: user.id });

            return {
                success: true,
                data: user,
            };
        } catch (error) {
            logger.error("Error creating user", {
                error,
                email: request.email,
            });

            return {
                success: false,
                error: {
                    message: "Failed to create user",
                    code: "INTERNAL_ERROR",
                },
            };
        }
    }
}
