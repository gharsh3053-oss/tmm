"use client";

import { createContext, useContext } from "react";

const UserRoleContext = createContext<{
  userRole?: string;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
}>({
  isAdmin: false,
  isPlatformAdmin: false,
});

export function UserRoleProvider({
  userRole,
  isPlatformAdmin = false,
  children,
}: {
  userRole?: string;
  isPlatformAdmin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <UserRoleContext.Provider
      value={{
        userRole,
        isAdmin: userRole === "ADMIN" || isPlatformAdmin,
        isPlatformAdmin,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
