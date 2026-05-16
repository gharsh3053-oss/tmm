"use client";

import { createContext, useContext } from "react";

const UserRoleContext = createContext<{ userRole?: string; isAdmin: boolean }>({
  isAdmin: false,
});

export function UserRoleProvider({
  userRole,
  children,
}: {
  userRole?: string;
  children: React.ReactNode;
}) {
  return (
    <UserRoleContext.Provider
      value={{ userRole, isAdmin: userRole === "ADMIN" }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
