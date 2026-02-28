"use client";

import { useReducer, useCallback } from "react";
import { MediaFile } from "@/api/media-actions";
import { validateFile } from "./media-utils";
import {
  prepareMediaUpload,
  confirmMediaUpload,
  listMedia,
  deleteMedia,
} from "@/api/media-actions";

interface MediaModalState {
  activeTab: "upload" | "library";
  media: MediaFile[];
  selectedId: string | undefined;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

type MediaModalAction =
  | { type: "SET_ACTIVE_TAB"; payload: "upload" | "library" }
  | { type: "SET_MEDIA"; payload: MediaFile[] }
  | { type: "SET_SELECTED_ID"; payload: string | undefined }
  | { type: "REMOVE_MEDIA_ITEM"; payload: string }
  | { type: "START_UPLOAD" }
  | { type: "SET_UPLOAD_PROGRESS"; payload: number }
  | { type: "COMPLETE_UPLOAD" }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_UPLOAD" };

const initialState: MediaModalState = {
  activeTab: "upload",
  media: [],
  selectedId: undefined,
  isUploading: false,
  uploadProgress: 0,
  error: null,
};

function mediaModalReducer(
  state: MediaModalState,
  action: MediaModalAction,
): MediaModalState {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_MEDIA":
      return { ...state, media: action.payload };
    case "SET_SELECTED_ID":
      return { ...state, selectedId: action.payload };
    case "REMOVE_MEDIA_ITEM":
      return {
        ...state,
        media: state.media.filter((m) => m.id !== action.payload),
      };
    case "START_UPLOAD":
      return { ...state, isUploading: true, uploadProgress: 0, error: null };
    case "SET_UPLOAD_PROGRESS":
      return { ...state, uploadProgress: action.payload };
    case "COMPLETE_UPLOAD":
      return { ...state, isUploading: false, uploadProgress: 100 };
    case "SET_ERROR":
      return { ...state, error: action.payload, isUploading: false };
    case "RESET_UPLOAD":
      return { ...state, isUploading: false, uploadProgress: 0, error: null };
    default:
      return state;
  }
}

interface UseMediaModalStateParams {
  salonId: string;
  onSelect: (mediaId: string) => void;
  onClose: () => void;
}

export function useMediaModalState({
  salonId,
  onSelect,
  onClose,
}: UseMediaModalStateParams) {
  const [state, dispatch] = useReducer(mediaModalReducer, initialState);

  const setActiveTab = (tab: "upload" | "library") => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });
  };

  const setMedia = (media: MediaFile[]) => {
    dispatch({ type: "SET_MEDIA", payload: media });
  };

  const setSelectedId = (id: string | undefined) => {
    dispatch({ type: "SET_SELECTED_ID", payload: id });
  };

  const removeMediaItem = (id: string) => {
    dispatch({ type: "REMOVE_MEDIA_ITEM", payload: id });
  };

  const startUpload = () => {
    dispatch({ type: "START_UPLOAD" });
  };

  const setUploadProgress = (progress: number) => {
    dispatch({ type: "SET_UPLOAD_PROGRESS", payload: progress });
  };

  const completeUpload = () => {
    dispatch({ type: "COMPLETE_UPLOAD" });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const resetUpload = () => {
    dispatch({ type: "RESET_UPLOAD" });
  };

  const loadMedia = useCallback(async () => {
    const result = await listMedia(salonId);
    if (result.success) {
      setMedia(result.data);
    }
  }, [salonId]);

  const handleUpload = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || "Validierung fehlgeschlagen");
        return;
      }

      setError(null);
      startUpload();

      try {
        setUploadProgress(20);
        const prepareResult = await prepareMediaUpload(
          salonId,
          file.name,
          file.type,
          file.size,
        );

        if (!prepareResult.success) {
          setError(prepareResult.errors || "Upload vorbereiten fehlgeschlagen");
          return;
        }

        setUploadProgress(50);

        const { mediaId, uploadUrl, uploadFields } = prepareResult.data;

        const formData = new FormData();
        Object.entries(uploadFields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          setError("Upload fehlgeschlagen");
          return;
        }

        setUploadProgress(80);

        const confirmResult = await confirmMediaUpload(mediaId);
        if (!confirmResult.success) {
          setError(confirmResult.errors || "Upload bestaetigen fehlgeschlagen");
          return;
        }

        completeUpload();
        onSelect(mediaId);
        onClose();
      } catch (_err) {
        setError("Upload fehlgeschlagen");
      }
    },
    [salonId, onSelect, onClose],
  );

  const handleTabChange = useCallback(
    (tab: "upload" | "library") => {
      setActiveTab(tab);
      if (tab === "library") {
        loadMedia();
      }
    },
    [loadMedia],
  );

  const handleSelect = useCallback(() => {
    if (state.selectedId) {
      onSelect(state.selectedId);
      onClose();
    }
  }, [state.selectedId, onSelect, onClose]);

  const handleDelete = useCallback(
    async (mediaId: string) => {
      const result = await deleteMedia(salonId, mediaId);
      if (result.success) {
        removeMediaItem(mediaId);
      } else {
        setError(result.errors || "Loeschen fehlgeschlagen");
      }
    },
    [salonId],
  );

  return {
    state,
    setActiveTab,
    setMedia,
    setSelectedId,
    removeMediaItem,
    startUpload,
    setUploadProgress,
    completeUpload,
    setError,
    resetUpload,
    loadMedia,
    handleUpload,
    handleTabChange,
    handleSelect,
    handleDelete,
  };
}
