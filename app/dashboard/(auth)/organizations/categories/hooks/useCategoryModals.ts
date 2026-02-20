"use client";

import { useState, useCallback } from "react";
import type { Category } from "@/types/organization";

export type ModalType = 'details' | 'form' | 'delete';
export type FormMode = 'create' | 'edit';

interface ModalState {
  isOpen: boolean;
  category: Category | null;
  formMode?: FormMode;
}

interface UseCategoryModalsReturn {
  // Modal states
  modals: Record<ModalType, ModalState>;
  
  // Actions
  openModal: (type: ModalType, category?: Category | null, formMode?: FormMode) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;
  
  // Convenience getters
  isAnyModalOpen: boolean;
  
  // Specific modal helpers
  openDetailsModal: (category: Category) => void;
  openFormModal: (mode: FormMode, category?: Category | null) => void;
  openDeleteModal: (category: Category) => void;
}

const initialModalState: ModalState = {
  isOpen: false,
  category: null,
  formMode: undefined,
};

const initialModalsState: Record<ModalType, ModalState> = {
  details: { ...initialModalState },
  form: { ...initialModalState, formMode: 'create' },
  delete: { ...initialModalState },
};

export function useCategoryModals(): UseCategoryModalsReturn {
  const [modals, setModals] = useState<Record<ModalType, ModalState>>(initialModalsState);

  const openModal = useCallback((type: ModalType, category: Category | null = null, formMode?: FormMode) => {
    setModals(prev => ({
      ...prev,
      [type]: {
        isOpen: true,
        category,
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
  const openDetailsModal = useCallback((category: Category) => {
    openModal('details', category);
  }, [openModal]);

  const openFormModal = useCallback((mode: FormMode, category: Category | null = null) => {
    openModal('form', category, mode);
  }, [openModal]);

  const openDeleteModal = useCallback((category: Category) => {
    openModal('delete', category);
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
  };
}