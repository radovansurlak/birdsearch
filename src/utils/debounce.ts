export function debounce<F extends (...args: any[]) => void>(
	func: F,
	delay: number
): (...args: Parameters<F>) => void {
	let timeoutId: NodeJS.Timeout;

	return (...args: Parameters<F>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
}
