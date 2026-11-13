import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AlertComponent } from '../../../components/alert/alert.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { addOneYear, getToday } from '../../../functions/date-functions';
import { Product } from '../../../interfaces/products.interface';
import { ProductsFormService } from '../../../services/form-services/products-form.service';
import { ProductsService } from '../../../services/products.service';
import { ToastService } from '../../../services/toast.service';

@Component({
	selector: 'app-products-form',
	imports: [ReactiveFormsModule, AlertComponent, FormFieldComponent],
	templateUrl: './products-form.component.html',
})
export class ProductsFormComponent {
	private readonly productsService = inject(ProductsService);
	private readonly productsFormService = inject(ProductsFormService);
	private readonly toastService = inject(ToastService);
	private readonly router = inject(Router);

	readonly saving = signal(false);
	readonly errorMessage = signal('');
	readonly today = getToday();

	readonly form = this.productsFormService.createEmptyProductForm((id) => this.productsService.verifyProductId(id));
	readonly verifyingId = toSignal(this.form.controls.id.statusChanges.pipe(map((status) => status === 'PENDING')), { initialValue: false });

	constructor() {
		this.form.controls.date_release.valueChanges.pipe(takeUntilDestroyed()).subscribe((release) => this.form.controls.date_revision.setValue(addOneYear(release)));
	}

	getError(field: keyof Product): string {
		return this.productsFormService.getProductFieldError(this.form, field);
	}

	saveProduct(): void {
		this.form.markAllAsTouched();
		if (!this.form.valid) return;

		this.saving.set(true);
		this.errorMessage.set('');
		this.productsService.createProduct(this.productsFormService.buildProductToSend(this.form)).subscribe((resp) => {
			this.saving.set(false);
			if (!resp.ok) {
				this.errorMessage.set(resp.message ?? 'No se pudo guardar el producto');
				return;
			}
			this.toastService.showSuccess('Producto agregado correctamente');
			this.router.navigate(['/products']);
		});
	}

	resetForm(): void {
		this.form.reset();
		this.errorMessage.set('');
	}
}
