import type { AuthUser, Role } from "@/types/auth";

type DemoAccount = {
  email: string;
  password: string;
  role: Role;
  user: AuthUser;
};

type LoginResult = {
  user: AuthUser;
  role: Role;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "owner@neo.com",
    password: "123456",
    role: "BUSINESS_OWNER",
    user: { id: "u-owner", email: "owner@neo.com", name: "Owner User" },
  },
  {
    email: "manager@neo.com",
    password: "123456",
    role: "BUSINESS_MANAGER",
    user: { id: "u-manager", email: "manager@neo.com", name: "Manager User" },
  },
  {
    email: "sales@neo.com",
    password: "123456",
    role: "SALES_PERSON",
    user: { id: "u-sales", email: "sales@neo.com", name: "Sales User" },
  },
];

function simulateLatency() {
  return new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    await simulateLatency();

    const normalizedEmail = email.trim().toLowerCase();
    const account = DEMO_ACCOUNTS.find(
      (item) => item.email === normalizedEmail && item.password === password,
    );

    if (!account) {
      throw new Error("Invalid demo credentials.");
    }

    return {
      user: account.user,
      role: account.role,
    };
  },
};
