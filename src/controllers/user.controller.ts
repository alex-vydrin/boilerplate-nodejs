import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { logger } from "../utils/logger";
import { UserFilters } from "../entities/user.entity";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, name } = req.body;

            if (!email || !name) {
                res.status(400).json({
                    success: false,
                    error: "Email and name are required",
                });
                return;
            }

            const user = await this.userService.createUser({ email, name });

            res.status(201).json({
                success: true,
                data: user,
            });
        } catch (error) {
            logger.error("Error creating user", { error });

            res.status(500).json({
                success: false,
                error: "Failed to create user",
            });
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "User ID is required",
                });
                return;
            }

            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: "Invalid user ID",
                });
                return;
            }

            const user = await this.userService.getUserById(userId);

            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            logger.error("Error getting user", { error });

            if (error instanceof Error && error.message === "User not found") {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: "Failed to get user",
            });
        }
    }

    async listUsers(req: Request, res: Response): Promise<void> {
        try {
            const {
                page = "1",
                limit = "10",
                sortBy = "createdAt",
                sortOrder = "desc",
                isActive,
                email,
                name,
            } = req.query;

            const filters: UserFilters = {};
            if (isActive !== undefined) {
                filters.isActive = isActive === "true";
            }
            if (email && typeof email === "string") {
                filters.email = email;
            }
            if (name) {
                filters.name = name as string;
            }

            const result = await this.userService.listUsers({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                sortBy: sortBy as string,
                sortOrder: sortOrder as "asc" | "desc",
                ...(Object.keys(filters).length > 0 && { filters }),
            });

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            logger.error("Error listing users", { error });

            res.status(500).json({
                success: false,
                error: "Failed to list users",
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
                    error: "User ID is required",
                });
                return;
            }

            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: "Invalid user ID",
                });
                return;
            }

            const user = await this.userService.updateUser(userId, updateData);

            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            logger.error("Error updating user", { error });

            if (error instanceof Error && error.message === "User not found") {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: "Failed to update user",
            });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "User ID is required",
                });
                return;
            }

            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: "Invalid user ID",
                });
                return;
            }

            await this.userService.deleteUser(userId);

            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error) {
            logger.error("Error deleting user", { error });

            if (error instanceof Error && error.message === "User not found") {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: "Failed to delete user",
            });
        }
    }
}
