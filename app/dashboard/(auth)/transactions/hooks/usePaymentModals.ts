import { useState } from "react";
import { Payment } from "@/data/payment";

interface ModalState {
  details: {
    isOpen: boolean;
    payment: Payment | null;
  };
  cancel: {
    isOpen: boolean;
    payment: Payment | null;
  };
  refund: {
    isOpen: boolean;
    payment: Payment | null;
  };
  validate: {
    isOpen: boolean;
    payment: Payment | null;
  };
  retry: {
    isOpen: boolean;
    payment: Payment | null;
  };
  search: {
    isOpen: boolean;
  };
  status: {
    isOpen: boolean;
    payment: Payment | null;
  };
}

export function usePaymentModals() {
  const [modals, setModals] = useState<ModalState>({
    details: { isOpen: false, payment: null },
    cancel: { isOpen: false, payment: null },
    refund: { isOpen: false, payment: null },
    validate: { isOpen: false, payment: null },
    retry: { isOpen: false, payment: null },
    search: { isOpen: false },
    status: { isOpen: false, payment: null },
  });

  const openDetailsModal = (payment: Payment) => {
    setModals(prev => ({
      ...prev,
      details: { isOpen: true, payment }
    }));
  };

  const openCancelModal = (payment: Payment) => {
    setModals(prev => ({
      ...prev,
      cancel: { isOpen: true, payment }
    }));
  };

  const openRefundModal = (payment: Payment) => {
    setModals(prev => ({
      ...prev,
      refund: { isOpen: true, payment }
    }));
  };

  const openValidateModal = (payment: Payment) => {
    setModals(prev => ({
      ...prev,
      validate: { isOpen: true, payment }
    }));
  };

  const openSearchModal = () => {
    setModals(prev => ({
      ...prev,
      search: { isOpen: true }
    }));
  };

  const openStatusModal = (payment: Payment) => {
    setModals(prev => ({
      ...prev,
      status: { isOpen: true, payment }
    }));
  };

  const openRetryModal = (payment: Payment) => {
    setModals(prev => ({
      ...prev,
      retry: { isOpen: true, payment }
    }));
  };

  const closeModal = (type: keyof ModalState) => {
    if (type === 'search') {
      setModals(prev => ({
        ...prev,
        search: { isOpen: false }
      }));
    } else {
      setModals(prev => ({
        ...prev,
        [type]: { isOpen: false, payment: null }
      }));
    }
  };

  return {
    modals,
    openDetailsModal,
    openCancelModal,
    openRefundModal,
    openValidateModal,
    openRetryModal,
    openSearchModal,
    openStatusModal,
    closeModal,
  };
}
