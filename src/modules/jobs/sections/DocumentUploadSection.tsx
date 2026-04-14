import { DocumentUploader } from "@/modules/jobs/components/DocumentUploader";
import type { LocalUploadDocument } from "@/modules/jobs/types";

type DocumentUploadSectionProps = {
  documents: LocalUploadDocument[];
  onAddFiles: (files: File[]) => void;
  onRemoveUpload: (id: string) => void;
};

export function DocumentUploadSection({
  documents,
  onAddFiles,
  onRemoveUpload,
}: DocumentUploadSectionProps) {
  return (
    <section className="space-y-4" id="documents">
      <header>
        <h2 className="text-lg font-semibold">7. Document Upload</h2>
        <p className="text-sm text-muted-foreground">
          Attach packing list, invoices, and support files.
        </p>
      </header>

      <DocumentUploader
        onAddFiles={onAddFiles}
        onRemoveUpload={onRemoveUpload}
        uploads={documents}
      />
    </section>
  );
}
