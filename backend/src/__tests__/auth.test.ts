import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import app from '../app';
import { User } from '../models/User.model';
import { config } from '../config/env';

dotenv.config({ path: path.join(__dirname, '../../.env') });

process.env.NODE_ENV = 'test';
const TEST_DB_URI = process.env.MONGODB_URI_TEST || 
  'mongodb://localhost:27017/moneycircle_test';
process.env.MONGODB_URI = TEST_DB_URI;

console.log(`🔧 Using test database URI: ${TEST_DB_URI}`);

jest.setTimeout(120000);

const testUser = {
  email: 'shared@example.com',
  password: 'Test@1234',
  firstName: 'Shared',
  lastName: 'User',
  phoneNumber: '+27123456789',
  idNumber: '1234567890123',
  role: 'borrower',
};

const ensureUserWithCorrectPassword = async () => {
  const existing = await User.findOne({ email: testUser.email });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(testUser.password, salt);
    const user = new User({
      ...testUser,
      passwordHash: hash,
    });
    await user.save();
    console.log('✅ User created with correct password');
  } else {
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testUser.password, salt);
    await User.updateOne(
      { _id: existing._id },
      { $set: { passwordHash: newHash } }
    );
    console.log('✅ User password reset to match test');
  }
  const freshUser = await User.findOne({ email: testUser.email });
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
    // Wait for connection to be fully open
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
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      console.log('✅ User registered:', response.body.data);
    }, 30000);

    it('should not register with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already registered');
    }, 30000);
  });

  describe('Login', () => {
    beforeAll(async () => {
      if (mongoose.connection.readyState !== 1) {
        console.log('⏳ Reconnecting for Login tests...');
        await mongoose.connect(TEST_DB_URI);
      }
      await ensureUserWithCorrectPassword();
    }, 60000);

    it('should login with valid credentials', async () => {
      const user = await User.findOne({ email: testUser.email });
      console.log('👤 User from DB:', user ? user.toObject() : 'NOT FOUND');

      if (user) {
        const passwordMatch = await bcrypt.compare(testUser.password, user.passwordHash);
        console.log('🔑 Password match test (bcrypt.compare):', passwordMatch);
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      console.log('📦 Login response body:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    }, 30000);

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
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
      await ensureUserWithCorrectPassword();

      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
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
      await ensureUserWithCorrectPassword();

      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
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