import type { User, LoginResponse, RegisterResponse } from '@repo/shared'
import { apiClient } from './apiClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  }

  async register(email: string, password: string, name: string): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', {
      name,
      email,
      password,
    })
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  async logoutAllDevices(): Promise<void> {
    await apiClient.post('/auth/logout-all')
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile')
    return response.data
  }

  async updateProfile(data: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const response = await apiClient.patch<User>('/auth/profile', data)
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    })
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token })
  }

  async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/resend-verification')
  }
}

export const authService = new AuthService()
