import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '../config/env';
import { User, IUser } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

export const hashPassword = async (plainPassword: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, config.jwtAccessSecret as string, {
      expiresIn: config.jwtAccessExpiry as jwt.SignOptions['expiresIn'],
    } as jwt.SignOptions);
  }

  generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, config.jwtRefreshSecret as string, {
      expiresIn: config.jwtRefreshExpiry as jwt.SignOptions['expiresIn'],
    } as jwt.SignOptions);
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    idNumber: string;
    role: 'borrower' | 'lender';
  }): Promise<Partial<IUser>> {
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { idNumber: userData.idNumber }],
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new AppError('Email already registered', 409);
      }
      if (existingUser.idNumber === userData.idNumber) {
        throw new AppError('ID number already registered', 409);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const user = new User({
      ...userData,
      passwordHash,
      isEmailVerified: false,
    });

    await user.save();

    const userObj = user.toObject();
    const { passwordHash: _, refreshToken, resetPasswordToken, resetPasswordExpires, ...safeUser } = userObj;

    return safeUser as Partial<IUser>;
  }

  async login(email: string, password: string): Promise<{ user: Partial<IUser>; tokens: AuthTokens }> {
    // ✅ CRITICAL: select +passwordHash (it's hidden by default)
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.isLocked()) {
      throw new AppError('Account locked due to too many failed attempts. Try again later.', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await user.incrementFailedAttempts();
      throw new AppError('Invalid credentials', 401);
    }

    await user.resetFailedAttempts();
    user.lastLogin = new Date();
    await user.save();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    const userObj = user.toObject();
    const { passwordHash: _, refreshToken: __, resetPasswordToken, resetPasswordExpires, ...safeUser } = userObj;

    return {
      user: safeUser as Partial<IUser>,
      tokens: { accessToken, refreshToken },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret as string) as TokenPayload;

      const user = await User.findOne({
        _id: decoded.id,
        refreshToken: refreshToken,
      });

      if (!user) {
        throw new AppError('Invalid refresh token', 401);
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      user.refreshToken = newRefreshToken;
      await user.save();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      return 'If a user with that email exists, a reset link has been sent.';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;
    await user.save();
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      return jwt.verify(token, config.jwtAccessSecret as string) as TokenPayload;
    } catch {
      return null;
    }
  }
}

export const authService = AuthService.getInstance();