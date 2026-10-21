import { useEffect } from "react";
import { CloseIcon } from "../src/icons";

export default function Modal({ isOpen, onClose, title, children }) {
	// Close on Escape (only while the modal is open)
	useEffect(() => {
		if (!isOpen) return;
		function onKey(e) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content"
				role="dialog"
				aria-modal="true"
				aria-label={title}
				onClick={(e) => e.stopPropagation()}
			>
				<button className="modal-close" onClick={onClose} aria-label="Close">
					<CloseIcon height="1.5em" />
				</button>
				<h2>{title}</h2>
				{children}
			</div>
		</div>
	);
}