import { Role } from "@prisma/client";

interface RegisterUserInput {
    email?: string;
    password: string;
    name: string;
    phone: string;
  }
  
  interface LoginUserInput {
    phone: string;
    password: string;
  }

  interface AdminRegisterInput {
    username: string;
    password: string;
    phone: string;
    role: Role;
  }


  interface AdminLoginInput {
    username: string;
    password: string;
  }

export { AdminLoginInput, AdminRegisterInput, LoginUserInput, RegisterUserInput };

