export function emphasizeQueryInTextResult(text: string = "", query: string) {
	const parts = text.split(new RegExp(`(${query})`, "gi"));
	return (
		<span>
			{parts.map((part, index) =>
				part.toLowerCase() === query.toLowerCase() ? (
					<b key={index}>{part}</b>
				) : (
					part
				)
			)}
		</span>
	);
}
