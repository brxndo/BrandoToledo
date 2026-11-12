import { Component, computed, input, output } from '@angular/core';
import { getTotalPages } from '../../functions/general-functions';

@Component({
	selector: 'app-pagination',
	templateUrl: './pagination.component.html',
})
export class PaginationComponent {
	readonly totalItems = input.required<number>();
	readonly itemsPerPage = input.required<number>();
	readonly currentPage = input(1);
	readonly pageChange = output<number>();

	readonly totalPages = computed(() => getTotalPages(this.totalItems(), this.itemsPerPage()));

	changePage(page: number): void {
		if (page < 1 || page > this.totalPages()) return;
		this.pageChange.emit(page);
	}
}
