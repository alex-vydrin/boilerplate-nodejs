import {
    User,
    CreateUserParams,
    UpdateUserParams,
} from "../entities/user.entity";
import { CreateUserUseCase } from "../usecases/user/create-user.usecase";
import { GetUserUseCase } from "../usecases/user/get-user.usecase";
import { UpdateUserUseCase } from "../usecases/user/update-user.usecase";
import { DeleteUserUseCase } from "../usecases/user/delete-user.usecase";
import {
    ListUsersParams,
    ListUsersUseCase,
} from "../usecases/user/list-users.usecase";
import { logger } from "../utils/logger";
import { IPaginatedResult } from "../interfaces/repository.interface";

export class UserService {
    private createUserUseCase: CreateUserUseCase;
    private getUserUseCase: GetUserUseCase;
    private updateUserUseCase: UpdateUserUseCase;
    private deleteUserUseCase: DeleteUserUseCase;
    private listUsersUseCase: ListUsersUseCase;

    constructor() {
        this.createUserUseCase = new CreateUserUseCase();
        this.getUserUseCase = new GetUserUseCase();
        this.updateUserUseCase = new UpdateUserUseCase();
        this.deleteUserUseCase = new DeleteUserUseCase();
        this.listUsersUseCase = new ListUsersUseCase();
    }

    async createUser(userData: CreateUserParams): Promise<User> {
        logger.info("UserService: Creating user", userData);

        const result = await this.createUserUseCase.execute(userData);

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || "Failed to create user");
        }

        return result.data;
    }

    async getUserById(id: number): Promise<User> {
        logger.info("UserService: Getting user by ID", { userId: id });

        const result = await this.getUserUseCase.execute({ id });

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || "Failed to get user");
        }

        return result.data;
    }

    async listUsers(options: ListUsersParams): Promise<IPaginatedResult<User>> {
        logger.info("UserService: Listing users", options);

        const result = await this.listUsersUseCase.execute(options);

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || "Failed to list users");
        }

        return result.data;
    }

    async updateUser(id: number, updateData: UpdateUserParams): Promise<User> {
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

    async deleteUser(id: number): Promise<void> {
        logger.info("UserService: Deleting user", { userId: id });

        const result = await this.deleteUserUseCase.execute({ id });

        if (!result.success) {
            throw new Error(result.error?.message || "Failed to delete user");
        }
    }
}
