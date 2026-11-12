import { Component, computed, input, linkedSignal } from '@angular/core';
import { getInitials } from '../../functions/general-functions';

@Component({
	selector: 'app-avatar',
	templateUrl: './avatar.component.html',
	host: { class: 'inline-flex' },
})
export class AvatarComponent {
	readonly src = input('');
	readonly name = input('');

	readonly imageFailed = linkedSignal({ source: this.src, computation: () => false });
	readonly initials = computed(() => getInitials(this.name()));
}
