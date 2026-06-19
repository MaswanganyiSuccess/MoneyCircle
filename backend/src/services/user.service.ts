import { User, IUser } from '../models/User.model';
import { AuditLog } from '../models/AuditLog.model';
import bcrypt from 'bcrypt';
import { FilterQuery } from 'mongoose';

export class UserService {
  static async getProfile(userId: string): Promise<Partial<IUser> | null> {
    return await User.findById(userId).select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires');
  }

  static async updateProfile(
    userId: string,
    data: Partial<Pick<IUser, 'firstName' | 'lastName' | 'phoneNumber' | 'address'>>
  ): Promise<Partial<IUser> | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires');
    return user;
  }

  static async getUserById(userId: string): Promise<Partial<IUser> | null> {
    return await User.findById(userId).select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires');
  }

  static async listUsers(
    filter: {
      role?: string;
      status?: string;
      search?: string;
    },
    options: {
      page: number;
      limit: number;
      sort: string;
    }
  ): Promise<{ users: Partial<IUser>[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, sort } = options;
    const skip = (page - 1) * limit;

    const query: FilterQuery<IUser> = { deletedAt: null };
    if (filter.role) query.role = filter.role;
    if (filter.status) query.status = filter.status;
    if (filter.search) {
      query.$or = [
        { email: { $regex: filter.search, $options: 'i' } },
        { firstName: { $regex: filter.search, $options: 'i' } },
        { lastName: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new Error('Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    return true;
  }

  static async uploadAvatar(userId: string, filePath: string): Promise<Partial<IUser> | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: filePath } },
      { new: true }
    ).select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires');
    return user;
  }

  static async submitKyc(
    userId: string,
    documents: { idDocument?: string; proofOfAddress?: string; selfie?: string }
  ): Promise<Partial<IUser> | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          kycDocuments: documents,
          kycStatus: 'pending',
        },
      },
      { new: true }
    ).select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires');
    return user;
  }

  static async getKycStatus(userId: string): Promise<{ kycStatus: string; kycDocuments?: any }> {
    const user = await User.findById(userId).select('kycStatus kycDocuments');
    if (!user) throw new Error('User not found');
    return {
      kycStatus: user.kycStatus,
      kycDocuments: user.kycDocuments,
    };
  }

  static async deleteAccount(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { deletedAt: new Date() } });
  }

  static async logAction(
    userId: string,
    action: string,
    metadata: any,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await AuditLog.create({
      userId,
      action,
      ipAddress: ip || '',
      userAgent: userAgent || '',
      metadata,
    });
  }  // <-- This closing brace was missing
}