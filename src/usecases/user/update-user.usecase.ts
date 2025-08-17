import {
    IUseCaseWithValidation,
    UseCaseResult,
} from "../../interfaces/usecase.interface";
import { User, UpdateUserParams } from "../../entities/user.entity";
import { getUserRepository } from "../../repositories/factory";
import { logger } from "../../utils/logger";

export interface UpdateUserUseCaseRequest {
    id: number;
    data: UpdateUserParams;
}

export class UpdateUserUseCase
    implements
        IUseCaseWithValidation<UpdateUserUseCaseRequest, UseCaseResult<User>>
{
    private userRepository = getUserRepository();

    async validate(request: UpdateUserUseCaseRequest): Promise<boolean> {
        const { id, data } = request;

        // Check if user exists
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return false;
        }

        // Validate email format if provided
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return false;
            }

            // Check if email is already taken by another user
            const userWithEmail = await this.userRepository.findByEmail(
                data.email,
            );
            if (userWithEmail && userWithEmail.id !== id) {
                return false;
            }
        }

        // Validate name length if provided
        if (data.name && (data.name.length < 2 || data.name.length > 100)) {
            return false;
        }

        return true;
    }

    async execute(
        request: UpdateUserUseCaseRequest,
    ): Promise<UseCaseResult<User>> {
        try {
            const { id, data } = request;

            logger.info("Updating user", { userId: id, updateData: data });

            // Validate request
            const isValid = await this.validate(request);
            if (!isValid) {
                return {
                    success: false,
                    error: {
                        message: "Invalid update data or user not found",
                        code: "VALIDATION_ERROR",
                    },
                };
            }

            // Update user
            const updatedUser = await this.userRepository.update(id, data);

            if (!updatedUser) {
                return {
                    success: false,
                    error: {
                        message: "User not found",
                        code: "USER_NOT_FOUND",
                    },
                };
            }

            logger.info("User updated successfully", { userId: id });

            return {
                success: true,
                data: updatedUser,
            };
        } catch (error) {
            logger.error("Error updating user", { error, userId: request.id });

            return {
                success: false,
                error: {
                    message: "Failed to update user",
                    code: "INTERNAL_ERROR",
                },
            };
        }
    }
}
