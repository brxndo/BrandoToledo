export function getInitials(name: string): string {
	const words = name
		.trim()
		.split(/\s+/)
		.filter((word) => word !== '');
	if (words.length === 0) return '';
	if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
	return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function paginate<T>(items: T[], page: number, itemsPerPage: number): T[] {
	const start = (page - 1) * itemsPerPage;
	return items.slice(start, start + itemsPerPage);
}

export function getTotalPages(totalItems: number, itemsPerPage: number): number {
	return Math.max(1, Math.ceil(totalItems / itemsPerPage));
}
