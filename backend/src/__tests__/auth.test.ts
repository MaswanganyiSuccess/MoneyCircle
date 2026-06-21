// ============================================================
// MUST BE FIRST – ensures test environment is set
// ============================================================
process.env.NODE_ENV = 'test';

import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import app from '../app';
import { User } from '../models/User.model';
import { config } from '../config/env';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const TEST_DB_URI =
  process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/moneycircle_test';
process.env.MONGODB_URI = TEST_DB_URI;

console.log(`🔧 Using test database URI: ${TEST_DB_URI}`);

jest.setTimeout(120000);

// Valid SA ID: Male, born 1995-01-15
const validUser = {
  email: 'valid@example.com',
  password: 'Test@1234',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+27721234567',
  idNumber: '9501155123084',
  role: 'borrower',
  monthlyIncome: 50000,
};

// Invalid ID (wrong Luhn)
const invalidUser = {
  email: 'invalid@example.com',
  password: 'Test@1234',
  firstName: 'Jane',
  lastName: 'Smith',
  phoneNumber: '+27729876543',
  idNumber: '1234567890123', // ❌ invalid
  role: 'borrower',
};

// Shared user for login/refresh/logout – uses a DIFFERENT valid ID
const sharedUser = {
  email: 'shared@example.com',
  password: 'Test@1234',
  firstName: 'Shared',
  lastName: 'User',
  phoneNumber: '+27123456789',
  idNumber: '8001015009087', // ✅ Female, born 1980-01-01
  role: 'borrower',
};

const ensureUserWithCorrectPassword = async (userData = sharedUser) => {
  const existing = await User.findOne({ email: userData.email });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userData.password, salt);
    const user = new User({
      ...userData,
      passwordHash: hash,
    });
    await user.save();
    console.log('✅ User created with correct password');
  } else {
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(userData.password, salt);
    await User.updateOne(
      { _id: existing._id },
      { $set: { passwordHash: newHash } }
    );
    console.log('✅ User password reset to match test');
  }
  const freshUser = await User.findOne({ email: userData.email });
  console.log('👤 User email:', freshUser?.email);
  console.log('🔐 New hashed password:', freshUser?.passwordHash);
};

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    console.log(`🔌 App config MONGODB_URI: ${config.mongoUri}`);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
    }
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for connection to be fully open...');
      await new Promise<void>((resolve) => {
        if (mongoose.connection.readyState === 1) {
          resolve();
        } else {
          mongoose.connection.once('open', () => resolve());
        }
      });
    }
    console.log('✅ Connection ready (readyState: ' + mongoose.connection.readyState + ')');
    await User.deleteMany({});
    console.log('🗑️ Users collection cleared');
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
  }, 60000);

  describe('Registration', () => {
    it('should register a new user with valid ID and auto‑extract gender/DOB', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(validUser.email);

      const user = await User.findOne({ email: validUser.email });
      expect(user).toBeDefined();
      expect(user!.dateOfBirth).toBeDefined();
      expect(user!.gender).toBe('Male');
      expect(user!.age).toBeGreaterThan(18);

      console.log('✅ User registered with extracted DOB:', user!.dateOfBirth);
    }, 30000);

    it('should not register with invalid ID number', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/ID number|Invalid/);
    }, 30000);

    it('should not register with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already registered');
    }, 30000);

    it('should not register with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'missing@example.com',
          password: 'Test@1234',
          // missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    }, 30000);
  });

  describe('Login', () => {
    beforeAll(async () => {
      if (mongoose.connection.readyState !== 1) {
        console.log('⏳ Reconnecting for Login tests...');
        await mongoose.connect(TEST_DB_URI);
      }
      await ensureUserWithCorrectPassword(sharedUser);
    }, 60000);

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: sharedUser.email,
          password: sharedUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    }, 30000);

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: sharedUser.email,
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 30000);
  });

  describe('Refresh Token', () => {
    let refreshToken: string;

    beforeAll(async () => {
      if (mongoose.connection.readyState !== 1) {
        console.log('⏳ Reconnecting for Refresh tests...');
        await mongoose.connect(TEST_DB_URI);
      }
      await ensureUserWithCorrectPassword(sharedUser);

      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: sharedUser.email,
          password: sharedUser.password,
        });
      refreshToken = login.body.data?.tokens?.refreshToken;
      console.log('🔄 Refresh token from login:', refreshToken);
    }, 60000);

    it('should refresh access token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    }, 30000);

    it('should not refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }, 30000);
  });

  describe('Logout', () => {
    let accessToken: string;

    beforeAll(async () => {
      if (mongoose.connection.readyState !== 1) {
        console.log('⏳ Reconnecting for Logout tests...');
        await mongoose.connect(TEST_DB_URI);
      }
      await ensureUserWithCorrectPassword(sharedUser);

      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: sharedUser.email,
          password: sharedUser.password,
        });
      accessToken = login.body.data?.tokens?.accessToken;
      console.log('🔑 Access token from login:', accessToken);
    }, 60000);

    it('should logout user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    }, 30000);
  });
});