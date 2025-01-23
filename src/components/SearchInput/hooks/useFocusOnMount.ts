import { useRef, useEffect } from "react";

export const useFocusOnMount = () => {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	return { inputRef };
};
