import { IUseCase, UseCaseResult } from "../../interfaces/usecase.interface";
import {
    IPaginatedRepository,
    IPaginationOptions,
    IPaginatedResult,
} from "../../interfaces/repository.interface";
import { User, UserFilters } from "../../entities/user.entity";
import { logger } from "../../utils/logger";

export interface ListUsersRequest {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    filters?: UserFilters | undefined;
}

export class ListUsersUseCase
    implements IUseCase<ListUsersRequest, UseCaseResult<IPaginatedResult<User>>>
{
    constructor(private userRepository: IPaginatedRepository<User>) {}

    async execute(
        request: ListUsersRequest,
    ): Promise<UseCaseResult<IPaginatedResult<User>>> {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = "createdAt",
                sortOrder = "desc",
                filters,
            } = request;

            logger.info("Listing users", {
                page,
                limit,
                sortBy,
                sortOrder,
                filters,
            });

            // Validate pagination parameters
            if (page < 1 || limit < 1 || limit > 100) {
                return {
                    success: false,
                    error: {
                        message: "Invalid pagination parameters",
                        code: "VALIDATION_ERROR",
                    },
                };
            }

            const paginationOptions: IPaginationOptions = {
                page,
                limit,
                sortBy,
                sortOrder,
            };

            let result: IPaginatedResult<User>;

            if (filters) {
                // If filters are provided, get all users and filter them
                const allUsers =
                    await this.userRepository.findByFilters(filters);

                // Apply sorting
                allUsers.sort((a: User, b: User) => {
                    const aValue = a[sortBy as keyof User];
                    const bValue = b[sortBy as keyof User];

                    // Handle undefined values
                    if (aValue === undefined && bValue === undefined) return 0;
                    if (aValue === undefined) return 1;
                    if (bValue === undefined) return -1;

                    if (sortOrder === "asc") {
                        return aValue > bValue ? 1 : -1;
                    }
                    return aValue < bValue ? 1 : -1;
                });

                // Apply pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedUsers = allUsers.slice(startIndex, endIndex);

                result = {
                    data: paginatedUsers.map((user: User) => {
                        const { password, ...userWithoutPassword } = user;
                        return userWithoutPassword as User;
                    }),
                    meta: {
                        page,
                        limit,
                        total: allUsers.length,
                        totalPages: Math.ceil(allUsers.length / limit),
                    },
                };
            } else {
                // Use repository pagination
                result =
                    await this.userRepository.findWithPagination(
                        paginationOptions,
                    );

                // Remove passwords from response
                result.data = result.data.map((user: User) => {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword as User;
                });
            }

            logger.info("Users listed successfully", {
                total: result.meta.total,
                page: result.meta.page,
                totalPages: result.meta.totalPages,
            });

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            logger.error("Error listing users", { error });

            return {
                success: false,
                error: {
                    message: "Failed to list users",
                    code: "INTERNAL_ERROR",
                    details:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
            };
        }
    }
}
