import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { tokenService } from './tokenService'

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenService.getAccessToken()
        if (token && !tokenService.isTokenExpired(token)) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = tokenService.getRefreshToken()
            if (refreshToken) {
              const response = await this.post('/auth/refresh', {
                refreshToken,
              })
              
              tokenService.setTokens(response.data.tokens)
              
              // Retry the original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`
              }
              
              return this.client.request(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            tokenService.clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        // Transform axios error to our custom error format
        const apiError: ApiError = {
          message: (error.response?.data as any)?.message || error.message || 'An unexpected error occurred',
          status: error.response?.status || 500,
          errors: (error.response?.data as any)?.errors,
        }

        return Promise.reject(apiError)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }

  // Helper method for file uploads
  async uploadFile<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // Helper method to get the base URL
  getBaseURL(): string {
    return this.client.defaults.baseURL || ''
  }

  // Helper method to set default headers
  setDefaultHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value
  }

  // Helper method to remove default headers
  removeDefaultHeader(key: string): void {
    delete this.client.defaults.headers.common[key]
  }
}

export const apiClient = new ApiClient()
