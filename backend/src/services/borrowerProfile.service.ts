import { BorrowerProfile, IBorrowerProfile } from '../models/BorrowerProfile.model';
import { User } from '../models/User.model';
import { BorrowerProfileInput } from '../validators/borrowerProfile.validator';

export class BorrowerProfileService {
  /**
   * Create or update a borrower profile.
   * Automatically computes netIncome = monthlyIncome - deductions.
   */
  static async upsertProfile(
    userId: string,
    data: BorrowerProfileInput
  ): Promise<IBorrowerProfile> {
    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Compute net income
    const netIncome = data.monthlyIncome - data.deductions;

    const profileData = {
      ...data,
      netIncome,
      userId,
    };

    const profile = await BorrowerProfile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Link profile to user
    if (!user.borrowerProfile) {
      user.borrowerProfile = profile._id;
      await user.save();
    }

    return profile;
  }

  /**
   * Verify if address matches ID copy or bank statement.
   * This is a placeholder – you'd implement actual matching logic.
   */
  static async verifyAddressMatch(profileId: string): Promise<boolean> {
    const profile = await BorrowerProfile.findById(profileId);
    if (!profile) return false;
    // For now, just return the flag from the profile
    return profile.address.sameAsId;
  }

  /**
   * Get a borrower's full profile (including user details if needed)
   */
  static async getProfile(userId: string): Promise<IBorrowerProfile | null> {
    return BorrowerProfile.findOne({ userId });
  }
}