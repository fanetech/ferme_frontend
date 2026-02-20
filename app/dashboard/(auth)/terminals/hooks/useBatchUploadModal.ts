import { useState } from 'react';

export function useBatchUploadModal() {
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);

  const openBatchUploadModal = () => setIsBatchUploadOpen(true);
  const closeBatchUploadModal = () => setIsBatchUploadOpen(false);

  return {
    isBatchUploadOpen,
    openBatchUploadModal,
    closeBatchUploadModal,
  };
}
