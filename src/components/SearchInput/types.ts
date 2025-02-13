import { Bird } from "../../types";

export interface SearchState {
	suggestions: Bird[];
	isLoading: boolean;
	message: string;
	activeIndex: number | null;
	selectedId: number | null;
}

export interface SearchInputProps {
    onSelect?: (id: number) => void;
}