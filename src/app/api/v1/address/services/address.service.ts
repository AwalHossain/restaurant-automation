import httpStatus from 'http-status';
import ApiError from '../../../../../errors/ApiError';
import { prisma } from '../../../../../shared/prisma';
import { CreateAddressInput, UpdateAddressInput } from '../dtos/address.dto';

export class AddressService {
  async createAddress(input: CreateAddressInput, userId: string) {
    // If this is the first address or marked as default, handle default status
    if (input.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    // If this is the user's first address, make it default
    const addressCount = await prisma.address.count({
      where: { userId }
    });

    const address = await prisma.address.create({
      data: {
        ...input,
        userId,
        isDefault: input.isDefault || addressCount === 0
      }
    });

    return address;
  }

  async updateAddress(input: UpdateAddressInput, userId: string) {
    const address = await prisma.address.findUnique({
      where: { id: input.id }
    });

    if (!address || address.userId !== userId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
    }

    if (input.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    return await prisma.address.update({
      where: { id: input.id },
      data: input
    });
  }

  async deleteAddress(id: string, userId: string) {
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address || address.userId !== userId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
    }

    await prisma.address.delete({
      where: { id }
    });

    // If deleted address was default, set another address as default
    if (address.isDefault) {
      const anotherAddress = await prisma.address.findFirst({
        where: { userId }
      });

      if (anotherAddress) {
        await prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true }
        });
      }
    }
  }

  async getUserAddresses(userId: string) {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
      ]
    });
  }

  private async clearDefaultAddress(userId: string) {
    await prisma.address.updateMany({
      where: { 
        userId,
        isDefault: true
      },
      data: { isDefault: false }
    });
  }

  async validateAddressForCheckout(addressId: string, userId: string) {
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address || address.userId !== userId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invalid delivery address');
    }

    return address;
  }
} 