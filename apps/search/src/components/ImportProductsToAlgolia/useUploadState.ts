import { useState } from "react";

export type UploadState =
  | { type: "idle" }
  | { type: "uploading"; progress: { current: number; total: number }; isFinishing: boolean }
  | { type: "error"; error: Error }
  | { type: "success" };

export const useUploadState = () => {
  const [uploadState, setUploadState] = useState<UploadState>({ type: "idle" });

  const incrementTotal = (total: number) => {
    setUploadState((state) => {
      if (state.type !== "uploading") return state;

      return {
        ...state,
        progress: {
          ...state.progress,
          total: state.progress.total + total,
        },
      };
    });
  };

  const incrementCurrent = (current: number) => {
    setUploadState((state) => {
      if (state.type !== "uploading") return state;

      return {
        ...state,
        progress: {
          ...state.progress,
          current: state.progress.current + current,
        },
      };
    });
  };

  const finishUpload = () => {
    setUploadState({ type: "success" });
  };

  const finishingUpload = () => {
    setUploadState((current) => {
      if (current.type !== "uploading") return current;

      return { ...current, isFinishing: true };
    });

    const timeout = setTimeout(() => {
      finishUpload();
      clearTimeout(timeout);
    }, 1000);
  };

  const startUploading = () => {
    setUploadState({
      type: "uploading",
      progress: { current: 0, total: 0 },
      isFinishing: false,
    });
  };

  return {
    uploadState,
    incrementTotal,
    incrementCurrent,
    finishingUpload,
    startUploading,
  };
};
