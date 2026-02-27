"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { UploadIcon } from "lucide-react";

interface FileDropZoneProps {
  accept?: string[];
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
  disabled?: boolean;
  children?: ReactNode;
}

export default function FileDropZone({
  accept = [],
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  error = null,
  disabled = false,
  children,
}: FileDropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || isUploading) return;

      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled, isUploading],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || isUploading) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [disabled, isUploading, onFileSelect],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || isUploading) return;
      if (e.target.files && e.target.files[0]) {
        onFileSelect(e.target.files[0]);
      }
    },
    [disabled, isUploading, onFileSelect],
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const getAcceptString = () => {
    if (accept.length === 0) return undefined;
    return accept.join(",");
  };

  const baseClasses =
    "border-2 border-dashed rounded-lg p-lg flex flex-col items-center justify-center gap-sm cursor-pointer transition-colors";
  const stateClasses = dragActive
    ? "border-primary-700 bg-primary-50"
    : "border-border bg-bg-0";

  return (
    <div className="flex flex-col gap-sm">
      <div
        className={`${baseClasses} ${stateClasses} ${
          disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString()}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        {children || (
          <div className="flex flex-col items-center gap-sm text-fg-muted">
            <UploadIcon className="w-12 h-12" />
            <p className="text-base">Datei hierher ziehen</p>
            <p className="text-sm">oder klicken zum Auswaehlen</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-sm bg-red-100 border border-red-400 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {isUploading && (
        <div>
          <div className="w-full bg-bg-2 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary-700 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-fg-muted mt-xs text-center">
            {uploadProgress === 100
              ? "Abgeschlossen!"
              : `${uploadProgress}% hochgeladen`}
          </p>
        </div>
      )}
    </div>
  );
}
