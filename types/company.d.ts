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
