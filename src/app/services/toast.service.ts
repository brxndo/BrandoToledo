import { Service, signal } from '@angular/core';
import { Toast } from '../interfaces/toast.interface';

@Service()
export class ToastService {
	private readonly _toast = signal<Toast | null>(null);
	readonly toast = this._toast.asReadonly();

	private timeoutId?: ReturnType<typeof setTimeout>;

	showSuccess(message: string): void {
		this.show({ message, type: 'success' });
	}

	showError(message: string): void {
		this.show({ message, type: 'error' });
	}

	close(): void {
		clearTimeout(this.timeoutId);
		this._toast.set(null);
	}

	private show(toast: Toast): void {
		clearTimeout(this.timeoutId);
		this._toast.set(toast);
		this.timeoutId = setTimeout(() => this._toast.set(null), 4000);
	}
}
