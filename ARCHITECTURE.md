# Clean Architecture Implementation

This project implements Clean Architecture principles to ensure maintainability, testability, and separation of concerns.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Routes    │  │ Controllers │  │ Middleware  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Use Cases  │  │  Services   │  │  Interfaces │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Entities   │  │  Value      │  │  Domain     │        │
│  │             │  │  Objects    │  │  Services   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Repositories │  │   External  │  │   Database  │        │
│  │             │  │   APIs      │  │   Config    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Presentation Layer

**Location**: `src/routes/`, `src/controllers/`, `src/middleware/`

**Responsibilities**:

- Handle HTTP requests and responses
- Validate input data
- Transform data for the application layer
- Handle authentication and authorization
- Manage session state

**Components**:

- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle request/response logic
- **Middleware**: Cross-cutting concerns (auth, logging, etc.)

### 2. Application Layer

**Location**: `src/usecases/`, `src/services/`, `src/interfaces/`

**Responsibilities**:

- Implement business use cases
- Orchestrate domain objects
- Handle application-specific business rules
- Manage transactions

**Components**:

- **Use Cases**: Single, specific business operations
- **Services**: Complex business logic and orchestration
- **Interfaces**: Contracts between layers

### 3. Domain Layer

**Location**: `src/entities/`

**Responsibilities**:

- Define business entities and rules
- Implement domain logic
- Ensure business invariants

**Components**:

- **Entities**: Core business objects
- **Value Objects**: Immutable objects representing concepts
- **Domain Services**: Business logic that doesn't belong to entities

### 4. Infrastructure Layer

**Location**: `src/repositories/`, `src/utils/`

**Responsibilities**:

- Implement data persistence
- Handle external service communication
- Provide technical capabilities

**Components**:

- **Repositories**: Data access implementations
- **External APIs**: Third-party service integrations
- **Utilities**: Technical helper functions

## Dependency Flow

```
Presentation → Application → Domain ← Infrastructure
     ↑              ↑           ↑           ↑
     └──────────────┴───────────┴───────────┘
```

**Key Principles**:

- Dependencies point inward
- Domain layer has no dependencies
- Infrastructure depends on domain
- Application depends on domain
- Presentation depends on application

## Implementation Details

### Use Cases

Use cases represent single, specific business operations. They:

- Accept input data (requests)
- Validate business rules
- Orchestrate domain objects
- Return results

```typescript
export class CreateUserUseCase
    implements IUseCaseWithValidation<CreateUserParams, UseCaseResult<User>>
{
    constructor(private userRepository: IPaginatedRepository<User>) {}

    async validate(request: CreateUserParams): Promise<boolean> {
        // Business validation logic
    }

    async execute(request: CreateUserParams): Promise<UseCaseResult<User>> {
        // Business logic implementation
    }
}
```

### Repositories

Repositories abstract data access and provide a clean interface for the domain:

```typescript
export interface IBaseRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}
```

### Controllers

Controllers handle HTTP-specific concerns and delegate to use cases:

```typescript
export class UserController {
    constructor() {
        this.createUserUseCase = new CreateUserUseCase(userRepository);
    }

    async createUser(req: Request, res: Response): Promise<void> {
        const result = await this.createUserUseCase.execute(req.body);
        res.status(201).json(result);
    }
}
```

## Benefits

### 1. **Testability**

- Each layer can be tested independently
- Use cases can be unit tested without HTTP concerns
- Repositories can be mocked for testing

### 2. **Maintainability**

- Clear separation of concerns
- Changes in one layer don't affect others
- Business logic is isolated from infrastructure

### 3. **Flexibility**

- Easy to swap implementations (e.g., different databases)
- Can add new interfaces without changing existing code
- Supports multiple presentation layers (API, CLI, etc.)

### 4. **Scalability**

- Teams can work on different layers independently
- Clear boundaries reduce merge conflicts
- Easy to add new features without breaking existing ones

## Best Practices

### 1. **Dependency Injection**

- Use constructor injection for dependencies
- Avoid creating dependencies inside classes
- Use interfaces for loose coupling

### 2. **Error Handling**

- Use consistent error types across layers
- Handle errors at the appropriate layer
- Provide meaningful error messages

### 3. **Validation**

- Validate input at the presentation layer
- Validate business rules in use cases
- Use domain objects to enforce invariants

### 4. **Logging**

- Log at appropriate levels in each layer
- Include relevant context in log messages
- Use structured logging for better analysis

## Example Flow

1. **HTTP Request** → Route
2. **Route** → Controller
3. **Controller** → Use Case
4. **Use Case** → Repository
5. **Repository** → Database
6. **Response flows back up the chain**

This architecture ensures that:

- Business logic is independent of frameworks
- Data access is abstracted
- Testing is straightforward
- Code is maintainable and scalable
