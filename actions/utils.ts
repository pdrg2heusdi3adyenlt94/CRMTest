'use server';

import { revalidatePath } from 'next/cache';

export interface FormActionResponse<T = void> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  message?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Generic form action handler that provides consistent response format
 */
export async function handleFormAction<TInput, TOutput>(
  action: (input: TInput) => Promise<FormActionResponse<TOutput>>,
  input: TInput,
  revalidatePaths?: string[]
): Promise<FormActionResponse<TOutput>> {
  try {
    const result = await action(input);
    
    // Revalidate cache if successful and paths are provided
    if (result.success && revalidatePaths) {
      revalidatePaths.forEach(path => revalidatePath(path));
    }
    
    return result;
  } catch (error) {
    console.error('Form action error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Revalidation helper to manually trigger cache updates
 */
export async function revalidateCache(paths: string[]) {
  paths.forEach(path => revalidatePath(path));
  return { success: true, message: 'Cache revalidated' };
}

/**
 * Action to handle bulk operations
 */
export async function bulkOperation<T>(
  operation: (item: T) => Promise<any>,
  items: T[],
  operationName: string = 'bulk operation'
): Promise<FormActionResponse> {
  try {
    const results = await Promise.allSettled(
      items.map(item => operation(item))
    );
    
    const successfulOperations = results.filter(r => r.status === 'fulfilled').length;
    const failedOperations = results.filter(r => r.status === 'rejected').length;
    
    if (failedOperations > 0) {
      return {
        success: false,
        message: `${operationName} partially completed. ${successfulOperations} succeeded, ${failedOperations} failed.`,
      };
    }
    
    return {
      success: true,
      message: `${operationName} completed successfully for ${successfulOperations} items`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to perform ${operationName}`,
    };
  }
}