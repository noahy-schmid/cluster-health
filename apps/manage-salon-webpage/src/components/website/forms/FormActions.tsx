"use client";

interface FormActionsProps {
  onCancel?: () => void;
  onSave: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
  isSaveDisabled?: boolean;
  saveTestId?: string;
  cancelTestId?: string;
}

export default function FormActions({
  onCancel,
  onSave,
  saveLabel = "Änderungen speichern",
  cancelLabel = "Abbrechen",
  isSaving = false,
  isSaveDisabled = false,
  saveTestId,
  cancelTestId,
}: FormActionsProps) {
  return (
    <div className="flex gap-md justify-end pt-lg">
      {onCancel && (
        <button
          data-testid={cancelTestId}
          type="button"
          onClick={onCancel}
          className="px-lg py-sm border border-border rounded-md text-fg-normal text-base font-unfocus hover:bg-bg-0 transition-colors cursor-pointer"
          disabled={isSaving}
        >
          {cancelLabel}
        </button>
      )}
      <button
        data-testid={saveTestId}
        type="button"
        onClick={onSave}
        className="px-lg py-sm bg-primary-500 text-fg-inv rounded-md text-base font-focus hover:bg-primary-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSaving || isSaveDisabled}
      >
        {saveLabel}
      </button>
    </div>
  );
}
