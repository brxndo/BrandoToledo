import { Component, input } from '@angular/core';

@Component({
	selector: 'app-alert',
	templateUrl: './alert.component.html',
})
export class AlertComponent {
	readonly message = input.required<string>();
}
