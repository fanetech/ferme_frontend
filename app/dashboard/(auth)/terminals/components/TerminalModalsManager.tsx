"use client";

import { UseMutationResult } from "@tanstack/react-query";
import type { Terminal, UpdateTerminalStatus } from "@/types";
import { useTerminalModals } from "../hooks/useTerminalModals";
import { TerminalDetailsModal } from "./terminal-details-modal";
import { TerminalFormModal } from "./terminal-form-modal";
import { TerminalDeleteDialog } from "./terminal-delete-dialog";
import { TerminalBlockDialog } from "./terminal-block-dialog";
import { TerminalBatchUploadModal } from "./terminal-batch-upload-modal";

interface TerminalModalsManagerProps {
  // Modal management
  modals: ReturnType<typeof useTerminalModals>['modals'];
  closeModal: ReturnType<typeof useTerminalModals>['closeModal'];
  
  // Data and mutations
  updateTerminalStatus: UseMutationResult<any, any, any, any>;
  onUpdateTerminalStatus: (terminal: Terminal, updateData: UpdateTerminalStatus) => void;
  
  // Structure data for form modal
  isLoadingStructures: boolean;
  isLoadingSuperStructures: boolean;
  structuresData: any;
  superStructuresData: any;
}

export function TerminalModalsManager({
  modals,
  closeModal,
  updateTerminalStatus,
  onUpdateTerminalStatus,
  isLoadingStructures,
  isLoadingSuperStructures,
  structuresData,
  superStructuresData,
}: TerminalModalsManagerProps) {
  return (
    <>
      {/* Modal de détails */}
      <TerminalDetailsModal
        terminal={modals.details.terminal}
        isOpen={modals.details.isOpen}
        onClose={() => closeModal('details')}
      />

      {/* Modal de formulaire */}
      <TerminalFormModal
        isOpen={modals.form.isOpen}
        onClose={() => closeModal('form')}
        terminal={modals.form.terminal}
        mode={modals.form.formMode!}
        isLoadingStructures={isLoadingStructures}
        isLoadingSuperStructures={isLoadingSuperStructures}
        structuresData={structuresData}
        superStructuresData={superStructuresData}
      />

      {/* Dialog de suppression */}
      <TerminalDeleteDialog
        onClose={() => closeModal('delete')}
        isOpen={modals.delete.isOpen}
        deleteMutation={updateTerminalStatus}
        onUpdateTerminalStatus={onUpdateTerminalStatus}
        terminal={modals.delete.terminal}
      />

      {/* Dialog de blocage */}
      <TerminalBlockDialog
        isOpen={modals.block.isOpen}
        blockMutation={updateTerminalStatus}
        onUpdateTerminalStatus={onUpdateTerminalStatus}
        onClose={() => closeModal('block')}
        terminal={modals.block.terminal}
      />

      {/* Batch Upload Modal */}
      <TerminalBatchUploadModal
        isOpen={modals.batchUpload.isOpen}
        onClose={() => closeModal('batchUpload')}
        isLoadingStructures={isLoadingStructures}
        structuresData={structuresData}
      />
    </>
  );
}