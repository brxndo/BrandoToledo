function pad(value: number, length = 2): string {
	return String(value).padStart(length, '0');
}

export function toInputDate(date: Date): string {
	return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toDateOnly(date: Date | string): string {
	const value = typeof date === 'string' ? date : date.toISOString();
	return value.substring(0, 10);
}

export function getToday(): string {
	return toInputDate(new Date());
}

export function addOneYear(date: string): string {
	const [year, month, day] = date.split('-').map(Number);
	if (!year || !month || !day) return '';
	const nextDay = month === 2 && day === 29 ? 28 : day;
	return `${pad(year + 1, 4)}-${pad(month)}-${pad(nextDay)}`;
}
