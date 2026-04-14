"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AddExpensePayload } from "@/modules/jobs/types";

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  category: z.string().min(2, "Category is required."),
  notes: z.string().min(2, "Notes are required."),
});

type ExpenseFormValues = {
  amount: string;
  category: string;
  notes: string;
};

type AddExpenseModalProps = {
  open: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (payload: AddExpensePayload) => void;
};

export function AddExpenseModal({
  open,
  isSaving = false,
  onClose,
  onSubmit,
}: AddExpenseModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    defaultValues: {
      amount: "",
      category: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const submitExpense = (values: ExpenseFormValues) => {
    const parsed = expenseSchema.safeParse({
      amount: Number(values.amount),
      category: values.category.trim(),
      notes: values.notes.trim(),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.amount?.[0]) {
        setError("amount", { message: fieldErrors.amount[0] });
      }
      if (fieldErrors.category?.[0]) {
        setError("category", { message: fieldErrors.category[0] });
      }
      if (fieldErrors.notes?.[0]) {
        setError("notes", { message: fieldErrors.notes[0] });
      }
      return;
    }

    onSubmit(parsed.data);
    onClose();
  };

  return (
    <Modal
      description="Record a new cost entry for this job."
      onClose={onClose}
      open={open}
      title="Add Expense"
    >
      <form className="space-y-3" onSubmit={handleSubmit(submitExpense)}>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="expense-amount">
            Amount
          </label>
          <Input id="expense-amount" placeholder="0.00" {...register("amount")} />
          {errors.amount?.message ? (
            <p className="text-xs text-danger">{errors.amount.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="expense-category"
          >
            Category
          </label>
          <Input
            id="expense-category"
            placeholder="Freight, Customs, Local Transport"
            {...register("category")}
          />
          {errors.category?.message ? (
            <p className="text-xs text-danger">{errors.category.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="expense-notes">
            Notes
          </label>
          <textarea
            className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="expense-notes"
            placeholder="Add context for finance tracking"
            {...register("notes")}
          />
          {errors.notes?.message ? (
            <p className="text-xs text-danger">{errors.notes.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} size="sm" type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSaving} size="sm" type="submit">
            {isSaving ? "Saving..." : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
