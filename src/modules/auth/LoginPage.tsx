"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useContextStore } from "@/store/contextStore";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const QUICK_LOGIN = [
  { label: "Owner", email: "owner@simontrade.com", password: "123456" },
  { label: "Manager", email: "manager@simontrade.com", password: "123456" },
  { label: "Sales", email: "sales@simontrade.com", password: "123456" },
] as const;

export function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const activeCompany = useContextStore((state) => state.activeCompany);
  const activeHub = useContextStore((state) => state.activeHub);
  const setActiveCompany = useContextStore((state) => state.setActiveCompany);
  const setActiveHub = useContextStore((state) => state.setActiveHub);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      await login(values.email, values.password);
    },
    onSuccess: () => {
      setActiveCompany({ id: "c2", name: "Alpha Exim" });
      setActiveHub({ id: "h3", name: "Chittagong Sea Port" });
      router.replace("/dashboard");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      setError("root", { message });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!activeCompany) {
      router.replace("/select-company");
      return;
    }

    if (!activeHub) {
      router.replace("/select-hub");
      return;
    }

    router.replace("/dashboard");
  }, [activeCompany, activeHub, isAuthenticated, router]);

  const onSubmit = (values: LoginFormValues) => {
    clearErrors();
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.email?.[0]) {
        setError("email", { message: fieldErrors.email[0] });
      }
      if (fieldErrors.password?.[0]) {
        setError("password", { message: fieldErrors.password[0] });
      }
      return;
    }

    loginMutation.mutate(parsed.data);
  };

  const onQuickLogin = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: true, shouldDirty: true });
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
    clearErrors();
    loginMutation.mutate({ email, password });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.section
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-lg border border-border bg-background p-6"
        initial={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="mb-6 space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Simon Logistics Access
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to continue</h1>
          <p className="text-sm text-muted-foreground">
            Use demo credentials to enter the operations workspace.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="email"
                className="pl-9"
                id="email"
                placeholder="name@simontrade.com"
                type="email"
                {...register("email")}
              />
            </div>
            {errors.email?.message ? (
              <p className="text-xs text-danger">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="current-password"
                className="pl-9"
                id="password"
                placeholder="Enter password"
                type="password"
                {...register("password")}
              />
            </div>
            {errors.password?.message ? (
              <p className="text-xs text-danger">{errors.password.message}</p>
            ) : null}
          </div>

          {errors.root?.message ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {errors.root.message}
            </p>
          ) : null}

          <Button className="w-full" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? "Signing in..." : "Continue"}
          </Button>
        </form>

        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quick Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_LOGIN.map((item) => (
              <Button
                className="w-full"
                disabled={loginMutation.isPending}
                key={item.label}
                onClick={() => onQuickLogin(item.email, item.password)}
                type="button"
                variant="secondary"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  );
}
