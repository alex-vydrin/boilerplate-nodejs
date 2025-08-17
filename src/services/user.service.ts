import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
} from "../entities/user.entity";
import { CreateUserUseCase } from "../usecases/user/create-user.usecase";
import { GetUserUseCase } from "../usecases/user/get-user.usecase";
import { ListUsersUseCase } from "../usecases/user/list-users.usecase";
import { UpdateUserUseCase } from "../usecases/user/update-user.usecase";
import { DeleteUserUseCase } from "../usecases/user/delete-user.usecase";
import { userRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger";

export class UserService {
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

    async createUser(userData: CreateUserRequest): Promise<User> {
        logger.info("UserService: Creating user", { email: userData.email });

        const result = await this.createUserUseCase.execute(userData);

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || "Failed to create user");
        }

        return result.data;
    }

    async getUserById(id: string): Promise<User> {
        logger.info("UserService: Getting user by ID", { userId: id });

        const result = await this.getUserUseCase.execute({ id });

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || "User not found");
        }

        return result.data;
    }

    async listUsers(options: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        filters?: {
            isActive?: boolean;
            email?: string;
            name?: string;
        };
    }) {
        logger.info("UserService: Listing users", options);

        const result = await this.listUsersUseCase.execute(options);

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || "Failed to list users");
        }

        return result.data;
    }

    async updateUser(id: string, updateData: UpdateUserRequest): Promise<User> {
        logger.info("UserService: Updating user", { userId: id, updateData });

        const result = await this.updateUserUseCase.execute({
            id,
            data: updateData,
        });

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || "Failed to update user");
        }

        return result.data;
    }

    async deleteUser(id: string): Promise<void> {
        logger.info("UserService: Deleting user", { userId: id });

        const result = await this.deleteUserUseCase.execute({ id });

        if (!result.success) {
            throw new Error(result.error?.message || "Failed to delete user");
        }
    }

    // Additional business logic methods
    async activateUser(id: string): Promise<User> {
        logger.info("UserService: Activating user", { userId: id });

        return this.updateUser(id, { isActive: true });
    }

    async deactivateUser(id: string): Promise<User> {
        logger.info("UserService: Deactivating user", { userId: id });

        return this.updateUser(id, { isActive: false });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        logger.info("UserService: Getting user by email", { email });

        const users = await userRepository.findByField("email", email);
        if (users.length === 0) {
            return null;
        }

        const user = users[0];
        if (!user) {
            return null;
        }

        // eslint-disable-next-line no-unused-vars
        const { password: _password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }

    async getActiveUsers(): Promise<User[]> {
        logger.info("UserService: Getting active users");

        const result = await this.listUsers({
            filters: { isActive: true },
        });

        return result.data;
    }
}
