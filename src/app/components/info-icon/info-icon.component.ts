import { Component, input } from '@angular/core';

@Component({
	selector: 'app-info-icon',
	templateUrl: './info-icon.component.html',
	host: { class: 'inline-flex' },
})
export class InfoIconComponent {
	readonly text = input.required<string>();
}
