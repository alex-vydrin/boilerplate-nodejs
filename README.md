# New Project Base

A clean, modern Node.js/TypeScript project template with Express, Docker, and best practices.

## Features

- ⚡ **TypeScript** - Full type safety and modern JavaScript features
- 🚀 **Express.js** - Fast, unopinionated web framework
- 🐳 **Docker** - Containerized development and production
- 🧪 **Jest** - Comprehensive testing framework
- 📝 **ESLint + Prettier** - Code quality and formatting
- 🔒 **Security** - Helmet.js for security headers
- 📊 **Health Checks** - Built-in monitoring endpoints
- 🏗️ **Modular Structure** - Clean, scalable architecture

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Yarn or npm

### Installation

1. **Clone or copy the project:**

    ```bash
    # If you're starting from this template
    git clone <your-repo-url>
    cd new-project-base
    ```

2. **Install dependencies:**

    ```bash
    yarn install
    # or
    npm install
    ```

3. **Set up environment:**

    ```bash
    cp env.example .env
    # Edit .env with your configuration
    ```

4. **Start development server:**

    ```bash
    # Using Docker (recommended)
    yarn dev

    # Or locally
    yarn start:dev
    ```

The server will be available at `http://localhost:3000`

## Available Scripts

| Script            | Description                      |
| ----------------- | -------------------------------- |
| `yarn dev`        | Start development with Docker    |
| `yarn start:dev`  | Start development server locally |
| `yarn build`      | Build for production             |
| `yarn start`      | Start production server          |
| `yarn test`       | Run tests                        |
| `yarn test:watch` | Run tests in watch mode          |
| `yarn lint`       | Run ESLint                       |
| `yarn lint-fix`   | Fix ESLint issues                |
| `yarn prettier`   | Format code with Prettier        |

## Project Structure

```
src/
├── controllers/     # Request handlers (uses usecases)
├── entities/        # Domain entities
├── interfaces/      # Repository and usecase interfaces
├── middleware/      # Express middleware
├── repositories/    # Data access layer
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── usecases/        # Application usecases (clean architecture)
├── utils/           # Utility functions
├── tests/           # Test files
└── index.ts         # Application entry point
```

## API Endpoints

### Health Check

- `GET /health` - Application health status

### User

- `GET /users` - List users with pagination and filters
- `POST /users` - Create a new user
- `GET /users/:id` - Get a specific user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Example

- `GET /example` - Example endpoint
- `GET /example/:id` - Example with parameter
- `POST /example` - Example POST endpoint

## Development

### Adding New Features

The project follows Clean Architecture principles with the following layers:

1. **Entities** (`src/entities/`) - Domain models
2. **Use Cases** (`src/usecases/`) - Application business logic
3. **Controllers** (`src/controllers/`) - Request/response handling
4. **Routes** (`src/routes/`) - API endpoints
5. **Repositories** (`src/repositories/`) - Data access layer
6. **Services** (`src/services/`) - Business logic services

#### Example: Adding a new User feature

1. **Create Entity** (`src/entities/user.entity.ts`)
2. **Create Repository** (`src/repositories/user.repository.ts`)
3. **Create Use Cases** (`src/usecases/user/`)
4. **Create Controller** (`src/controllers/user.controller.ts`)
5. **Create Routes** (`src/routes/users.ts`)
6. **Add to main app** (`src/index.ts`)

#### Example Route Structure:

```typescript
// src/routes/users.ts
import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

router.get("/", userController.listUsers.bind(userController));
router.post("/", userController.createUser.bind(userController));
router.get("/:id", userController.getUser.bind(userController));

export const usersRouter = router;
```

### Adding Middleware

1. Create middleware in `src/middleware/`
2. Import and use in `src/index.ts`

### Environment Variables

Copy `env.example` to `.env` and configure:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level (default: info)

## Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test --coverage
```

## Docker

### Development

```bash
yarn dev
```

### Production Build

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

### Using Docker Compose

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down
```

## Deployment

### Production Build

```bash
yarn build
yarn start
```

### Docker Production

```bash
docker build --target production -t my-app .
docker run -p 3000:3000 my-app
```

### Railway Deployment

This project is ready for Railway deployment!

#### Quick Deploy

```bash
# Connect your GitHub repository to Railway
# Railway will automatically deploy on push
# Or use Railway CLI:
npm install -g @railway/cli
railway login
railway link
railway up
```

#### Manual Deployment

1. **Connect Repository**: Go to [Railway Dashboard](https://railway.app/dashboard)
2. **Create Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose your repository
4. **Deploy**: Railway will automatically deploy on push

#### Environment Variables

Railway automatically provides necessary environment variables:

- `PORT` - Automatically assigned by Railway
- `NODE_ENV` - Set to "production" in production environments

#### Database Setup

```bash
# In Railway Dashboard:
# 1. Go to "New" → "Database" → "PostgreSQL"
# 2. Railway will provide DATABASE_URL automatically
```

📖 **Detailed Railway Guide**: See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for comprehensive deployment instructions.

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Run linting before committing

## License

MIT License - see LICENSE file for details
