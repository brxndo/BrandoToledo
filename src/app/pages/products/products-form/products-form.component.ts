import { Component, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
	imports: [ReactiveFormsModule, RouterLink, AlertComponent, FormFieldComponent],
	templateUrl: './products-form.component.html',
})
export class ProductsFormComponent implements OnInit {
	readonly id = input<string>();

	private readonly productsService = inject(ProductsService);
	private readonly productsFormService = inject(ProductsFormService);
	private readonly toastService = inject(ToastService);
	private readonly router = inject(Router);

	readonly loading = signal(false);
	readonly loadError = signal('');
	readonly saving = signal(false);
	readonly errorMessage = signal('');
	readonly today = getToday();
	readonly skeletonFields = [1, 2, 3, 4, 5, 6];
	private product: Product | null = null;

	readonly form = this.productsFormService.createEmptyProductForm((id) => this.productsService.verifyProductId(id));
	readonly verifyingId = toSignal(this.form.controls.id.statusChanges.pipe(map((status) => status === 'PENDING')), { initialValue: false });

	constructor() {
		this.form.controls.date_release.valueChanges.pipe(takeUntilDestroyed()).subscribe((release) => this.form.controls.date_revision.setValue(addOneYear(release)));
	}

	ngOnInit(): void {
		this.loadProduct();
	}

	loadProduct(): void {
		const id = this.id();
		if (!id) return;

		this.loading.set(true);
		this.loadError.set('');
		this.productsService.getProductById(id).subscribe((resp) => {
			this.loading.set(false);
			if (!resp.ok || !resp.data) {
				this.loadError.set(resp.message ?? 'No se pudo cargar el producto');
				return;
			}
			this.product = resp.data;
			this.productsFormService.loadProductInForm(this.form, resp.data);
		});
	}

	getError(field: keyof Product): string {
		return this.productsFormService.getProductFieldError(this.form, field);
	}

	saveProduct(): void {
		this.form.markAllAsTouched();
		if (!this.form.valid) return;

		this.saving.set(true);
		this.errorMessage.set('');
		const id = this.id();
		const request = id
			? this.productsService.updateProduct(id, this.productsFormService.buildChangesToSend(this.form))
			: this.productsService.createProduct(this.productsFormService.buildProductToSend(this.form));

		request.subscribe((resp) => {
			this.saving.set(false);
			if (!resp.ok) {
				this.errorMessage.set(resp.message ?? 'No se pudo guardar el producto');
				return;
			}
			this.toastService.showSuccess(id ? 'Producto actualizado correctamente' : 'Producto agregado correctamente');
			this.router.navigate(['/products']);
		});
	}

	resetForm(): void {
		this.errorMessage.set('');
		if (this.product) {
			this.productsFormService.loadProductInForm(this.form, this.product);
			return;
		}
		this.form.reset();
	}
}
