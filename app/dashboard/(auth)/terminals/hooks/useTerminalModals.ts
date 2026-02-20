"use client";

import { useState, useCallback } from "react";
import type { Terminal } from "@/types";

export type ModalType = 'details' | 'form' | 'delete' | 'block' | 'batchUpload';
export type FormMode = 'create' | 'edit';

interface ModalState {
  isOpen: boolean;
  terminal: Terminal | null;
  formMode?: FormMode;
}

interface UseTerminalModalsReturn {
  // Modal states
  modals: Record<ModalType, ModalState>;
  
  // Actions
  openModal: (type: ModalType, terminal?: Terminal | null, formMode?: FormMode) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;
  
  // Convenience getters
  isAnyModalOpen: boolean;
  
  // Specific modal helpers
  openDetailsModal: (terminal: Terminal) => void;
  openFormModal: (mode: FormMode, terminal?: Terminal | null) => void;
  openDeleteModal: (terminal: Terminal) => void;
  openBlockModal: (terminal: Terminal) => void;
  openBatchUploadModal: () => void;
}

const initialModalState: ModalState = {
  isOpen: false,
  terminal: null,
  formMode: undefined,
};

const initialModalsState: Record<ModalType, ModalState> = {
  details: { ...initialModalState },
  form: { ...initialModalState, formMode: 'create' },
  delete: { ...initialModalState },
  block: { ...initialModalState },
  batchUpload: { ...initialModalState },
};

export function useTerminalModals(): UseTerminalModalsReturn {
  const [modals, setModals] = useState<Record<ModalType, ModalState>>(initialModalsState);

  const openModal = useCallback((type: ModalType, terminal: Terminal | null = null, formMode?: FormMode) => {
    setModals(prev => ({
      ...prev,
      [type]: {
        isOpen: true,
        terminal,
        formMode: formMode || (type === 'form' ? 'create' : undefined),
      },
    }));
  }, []);

  const closeModal = useCallback((type: ModalType) => {
    setModals(prev => ({
      ...prev,
      [type]: {
        ...initialModalState,
        formMode: type === 'form' ? 'create' : undefined,
      },
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(initialModalsState);
  }, []);

  // Convenience helpers
  const openDetailsModal = useCallback((terminal: Terminal) => {
    openModal('details', terminal);
  }, [openModal]);

  const openFormModal = useCallback((mode: FormMode, terminal: Terminal | null = null) => {
    openModal('form', terminal, mode);
  }, [openModal]);

  const openDeleteModal = useCallback((terminal: Terminal) => {
    openModal('delete', terminal);
  }, [openModal]);

  const openBlockModal = useCallback((terminal: Terminal) => {
    openModal('block', terminal);
  }, [openModal]);

  const openBatchUploadModal = useCallback(() => {
    openModal('batchUpload');
  }, [openModal]);

  const isAnyModalOpen = Object.values(modals).some(modal => modal.isOpen);

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isAnyModalOpen,
    openDetailsModal,
    openFormModal,
    openDeleteModal,
    openBlockModal,
    openBatchUploadModal,
  };
}