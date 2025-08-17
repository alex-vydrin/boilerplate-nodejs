import {
    IPaginatedRepository,
    IPaginationOptions,
    IPaginatedResult,
} from "../interfaces/repository.interface";
import { User, UserFilters } from "../entities/user.entity";

// In-memory storage for demo purposes
// In a real application, this would be replaced with a database implementation
class UserRepository implements IPaginatedRepository<User> {
    private users: Map<string, User> = new Map();

    async findById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async findAll(): Promise<User[]> {
        return Array.from(this.users.values());
    }

    async create(data: Partial<User>): Promise<User> {
        const id = Math.random().toString(36).substr(2, 9);
        const now = new Date();

        const user: User = {
            id,
            email: data.email!,
            name: data.name!,
            isActive: data.isActive ?? true,
            createdAt: now,
            updatedAt: now,
        };

        this.users.set(id, user);
        return user;
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        const user = this.users.get(id);
        if (!user) return null;

        const updatedUser: User = {
            ...user,
            ...data,
            updatedAt: new Date(),
        };

        this.users.set(id, updatedUser);
        return updatedUser;
    }

    async delete(id: string): Promise<boolean> {
        return this.users.delete(id);
    }

    async findWithPagination(
        options: IPaginationOptions,
    ): Promise<IPaginatedResult<User>> {
        const {
            page,
            limit,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = options;
        const users = Array.from(this.users.values());

        // Sort users
        users.sort((a, b) => {
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
        const paginatedUsers = users.slice(startIndex, endIndex);

        return {
            data: paginatedUsers,
            meta: {
                page,
                limit,
                total: users.length,
                totalPages: Math.ceil(users.length / limit),
            },
        };
    }

    async findByField(field: keyof User, value: any): Promise<User[]> {
        const users = Array.from(this.users.values());
        return users.filter((user) => user[field] === value);
    }

    async findByFilters(filters: UserFilters): Promise<User[]> {
        const users = Array.from(this.users.values());

        return users.filter((user) => {
            if (
                filters.isActive !== undefined &&
                user.isActive !== filters.isActive
            ) {
                return false;
            }
            if (filters.email && !user.email.includes(filters.email)) {
                return false;
            }
            if (filters.name && !user.name.includes(filters.name)) {
                return false;
            }
            return true;
        });
    }
}

export const userRepository = new UserRepository();
