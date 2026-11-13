import { Service } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { oneYearAfterValidator, todayOrLaterValidator, uniqueIdValidator } from '../../functions/validators-functions';
import { Product, ProductVerification } from '../../interfaces/products.interface';

export type ProductForm = FormGroup<{
	id: FormControl<string>;
	name: FormControl<string>;
	description: FormControl<string>;
	logo: FormControl<string>;
	date_release: FormControl<string>;
	date_revision: FormControl<string>;
}>;

const REQUIRED_MESSAGE = 'Este campo es requerido!';

function wasUsed(control: AbstractControl): boolean {
	return control.touched || control.dirty;
}

function hasLengthError(control: AbstractControl): boolean {
	return control.hasError('minlength') || control.hasError('maxlength');
}

@Service()
export class ProductsFormService {
	createEmptyProductForm(verifyId: (id: string) => Observable<ProductVerification>): ProductForm {
		return new FormGroup(
			{
				id: new FormControl('', {
					nonNullable: true,
					validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
					asyncValidators: [uniqueIdValidator(verifyId)],
				}),
				name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5), Validators.maxLength(100)] }),
				description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(200)] }),
				logo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
				date_release: new FormControl('', { nonNullable: true, validators: [Validators.required, todayOrLaterValidator()] }),
				date_revision: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
			},
			{ validators: [oneYearAfterValidator('date_release', 'date_revision')] }
		);
	}

	buildProductToSend(form: ProductForm): Product {
		return form.getRawValue();
	}

	getProductFieldError(form: ProductForm, field: keyof Product): string {
		const control = form.controls[field];
		if (!wasUsed(control)) return '';
		if (control.hasError('required')) return REQUIRED_MESSAGE;

		switch (field) {
			case 'id':
				if (hasLengthError(control)) return 'ID no válido! Debe tener entre 3 y 10 caracteres';
				if (control.hasError('idExists')) return 'ID no válido! Ya existe un producto con ese ID';
				if (control.hasError('idNotVerified')) return 'No se pudo verificar el ID, intenta de nuevo';
				return '';
			case 'name':
				return hasLengthError(control) ? 'El nombre debe tener entre 5 y 100 caracteres' : '';
			case 'description':
				return hasLengthError(control) ? 'La descripción debe tener entre 10 y 200 caracteres' : '';
			case 'date_release':
				return control.hasError('beforeToday') ? 'La fecha debe ser igual o mayor a la fecha actual' : '';
			case 'date_revision':
				return form.hasError('oneYearAfter') ? 'Debe ser exactamente un año posterior a la fecha de liberación' : '';
			default:
				return '';
		}
	}
}
