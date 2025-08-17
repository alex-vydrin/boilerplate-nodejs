/* eslint-disable no-unused-vars */
import { IUseCase, UseCaseResult } from "../../interfaces/usecase.interface";
import {
    IPaginationOptions,
    IPaginatedResult,
} from "../../interfaces/repository.interface";
import { User, UserFilters } from "../../entities/user.entity";
import { getUserRepository } from "../../repositories/factory";
import { logger } from "../../utils/logger";

export interface ListUsersParams extends IPaginationOptions {
    filters?: UserFilters;
}

export class ListUsersUseCase
    implements IUseCase<ListUsersParams, UseCaseResult<IPaginatedResult<User>>>
{
    private userRepository = getUserRepository();

    async execute(
        request: ListUsersParams,
    ): Promise<UseCaseResult<IPaginatedResult<User>>> {
        try {
            const {
                page,
                limit,
                sortBy = "createdAt",
                sortOrder = "desc",
                filters,
            } = request;

            logger.info("Listing users", {
                page,
                limit,
                sortBy,
                sortOrder,
                hasFilters: !!filters,
            });

            let result: IPaginatedResult<User>;

            if (filters) {
                // Use filters if provided
                const users = await this.userRepository.findByFilters(filters);
                result = {
                    data: users,
                    meta: {
                        page: 1,
                        limit: users.length,
                        total: users.length,
                        totalPages: 1,
                    },
                };
            } else {
                // Use pagination if no filters
                result = await this.userRepository.findWithPagination({
                    page,
                    limit,
                    sortBy,
                    sortOrder,
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
            logger.error("Error listing users", {
                request,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            return {
                success: false,
                error: {
                    message: "Failed to list users",
                    code: "INTERNAL_ERROR",
                },
            };
        }
    }
}
