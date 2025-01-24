export interface TokenPayload {
    userId: string;
    role: string;
    isMfaEnabled?: boolean;
    tenantId?: string | null;
    restaurantId?: string | null;
    branchId?: string | null;
  }
  
  export interface LoginResponse {
    user: {
      id: string;
      email: string;
      role: string;
      isMfaEnabled: boolean;

    };
  }
  
  export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
  }
