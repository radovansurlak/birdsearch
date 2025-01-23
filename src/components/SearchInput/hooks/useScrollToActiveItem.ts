import { useRef, useCallback, useEffect } from "react";

export const useScrollToActiveItem = (activeIndex: number | null) => {
	const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
	const suggestionsRef = useRef<HTMLUListElement>(null);

	const scrollToActiveItem = useCallback((index: number) => {
		const currentActiveItem = itemsRef.current[index];

		if (currentActiveItem) {
			currentActiveItem.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
			});
		}
	}, []);

	useEffect(() => {
		if (activeIndex !== null) {
			scrollToActiveItem(activeIndex);
		}
	}, [activeIndex, scrollToActiveItem]);

	return {
		itemsRef,
		suggestionsRef,
	};
};
