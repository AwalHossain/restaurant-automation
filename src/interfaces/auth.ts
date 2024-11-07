export interface TokenPayload {
    userId: string;
    role: string;
    isMfaEnabled?: boolean;
  }
  
  export interface LoginResponse {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
  
  export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
  }
