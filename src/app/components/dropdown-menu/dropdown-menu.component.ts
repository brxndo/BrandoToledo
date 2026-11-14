import { Component, DestroyRef, ElementRef, inject, input, signal, viewChild } from '@angular/core';

interface MenuPosition {
	top?: number;
	bottom?: number;
	right: number;
}

@Component({
	selector: 'app-dropdown-menu',
	templateUrl: './dropdown-menu.component.html',
	host: {
		class: 'inline-flex',
		'(document:click)': 'onDocumentClick($event)',
		'(document:keydown.escape)': 'close()',
	},
})
export class DropdownMenuComponent {
	readonly label = input('Abrir menú');

	private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

	readonly open = signal(false);
	readonly position = signal<MenuPosition>({ right: 0 });

	constructor() {
		const close = (): void => this.close();
		window.addEventListener('scroll', close, true);
		window.addEventListener('resize', close);
		inject(DestroyRef).onDestroy(() => {
			window.removeEventListener('scroll', close, true);
			window.removeEventListener('resize', close);
		});
	}

	toggle(): void {
		if (this.open()) {
			this.close();
			return;
		}
		const rect = this.trigger().nativeElement.getBoundingClientRect();
		const right = document.documentElement.clientWidth - rect.right;
		const fitsBelow = window.innerHeight - rect.bottom > 120;
		this.position.set(fitsBelow ? { top: rect.bottom + 4, right } : { bottom: window.innerHeight - rect.top + 4, right });
		this.open.set(true);
	}

	close(): void {
		this.open.set(false);
	}

	onDocumentClick(event: Event): void {
		if (this.trigger().nativeElement.contains(event.target as Node)) return;
		this.close();
	}
}
