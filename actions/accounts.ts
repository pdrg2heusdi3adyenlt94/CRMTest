'use server';

import { ServerActionBase } from './base';
import { AccountService } from '../services/AccountService';
import { ActionResponse } from '@/types/actions';
import { Account } from '@prisma/client';

interface CreateAccountInput {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface UpdateAccountInput extends CreateAccountInput {
  id: string;
}

interface GetAccountsInput {
  page?: number;
  limit?: number;
  search?: string;
}

interface DeleteAccountInput {
  id: string;
}

class CreateAccountAction extends ServerActionBase<CreateAccountInput, Account> {
  async execute(input: CreateAccountInput): Promise<ActionResponse<Account>> {
    const context = await this.getContext();
    const accountService = new AccountService(context.organizationId);

    try {
      const account = await accountService.createAccount({
        ...input,
        organizationId: context.organizationId,
        userId: context.userId,
      });

      return {
        success: true,
        data: account,
        message: 'Account created successfully',
        revalidatePath: '/dashboard/accounts',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create account',
      };
    }
  }
}

class UpdateAccountAction extends ServerActionBase<UpdateAccountInput, Account> {
  async execute(input: UpdateAccountInput): Promise<ActionResponse<Account>> {
    const context = await this.getContext();
    const accountService = new AccountService(context.organizationId);

    try {
      const account = await accountService.updateAccount(input.id, {
        ...input,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: account,
        message: 'Account updated successfully',
        revalidatePath: `/dashboard/accounts/${input.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update account',
      };
    }
  }
}

class GetAccountAction extends ServerActionBase<{ id: string }, Account> {
  async execute({ id }: { id: string }): Promise<ActionResponse<Account>> {
    const context = await this.getContext();
    const accountService = new AccountService(context.organizationId);

    try {
      const account = await accountService.getAccountById(id);

      if (!account) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch account',
      };
    }
  }
}

class GetAccountsAction extends ServerActionBase<GetAccountsInput, { accounts: Account[]; total: number }> {
  async execute(input: GetAccountsInput): Promise<ActionResponse<{ accounts: Account[]; total: number }>> {
    const context = await this.getContext();
    const accountService = new AccountService(context.organizationId);

    try {
      const { page = 1, limit = 10, search = '' } = input;
      const skip = (page - 1) * limit;

      const result = await accountService.getAccounts({
        skip,
        take: limit,
        search,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: result,
        revalidatePath: '/dashboard/accounts',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch accounts',
      };
    }
  }
}

class DeleteAccountAction extends ServerActionBase<DeleteAccountInput, void> {
  async execute(input: DeleteAccountInput): Promise<ActionResponse<void>> {
    const context = await this.getContext();
    const accountService = new AccountService(context.organizationId);

    try {
      await accountService.deleteAccount(input.id);

      return {
        success: true,
        message: 'Account deleted successfully',
        revalidatePath: '/dashboard/accounts',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account',
      };
    }
  }
}

// Export action handlers
export const createAccount = createServerActionHandler(CreateAccountAction);
export const updateAccount = createServerActionHandler(UpdateAccountAction);
export const getAccount = createServerActionHandler(GetAccountAction);
export const getAccounts = createServerActionHandler(GetAccountsAction);
export const deleteAccount = createServerActionHandler(DeleteAccountAction);