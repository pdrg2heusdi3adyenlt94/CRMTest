'use server';

import { ServerActionBase } from './base';
import { UserService } from '../services/UserService';
import { ActionResponse } from '@/types/actions';
import { User } from '@prisma/client';

interface CreateUserInput {
  email: string;
  name: string;
  role?: string;
  password?: string;
}

interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

interface GetUserInput {
  id: string;
}

interface GetUsersInput {
  page?: number;
  limit?: number;
  search?: string;
}

interface DeleteUserInput {
  id: string;
}

class CreateUserAction extends ServerActionBase<CreateUserInput, User> {
  async execute(input: CreateUserInput): Promise<ActionResponse<User>> {
    const context = await this.getContext();
    const userService = new UserService(context.organizationId);

    try {
      const user = await userService.createUser({
        ...input,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: user,
        message: 'User created successfully',
        revalidatePath: '/dashboard/users',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }
}

class UpdateUserAction extends ServerActionBase<UpdateUserInput, User> {
  async execute(input: UpdateUserInput): Promise<ActionResponse<User>> {
    const context = await this.getContext();
    const userService = new UserService(context.organizationId);

    try {
      const user = await userService.updateUser(input.id, {
        ...input,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: user,
        message: 'User updated successfully',
        revalidatePath: `/dashboard/users/${input.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }
}

class GetUserAction extends ServerActionBase<GetUserInput, User> {
  async execute(input: GetUserInput): Promise<ActionResponse<User>> {
    const context = await this.getContext();
    const userService = new UserService(context.organizationId);

    try {
      const user = await userService.getUserById(input.id);

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      };
    }
  }
}

class GetUsersAction extends ServerActionBase<GetUsersInput, { users: User[]; total: number }> {
  async execute(input: GetUsersInput): Promise<ActionResponse<{ users: User[]; total: number }>> {
    const context = await this.getContext();
    const userService = new UserService(context.organizationId);

    try {
      const { page = 1, limit = 10, search = '' } = input;
      const skip = (page - 1) * limit;

      const result = await userService.getUsers({
        skip,
        take: limit,
        search,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: result,
        revalidatePath: '/dashboard/users',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      };
    }
  }
}

class DeleteUserAction extends ServerActionBase<DeleteUserInput, void> {
  async execute(input: DeleteUserInput): Promise<ActionResponse<void>> {
    const context = await this.getContext();
    const userService = new UserService(context.organizationId);

    try {
      await userService.deleteUser(input.id);

      return {
        success: true,
        message: 'User deleted successfully',
        revalidatePath: '/dashboard/users',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  }
}

// Export action handlers
export const createUser = createServerActionHandler(CreateUserAction);
export const updateUser = createServerActionHandler(UpdateUserAction);
export const getUser = createServerActionHandler(GetUserAction);
export const getUsers = createServerActionHandler(GetUsersAction);
export const deleteUser = createServerActionHandler(DeleteUserAction);