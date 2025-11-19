import Modal from "./Modal";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  const buttonClass = type === "danger" ? "btn-danger" : "btn-primary";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="btn btn-secondary">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`btn ${buttonClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
