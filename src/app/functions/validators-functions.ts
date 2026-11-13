import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, map, switchMap, timer } from 'rxjs';
import { ProductVerification } from '../interfaces/products.interface';
import { addOneYear, getToday } from './date-functions';

export function todayOrLaterValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		if (!control.value) return null;
		return control.value < getToday() ? { beforeToday: true } : null;
	};
}

export function oneYearAfterValidator(startKey: string, endKey: string): ValidatorFn {
	return (group: AbstractControl): ValidationErrors | null => {
		const start = group.get(startKey)?.value;
		const end = group.get(endKey)?.value;
		if (!start || !end) return null;
		return end === addOneYear(start) ? null : { oneYearAfter: true };
	};
}

export function uniqueIdValidator(verifyId: (id: string) => Observable<ProductVerification>): AsyncValidatorFn {
	return (control: AbstractControl): Observable<ValidationErrors | null> =>
		timer(400).pipe(
			switchMap(() => verifyId(control.value)),
			map((resp) => {
				if (!resp.ok) return { idNotVerified: true };
				return resp.exists ? { idExists: true } : null;
			})
		);
}
