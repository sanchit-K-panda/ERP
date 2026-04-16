"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { companyService } from "@/services/companyService";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useContextStore } from "@/store/contextStore";
import type { ActiveCompany } from "@/types/context";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

export function CompanySelector() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ready } = useRequireAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const setActiveCompany = useContextStore((state) => state.setActiveCompany);

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: companyService.getCompanies,
    enabled: ready,
  });

  const createCompanyMutation = useMutation({
    mutationFn: companyService.createCompany,
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setCreateError(null);
      setNewCompanyName("");
      setCreateModalOpen(false);
      onSelectCompany(company);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to create company.";
      setCreateError(message);
    },
  });

  if (!ready) {
    return null;
  }

  const onSelectCompany = (company: ActiveCompany) => {
    setSelectedId(company.id);
    setActiveCompany(company);
    router.push("/select-hub");
  };

  const onCreateCompany = () => {
    setCreateError(null);
    const normalizedName = newCompanyName.trim();
    if (normalizedName.length < 2) {
      setCreateError("Company name must be at least 2 characters.");
      return;
    }

    createCompanyMutation.mutate(normalizedName);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-2xl rounded-lg border border-border bg-background p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Step 1
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Select Company</h1>
            <p className="text-sm text-muted-foreground">
              Choose the business entity you are operating in today.
            </p>
          </div>

          <Button
            onClick={() => {
              setCreateError(null);
              setCreateModalOpen(true);
            }}
            size="sm"
            variant="secondary"
          >
            <Plus className="h-4 w-4" />
            Create New Company
          </Button>
        </div>

        {companiesQuery.isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Loading companies...
          </div>
        ) : null}

        {companiesQuery.isError ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Unable to load company list.
          </p>
        ) : null}

        {companiesQuery.data?.length ? (
          <motion.ul
            animate="visible"
            className="divide-y divide-border"
            initial="hidden"
            variants={listVariants}
          >
            {companiesQuery.data.map((company) => {
              const isSelected = selectedId === company.id;

              return (
                <motion.li key={company.id} variants={rowVariants}>
                  <motion.button
                    className="flex w-full items-center justify-between py-4 text-left"
                    onClick={() => onSelectCompany(company)}
                    type="button"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {company.name}
                        </p>
                        <p className="text-xs text-muted-foreground">ID: {company.id}</p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <AnimatePresence mode="wait">
                        {isSelected ? (
                          <motion.span
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            key="selected"
                          >
                            Selected
                          </motion.span>
                        ) : (
                          <motion.span
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            key="action"
                          >
                            Continue
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </motion.button>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}

        <Modal
          description="Add a company before selecting your operating hub."
          onClose={() => {
            setCreateModalOpen(false);
            setCreateError(null);
          }}
          open={createModalOpen}
          title="Create New Company"
        >
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateCompany();
            }}
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="new-company-name">
                Company Name
              </label>
              <Input
                id="new-company-name"
                onChange={(event) => setNewCompanyName(event.target.value)}
                placeholder="Enter company name"
                value={newCompanyName}
              />
            </div>

            {createError ? <p className="text-xs text-danger">{createError}</p> : null}

            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Button
                onClick={() => {
                  setCreateModalOpen(false);
                  setCreateError(null);
                }}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button disabled={createCompanyMutation.isPending} type="submit">
                {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
              </Button>
            </div>
          </form>
        </Modal>
      </section>
    </main>
  );
}
