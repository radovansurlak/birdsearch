import { Bird } from "../types";

export interface SearchState {
	suggestions: Bird[];
	loading: boolean;
	message: string;
	activeIndex: number | null;
	selectedId: number | null;
}

export interface SearchInputProps {
    onSelect?: (id: number) => void;
}