"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LoaderCircle, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { hubService } from "@/services/hubService";
import { useRequireCompany } from "@/hooks/useRequireCompany";
import { useContextStore } from "@/store/contextStore";
import type { ActiveHub } from "@/types/context";

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

export function HubSelector() {
  const router = useRouter();
  const { activeCompany, ready } = useRequireCompany();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setActiveHub = useContextStore((state) => state.setActiveHub);

  const hubsQuery = useQuery({
    queryKey: ["hubs", activeCompany?.id],
    queryFn: () => hubService.getHubs(activeCompany?.id ?? ""),
    enabled: ready && Boolean(activeCompany),
  });

  if (!ready) {
    return null;
  }

  const onSelectHub = (hub: ActiveHub) => {
    setSelectedId(hub.id);
    setActiveHub(hub);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-2xl rounded-lg border border-border bg-background p-6">
        <div className="mb-5 space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Step 2
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Select Hub</h1>
          <p className="text-sm text-muted-foreground">
            {activeCompany
              ? `Choose an operating hub for ${activeCompany.name}.`
              : "Choose an operating hub."}
          </p>
        </div>

        {hubsQuery.isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Loading hubs...
          </div>
        ) : null}

        {hubsQuery.isError ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Unable to load hub list.
          </p>
        ) : null}

        {hubsQuery.data?.length ? (
          <motion.ul
            animate="visible"
            className="divide-y divide-border"
            initial="hidden"
            variants={listVariants}
          >
            {hubsQuery.data.map((hub) => {
              const isSelected = selectedId === hub.id;

              return (
                <motion.li key={hub.id} variants={rowVariants}>
                  <motion.button
                    className="flex w-full items-center justify-between py-4 text-left"
                    onClick={() => onSelectHub(hub)}
                    type="button"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {hub.name}
                        </p>
                        <p className="text-xs text-muted-foreground">ID: {hub.id}</p>
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
