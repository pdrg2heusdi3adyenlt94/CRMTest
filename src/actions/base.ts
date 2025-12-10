import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { ActionResponse } from '@/types/actions';

export type ActionContext = {
  userId: string;
  organizationId: string;
};

export abstract class ServerActionBase<TInput, TOutput> {
  protected async getContext(): Promise<ActionContext> {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }

    return {
      userId: user.id,
      organizationId: user.organizationId,
    };
  }

  // Abstract method to be implemented by subclasses
  abstract execute(input: TInput): Promise<ActionResponse<TOutput>>;

  // Method to handle the action execution with error handling
  async handle(input: TInput): Promise<ActionResponse<TOutput>> {
    try {
      const result = await this.execute(input);
      
      // Revalidate cache if successful
      if (result.success && result.revalidatePath) {
        revalidatePath(result.revalidatePath);
      }
      
      return result;
    } catch (error) {
      console.error('Server action error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }
}

// Helper function to create server action handlers
export function createServerActionHandler<TInput, TOutput>(
  actionClass: new () => ServerActionBase<TInput, TOutput>
) {
  return async (input: TInput) => {
    const actionInstance = new actionClass();
    return await actionInstance.handle(input);
  };
}