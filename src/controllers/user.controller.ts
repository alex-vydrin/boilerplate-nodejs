import { Request, Response } from "express";
import { CreateUserUseCase } from "../usecases/user/create-user.usecase";
import { GetUserUseCase } from "../usecases/user/get-user.usecase";
import { ListUsersUseCase } from "../usecases/user/list-users.usecase";
import { UpdateUserUseCase } from "../usecases/user/update-user.usecase";
import { DeleteUserUseCase } from "../usecases/user/delete-user.usecase";
import { userRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger";

export class UserController {
    private createUserUseCase: CreateUserUseCase;
    private getUserUseCase: GetUserUseCase;
    private listUsersUseCase: ListUsersUseCase;
    private updateUserUseCase: UpdateUserUseCase;
    private deleteUserUseCase: DeleteUserUseCase;

    constructor() {
        this.createUserUseCase = new CreateUserUseCase(userRepository);
        this.getUserUseCase = new GetUserUseCase(userRepository);
        this.listUsersUseCase = new ListUsersUseCase(userRepository);
        this.updateUserUseCase = new UpdateUserUseCase(userRepository);
        this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
    }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, password } = req.body;

            const result = await this.createUserUseCase.execute({
                email,
                name,
                password,
            });

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.status(201).json(result);
        } catch (error) {
            logger.error("Controller error in createUser", { error });
            res.status(500).json({
                success: false,
                error: {
                    message: "Internal server error",
                    code: "INTERNAL_ERROR",
                },
            });
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: "User ID is required",
                        code: "MISSING_ID",
                    },
                });
                return;
            }

            const result = await this.getUserUseCase.execute({ id });

            if (!result.success) {
                res.status(404).json(result);
                return;
            }

            res.json(result);
        } catch (error) {
            logger.error("Controller error in getUser", { error });
            res.status(500).json({
                success: false,
                error: {
                    message: "Internal server error",
                    code: "INTERNAL_ERROR",
                },
            });
        }
    }

    async listUsers(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit, sortBy, sortOrder, isActive, email, name } =
                req.query;

            const result = await this.listUsersUseCase.execute({
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                sortBy: sortBy as string,
                sortOrder: sortOrder as "asc" | "desc",
                filters: {
                    isActive: isActive ? isActive === "true" : undefined,
                    email: email as string | undefined,
                    name: name as string | undefined,
                },
            });

            res.json(result);
        } catch (error) {
            logger.error("Controller error in listUsers", { error });
            res.status(500).json({
                success: false,
                error: {
                    message: "Internal server error",
                    code: "INTERNAL_ERROR",
                },
            });
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!id) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: "User ID is required",
                        code: "MISSING_ID",
                    },
                });
                return;
            }

            const result = await this.updateUserUseCase.execute({
                id,
                data: updateData,
            });

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.json(result);
        } catch (error) {
            logger.error("Controller error in updateUser", { error });
            res.status(500).json({
                success: false,
                error: {
                    message: "Internal server error",
                    code: "INTERNAL_ERROR",
                },
            });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: "User ID is required",
                        code: "MISSING_ID",
                    },
                });
                return;
            }

            const result = await this.deleteUserUseCase.execute({ id });

            if (!result.success) {
                res.status(404).json(result);
                return;
            }

            res.json(result);
        } catch (error) {
            logger.error("Controller error in deleteUser", { error });
            res.status(500).json({
                success: false,
                error: {
                    message: "Internal server error",
                    code: "INTERNAL_ERROR",
                },
            });
        }
    }
}
