'use server';

import { ServerActionBase } from './base';
import { ContactService } from '@/src/services/ContactService';
import { ActionResponse } from '@/types/actions';
import { Contact } from '@prisma/client';

interface CreateContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  accountId?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface UpdateContactInput extends CreateContactInput {
  id: string;
}

interface GetContactsInput {
  page?: number;
  limit?: number;
  search?: string;
  accountId?: string;
}

interface DeleteContactInput {
  id: string;
}

class CreateContactAction extends ServerActionBase<CreateContactInput, Contact> {
  async execute(input: CreateContactInput): Promise<ActionResponse<Contact>> {
    const context = await this.getContext();
    const contactService = new ContactService(context.organizationId);

    try {
      const contact = await contactService.createContact({
        ...input,
        organizationId: context.organizationId,
        userId: context.userId,
      });

      return {
        success: true,
        data: contact,
        message: 'Contact created successfully',
        revalidatePath: '/dashboard/contacts',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact',
      };
    }
  }
}

class UpdateContactAction extends ServerActionBase<UpdateContactInput, Contact> {
  async execute(input: UpdateContactInput): Promise<ActionResponse<Contact>> {
    const context = await this.getContext();
    const contactService = new ContactService(context.organizationId);

    try {
      const contact = await contactService.updateContact(input.id, {
        ...input,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: contact,
        message: 'Contact updated successfully',
        revalidatePath: `/dashboard/contacts/${input.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update contact',
      };
    }
  }
}

class GetContactAction extends ServerActionBase<{ id: string }, Contact> {
  async execute({ id }: { id: string }): Promise<ActionResponse<Contact>> {
    const context = await this.getContext();
    const contactService = new ContactService(context.organizationId);

    try {
      const contact = await contactService.getContactById(id);

      if (!contact) {
        return {
          success: false,
          error: 'Contact not found',
        };
      }

      return {
        success: true,
        data: contact,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contact',
      };
    }
  }
}

class GetContactsAction extends ServerActionBase<GetContactsInput, { contacts: Contact[]; total: number }> {
  async execute(input: GetContactsInput): Promise<ActionResponse<{ contacts: Contact[]; total: number }>> {
    const context = await this.getContext();
    const contactService = new ContactService(context.organizationId);

    try {
      const { page = 1, limit = 10, search = '', accountId } = input;
      const skip = (page - 1) * limit;

      const result = await contactService.getContacts({
        skip,
        take: limit,
        search,
        accountId,
        organizationId: context.organizationId,
      });

      return {
        success: true,
        data: result,
        revalidatePath: '/dashboard/contacts',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contacts',
      };
    }
  }
}

class DeleteContactAction extends ServerActionBase<DeleteContactInput, void> {
  async execute(input: DeleteContactInput): Promise<ActionResponse<void>> {
    const context = await this.getContext();
    const contactService = new ContactService(context.organizationId);

    try {
      await contactService.deleteContact(input.id);

      return {
        success: true,
        message: 'Contact deleted successfully',
        revalidatePath: '/dashboard/contacts',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete contact',
      };
    }
  }
}

// Export action handlers
export const createContact = createServerActionHandler(CreateContactAction);
export const updateContact = createServerActionHandler(UpdateContactAction);
export const getContact = createServerActionHandler(GetContactAction);
export const getContacts = createServerActionHandler(GetContactsAction);
export const deleteContact = createServerActionHandler(DeleteContactAction);