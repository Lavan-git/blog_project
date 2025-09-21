interface TokenPayload {
  userId: string
  email: string
  exp: number
  iat: number
}

class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'

  setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem(TokenService.ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(TokenService.REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TokenService.ACCESS_TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(TokenService.REFRESH_TOKEN_KEY)
  }

  clearTokens(): void {
    localStorage.removeItem(TokenService.ACCESS_TOKEN_KEY)
    localStorage.removeItem(TokenService.REFRESH_TOKEN_KEY)
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseJwtPayload(token)
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  parseJwtPayload(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload) as TokenPayload
    } catch (error) {
      throw new Error('Invalid token format')
    }
  }

  getUserIdFromToken(): string | null {
    try {
      const token = this.getAccessToken()
      if (!token) return null
      
      const payload = this.parseJwtPayload(token)
      return payload.userId
    } catch (error) {
      return null
    }
  }

  getTokenExpirationTime(token: string): Date | null {
    try {
      const payload = this.parseJwtPayload(token)
      return new Date(payload.exp * 1000)
    } catch (error) {
      return null
    }
  }
}

export const tokenService = new TokenService()
