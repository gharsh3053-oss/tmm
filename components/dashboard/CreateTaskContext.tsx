"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CreateTaskModal } from "./CreateTaskModal";

type CreateTaskOptions = {
  projectId?: string;
};

type CreateTaskContextValue = {
  openCreateTask: (options?: CreateTaskOptions) => void;
  closeCreateTask: () => void;
};

const CreateTaskContext = createContext<CreateTaskContextValue | null>(null);

export function CreateTaskProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>();

  const openCreateTask = useCallback((options?: CreateTaskOptions) => {
    setDefaultProjectId(options?.projectId);
    setOpen(true);
  }, []);

  const closeCreateTask = useCallback(() => {
    setOpen(false);
    setDefaultProjectId(undefined);
  }, []);

  return (
    <CreateTaskContext.Provider value={{ openCreateTask, closeCreateTask }}>
      {children}
      <CreateTaskModal
        open={open}
        defaultProjectId={defaultProjectId}
        onClose={closeCreateTask}
      />
    </CreateTaskContext.Provider>
  );
}

export function useCreateTask() {
  const ctx = useContext(CreateTaskContext);
  if (!ctx) {
    throw new Error("useCreateTask must be used within CreateTaskProvider");
  }
  return ctx;
}
