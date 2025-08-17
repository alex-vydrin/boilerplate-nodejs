import { IUseCase, UseCaseResult } from "../../interfaces/usecase.interface";
import { User } from "../../entities/user.entity";
import { getUserRepository } from "../../repositories/factory";
import { logger } from "../../utils/logger";

export interface GetUserRequest {
    id: number;
}

export class GetUserUseCase
    implements IUseCase<GetUserRequest, UseCaseResult<User>>
{
    private userRepository = getUserRepository();

    async execute(request: GetUserRequest): Promise<UseCaseResult<User>> {
        try {
            logger.info("Getting user by ID", { userId: request.id });

            const user = await this.userRepository.findById(request.id);

            if (!user) {
                return {
                    success: false,
                    error: {
                        message: "User not found",
                        code: "USER_NOT_FOUND",
                    },
                };
            }

            logger.info("User retrieved successfully", { userId: request.id });

            return {
                success: true,
                data: user,
            };
        } catch (error) {
            logger.error("Error getting user", { error, userId: request.id });

            return {
                success: false,
                error: {
                    message: "Failed to get user",
                    code: "INTERNAL_ERROR",
                },
            };
        }
    }
}
