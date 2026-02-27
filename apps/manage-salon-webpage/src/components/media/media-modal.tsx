"use client";

import { UploadIcon, ImageIcon, CheckIcon } from "lucide-react";
import Modal from "@/components/modal";
import MediaGrid from "./media-grid";
import FileDropZone from "@/components/file-drop-zone";
import FlatIconTextButton from "@/components/buttons/FlatIconTextButton";
import PrimaryIconTextButton from "@/components/buttons/PrimaryIconTextButton";
import { useMediaModalState } from "./media-modal.state";
import { ALLOWED_MIME_TYPES } from "./media-utils";

interface MediaModalProps {
  websiteId: string;
  onSelect: (mediaId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function MediaModal({
  websiteId,
  onSelect,
  onClose,
  isOpen,
}: MediaModalProps) {
  const {
    state,
    handleTabChange,
    handleUpload,
    handleSelect,
    handleDelete,
    setSelectedId,
  } = useMediaModalState({
    websiteId,
    onSelect,
    onClose,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medien auswählen">
      <div className="flex gap-md mb-md border-b border-border pb-md">
        {state.activeTab === "upload" ? (
          <>
            <PrimaryIconTextButton
              icon={UploadIcon}
              text="Hochladen"
              onClick={() => handleTabChange("upload")}
            />
            <FlatIconTextButton
              icon={ImageIcon}
              text="Bibliothek"
              onClick={() => handleTabChange("library")}
              elevation={1}
            />
          </>
        ) : (
          <>
            <FlatIconTextButton
              icon={UploadIcon}
              text="Hochladen"
              onClick={() => handleTabChange("upload")}
              elevation={1}
            />
            <PrimaryIconTextButton
              icon={ImageIcon}
              text="Bibliothek"
              onClick={() => handleTabChange("library")}
            />
          </>
        )}
      </div>

      {state.activeTab === "upload" ? (
        <FileDropZone
          accept={ALLOWED_MIME_TYPES}
          onFileSelect={handleUpload}
          isUploading={state.isUploading}
          uploadProgress={state.uploadProgress}
          error={state.error}
        >
          <div className="flex flex-col items-center gap-sm text-fg-muted">
            <UploadIcon className="w-12 h-12" />
            <p className="text-base">Datei hierher ziehen</p>
            <p className="text-sm">oder klicken zum Auswaehlen</p>
            <p className="text-xs text-fg-muted">
              JPEG, PNG, WebP, GIF, ICO - max. 10MB
            </p>
          </div>
        </FileDropZone>
      ) : (
        <div className="flex flex-col gap-md">
          <MediaGrid
            media={state.media}
            onSelect={setSelectedId}
            onDelete={handleDelete}
            selectedId={state.selectedId}
          />
          {state.media.length > 0 && (
            <div className="flex justify-end">
              <PrimaryIconTextButton
                icon={CheckIcon}
                text="Auswaehlen"
                onClick={handleSelect}
                isDisabled={!state.selectedId}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
