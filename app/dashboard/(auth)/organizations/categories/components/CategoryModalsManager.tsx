"use client";

import { useCategoryModals } from "../hooks/useCategoryModals";
import { CategoryDetailsModal } from "./category-details-modal";
import { CategoryFormModal } from "./category-form-modal";
import { CategoryDeleteDialog } from "./category-delete-dialog";

interface CategoryModalsManagerProps {
  // Modal management
  modals: ReturnType<typeof useCategoryModals>['modals'];
  closeModal: ReturnType<typeof useCategoryModals>['closeModal'];
}

export function CategoryModalsManager({
  modals,
  closeModal,
}: CategoryModalsManagerProps) {
  return (
    <>
      {/* Modal de détails */}
      <CategoryDetailsModal
        category={modals.details.category}
        isOpen={modals.details.isOpen}
        onClose={() => closeModal('details')}
      />

      {/* Modal de formulaire */}
      <CategoryFormModal
        isOpen={modals.form.isOpen}
        onClose={() => closeModal('form')}
        category={modals.form.category}
        mode={modals.form.formMode!}
      />

      {/* Dialog de suppression */}
      <CategoryDeleteDialog
        isOpen={modals.delete.isOpen}
        onClose={() => closeModal('delete')}
        category={modals.delete.category}
      />
    </>
  );
}