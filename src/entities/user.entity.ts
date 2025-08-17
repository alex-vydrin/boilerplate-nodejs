export interface User {
    id: string;
    email: string;
    name: string;
    password?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserRequest {
    email: string;
    name: string;
    password: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    isActive?: boolean;
}

export interface UserFilters {
    isActive?: boolean | undefined;
    email?: string | undefined;
    name?: string | undefined;
}
