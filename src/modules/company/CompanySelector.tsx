"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const { ready } = useRequireAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setActiveCompany = useContextStore((state) => state.setActiveCompany);

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: companyService.getCompanies,
    enabled: ready,
  });

  if (!ready) {
    return null;
  }

  const onSelectCompany = (company: ActiveCompany) => {
    setSelectedId(company.id);
    setActiveCompany(company);
    router.push("/select-hub");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-2xl rounded-lg border border-border bg-background p-6">
        <div className="mb-5 space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Step 1
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Select Company</h1>
          <p className="text-sm text-muted-foreground">
            Choose the business entity you are operating in today.
          </p>
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
      </section>
    </main>
  );
}
