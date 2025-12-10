'use server';

import { ServerActionBase } from './base';
import { DealService } from '../services/DealService';
import { ActionResponse } from '@/types/actions';
import { Deal } from '@prisma/client';

interface CreateDealInput {
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: string;
  probability?: number;
  closeDate?: Date;
  accountId?: string;
  contactId?: string;
  pipelineId?: string;
  tags?: string[];
}

interface UpdateDealInput extends CreateDealInput {
  id: string;
}

interface GetDealsInput {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  accountId?: string;
  contactId?: string;
}

interface DeleteDealInput {
  id: string;
}

class CreateDealAction extends ServerActionBase<CreateDealInput, Deal> {
  async execute(input: CreateDealInput): Promise<ActionResponse<Deal>> {
    const context = await this.getContext();
    const dealService = new DealService(context.organizationId);

    try {
      const deal = await dealService.createDeal({
        ...input,
        organizationId: context.organizationId,
        userId: context.userId,
      });

      return {
        success: true,
        data: deal,
        message: 'Deal created successfully',
        revalidatePath: '/dashboard/deals',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create deal',
      };
    }
  }
}

class UpdateDealAction extends ServerActionBase<UpdateDealInput, Deal> {
  async execute(input: UpdateDealInput): Promise<ActionResponse<Deal>> {
    const context = await this.getContext();
    const dealService = new DealService(context.organizationId);

    try {
      const deal = await dealService.updateDeal(input.id, {
        ...input,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: deal,
        message: 'Deal updated successfully',
        revalidatePath: `/dashboard/deals/${input.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update deal',
      };
    }
  }
}

class GetDealAction extends ServerActionBase<{ id: string }, Deal> {
  async execute({ id }: { id: string }): Promise<ActionResponse<Deal>> {
    const context = await this.getContext();
    const dealService = new DealService(context.organizationId);

    try {
      const deal = await dealService.getDealById(id);

      if (!deal) {
        return {
          success: false,
          error: 'Deal not found',
        };
      }

      return {
        success: true,
        data: deal,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch deal',
      };
    }
  }
}

class GetDealsAction extends ServerActionBase<GetDealsInput, { deals: Deal[]; total: number }> {
  async execute(input: GetDealsInput): Promise<ActionResponse<{ deals: Deal[]; total: number }>> {
    const context = await this.getContext();
    const dealService = new DealService(context.organizationId);

    try {
      const { page = 1, limit = 10, search = '', stage, accountId, contactId } = input;
      const skip = (page - 1) * limit;

      const result = await dealService.getDeals({
        skip,
        take: limit,
        search,
        stage,
        accountId,
        contactId,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: result,
        revalidatePath: '/dashboard/deals',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch deals',
      };
    }
  }
}

class DeleteDealAction extends ServerActionBase<DeleteDealInput, void> {
  async execute(input: DeleteDealInput): Promise<ActionResponse<void>> {
    const context = await this.getContext();
    const dealService = new DealService(context.organizationId);

    try {
      await dealService.deleteDeal(input.id);

      return {
        success: true,
        message: 'Deal deleted successfully',
        revalidatePath: '/dashboard/deals',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete deal',
      };
    }
  }
}

// Export action handlers
export const createDeal = createServerActionHandler(CreateDealAction);
export const updateDeal = createServerActionHandler(UpdateDealAction);
export const getDeal = createServerActionHandler(GetDealAction);
export const getDeals = createServerActionHandler(GetDealsAction);
export const deleteDeal = createServerActionHandler(DeleteDealAction);