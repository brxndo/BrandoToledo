import { Component, input } from '@angular/core';

@Component({
	selector: 'app-form-field',
	templateUrl: './form-field.component.html',
	host: { class: 'flex flex-col' },
})
export class FormFieldComponent {
	readonly label = input.required<string>();
	readonly forId = input.required<string>();
	readonly error = input('');
	readonly muted = input(false);
}
