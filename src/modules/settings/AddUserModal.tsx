"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  SETTINGS_ROLE_OPTIONS,
  type SettingsUserRecord,
  type SettingsUserRole,
} from "@/modules/settings/types";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const baseSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Enter a valid email."),
  role: z.enum(SETTINGS_ROLE_OPTIONS),
  company: z.string().trim().min(2, "Company is required."),
  password: z.string().optional(),
});

type UserFormValues = {
  fullName: string;
  email: string;
  role: SettingsUserRole;
  company: string;
  password: string;
};

export type UserFormPayload = {
  fullName: string;
  email: string;
  role: SettingsUserRole;
  company: string;
  password?: string;
};

type AddUserModalProps = {
  open: boolean;
  initialUser?: SettingsUserRecord | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (payload: UserFormPayload) => void;
};

export function AddUserModal({
  open,
  initialUser,
  isSaving = false,
  onClose,
  onSubmit,
}: AddUserModalProps) {
  const isEditMode = Boolean(initialUser);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(open, dialogRef);

  const {
    register,
    reset,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      role: "SALES_PERSON",
      company: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      fullName: initialUser?.fullName ?? "",
      email: initialUser?.email ?? "",
      role: initialUser?.role ?? "SALES_PERSON",
      company: initialUser?.company ?? "",
      password: "",
    });
  }, [initialUser, open, reset]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const submitForm = (values: UserFormValues) => {
    clearErrors();

    const parsed = baseSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.fullName?.[0]) {
        setError("fullName", { message: fieldErrors.fullName[0] });
      }
      if (fieldErrors.email?.[0]) {
        setError("email", { message: fieldErrors.email[0] });
      }
      if (fieldErrors.role?.[0]) {
        setError("role", { message: fieldErrors.role[0] });
      }
      if (fieldErrors.company?.[0]) {
        setError("company", { message: fieldErrors.company[0] });
      }
      return;
    }

    const normalizedPassword = parsed.data.password?.trim() ?? "";

    if (!isEditMode && normalizedPassword.length < 6) {
      setError("password", { message: "Password must be at least 6 characters." });
      return;
    }

    if (isEditMode && normalizedPassword.length > 0 && normalizedPassword.length < 6) {
      setError("password", { message: "Password must be at least 6 characters." });
      return;
    }

    onSubmit({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      role: parsed.data.role,
      company: parsed.data.company,
      password: normalizedPassword.length > 0 ? normalizedPassword : undefined,
    });
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl rounded-lg border border-border bg-background"
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            onClick={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between border-b border-border p-4">
              <div>
                <h2 className="section-title text-foreground" id={titleId}>
                  {isEditMode ? "Edit User" : "Add User"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>
                  Manage accounts, role assignment, and workspace access.
                </p>
              </div>
              <button
                aria-label="Close user modal"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-3 p-4" onSubmit={handleSubmit(submitForm)}>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="user-full-name">
                    Full Name
                  </label>
                  <Input id="user-full-name" placeholder="Full name" {...register("fullName")} />
                  {errors.fullName?.message ? (
                    <p className="text-xs text-danger">{errors.fullName.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="user-email">
                    Email
                  </label>
                  <Input id="user-email" placeholder="user@simontrade.com" {...register("email")} />
                  {errors.email?.message ? (
                    <p className="text-xs text-danger">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="user-role">
                    Role
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    id="user-role"
                    {...register("role")}
                  >
                    {SETTINGS_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {errors.role?.message ? (
                    <p className="text-xs text-danger">{errors.role.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="user-company">
                    Company
                  </label>
                  <Input id="user-company" placeholder="Company name" {...register("company")} />
                  {errors.company?.message ? (
                    <p className="text-xs text-danger">{errors.company.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="user-password">
                    Password (mock)
                  </label>
                  <Input
                    id="user-password"
                    placeholder={isEditMode ? "Leave blank to keep existing password" : "Enter password"}
                    type="password"
                    {...register("password")}
                  />
                  {errors.password?.message ? (
                    <p className="text-xs text-danger">{errors.password.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button onClick={onClose} size="sm" type="button" variant="secondary">
                  Cancel
                </Button>
                <Button disabled={isSaving} size="sm" type="submit">
                  {isSaving ? "Saving..." : isEditMode ? "Update User" : "Create User"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
