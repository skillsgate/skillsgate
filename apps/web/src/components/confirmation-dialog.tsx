import { useEffect, useRef } from "react";

type ConfirmationDialogProps = {
	title: string;
	message: string;
	confirmLabel: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
};

export function ConfirmationDialog({
	title,
	message,
	confirmLabel,
	onConfirm,
	onCancel,
	isLoading = false,
}: ConfirmationDialogProps) {
	const overlayRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape" && !isLoading) {
				onCancel();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onCancel, isLoading]);

	function handleOverlayClick(e: React.MouseEvent) {
		if (e.target === overlayRef.current && !isLoading) {
			onCancel();
		}
	}

	return (
		<div
			ref={overlayRef}
			onClick={handleOverlayClick}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		>
			<div className="animate-fade-up w-full max-w-sm mx-4 rounded-xl border border-border bg-surface p-6">
				<h3 className="text-[16px] font-semibold text-foreground mb-2">
					{title}
				</h3>
				<p className="text-[14px] text-muted leading-relaxed mb-6">
					{message}
				</p>
				<div className="flex items-center justify-end gap-3">
					<button
						onClick={onCancel}
						disabled={isLoading}
						className="px-4 py-2 text-[13px] font-medium text-muted rounded-lg border border-border hover:bg-surface-hover transition-colors disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className="px-4 py-2 text-[13px] font-medium text-red-50 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
					>
						{isLoading && (
							<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-white" />
						)}
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
