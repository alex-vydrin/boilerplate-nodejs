// Base repository interface
export interface IBaseRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

// Pagination interface
export interface IPaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface IPaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Extended repository with pagination
export interface IPaginatedRepository<T> extends IBaseRepository<T> {
    findWithPagination(
        options: IPaginationOptions,
    ): Promise<IPaginatedResult<T>>;
    findByField(field: keyof T, value: any): Promise<T[]>;
    findByFilters(filters: any): Promise<T[]>;
}
