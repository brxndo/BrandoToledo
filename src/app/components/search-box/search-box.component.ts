import { Component, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';

@Component({
	selector: 'app-search-box',
	templateUrl: './search-box.component.html',
})
export class SearchBoxComponent {
	readonly term = input('');
	readonly placeholder = input('Buscar...');
	readonly termChange = output<string>();

	private readonly debouncer = new Subject<string>();

	constructor() {
		this.debouncer.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((value) => this.termChange.emit(value));
	}

	onInput(value: string): void {
		this.debouncer.next(value);
	}
}
