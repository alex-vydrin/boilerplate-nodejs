import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// GET /users - List all users with pagination and filters
router.get('/', userController.listUsers.bind(userController));

// POST /users - Create a new user
router.post('/', userController.createUser.bind(userController));

// GET /users/:id - Get a specific user
router.get('/:id', userController.getUser.bind(userController));

// PUT /users/:id - Update a user
router.put('/:id', userController.updateUser.bind(userController));

// DELETE /users/:id - Delete a user
router.delete('/:id', userController.deleteUser.bind(userController));

export const usersRouter = router;
