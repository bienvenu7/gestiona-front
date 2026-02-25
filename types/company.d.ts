enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export interface IUser {
  id: string;
  companyId: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateOtp {
  email: string;
  code: string;
}

export interface ICompany {
  id: string;
  name: string;
  createdAt: string;
}

export type ICreateUser = Omit<
  IUser,
  "id" | "createdAt" | "updatedAt" | "companyId"
>;

export type ICreateCompanyWithUser = Omit<ICompany, "id" | "createdAt"> & {
  user: Omit<ICreateUser, "role">;
};

export type IUserResponse = Omit<ICreateUser, "password"> & {
  company: Omit<ICompany, "createdAt">;
};

export type IUserLogin = Pick<IUser, "email" | "password">;

export type IcreateUserFromOwner = Pick<
  IUser,
  "email" | "name" | "role" | "companyId"
>;

export interface IPaymentStats {
  total: number;
  total_paid: number;
  total_echeance: number;
  total_complet: number;
}

export interface ICreateUserResponse extends IcreateUserFromOwner {
  companyId: string;
  createdAt: Date;
}

export interface IClient {
  number: string;
  id: string;
  companyId: string;
  name: string;
  createdAt: Date;
}

export type ICreateClient = Pick<IClient, "name" | "number">;
