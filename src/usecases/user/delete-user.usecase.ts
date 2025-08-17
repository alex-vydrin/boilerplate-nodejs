import { IUseCase, UseCaseResult } from "../../interfaces/usecase.interface";
import { getUserRepository } from "../../repositories/factory";
import { logger } from "../../utils/logger";

export interface DeleteUserRequest {
    id: number;
}

export class DeleteUserUseCase
    implements IUseCase<DeleteUserRequest, UseCaseResult<void>>
{
    private userRepository = getUserRepository();

    async execute(request: DeleteUserRequest): Promise<UseCaseResult<void>> {
        try {
            const { id } = request;

            logger.info("Deleting user", { userId: id });

            // Check if user exists
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                return {
                    success: false,
                    error: {
                        message: "User not found",
                        code: "USER_NOT_FOUND",
                    },
                };
            }

            // Delete user
            const deleted = await this.userRepository.delete(id);

            if (!deleted) {
                return {
                    success: false,
                    error: {
                        message: "Failed to delete user",
                        code: "DELETE_FAILED",
                    },
                };
            }

            logger.info("User deleted successfully", { userId: id });

            return {
                success: true,
                data: undefined,
            };
        } catch (error) {
            logger.error("Error deleting user", { error, userId: request.id });

            return {
                success: false,
                error: {
                    message: "Failed to delete user",
                    code: "INTERNAL_ERROR",
                },
            };
        }
    }
}
