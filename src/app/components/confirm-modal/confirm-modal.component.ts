import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';
import { AlertComponent } from '../alert/alert.component';

@Component({
	selector: 'app-confirm-modal',
	imports: [AlertComponent],
	templateUrl: './confirm-modal.component.html',
	host: { '(document:keydown.escape)': 'cancel()' },
})
export class ConfirmModalComponent {
	readonly message = input.required<string>();
	readonly confirmText = input('Confirmar');
	readonly loadingText = input('Procesando...');
	readonly loading = input(false);
	readonly errorMessage = input('');
	readonly confirmed = output<void>();
	readonly cancelled = output<void>();

	private readonly cancelButton = viewChild.required<ElementRef<HTMLButtonElement>>('cancelButton');

	constructor() {
		afterNextRender(() => this.cancelButton().nativeElement.focus());
	}

	cancel(): void {
		if (this.loading()) return;
		this.cancelled.emit();
	}
}
