import axios, { AxiosError } from "axios";
import { useState, useCallback, useRef, useEffect } from "react";
import {
	API_URL,
	NO_RESULTS_MESSAGE,
	API_ERROR_MESSAGE,
	SEARCH_INPUT_DEBOUNCE_TIME_MS,
} from "../../../constants";
import { Bird } from "../../../types";
import { debounce } from "../../../utils";
import { SearchState } from "../../types";

const INITIAL_SEARCH_STATE: SearchState = {
	suggestions: [],
	isLoading: false,
	message: "",
	activeIndex: null,
	selectedId: null,
};

const useAbortController = () => {
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => abortControllerRef.current?.abort, []);

	return { abortControllerRef };
};

export const useSearch = () => {
	const [query, setQuery] = useState<string>("");
	const [searchState, setSearchState] =
		useState<SearchState>(INITIAL_SEARCH_STATE);

	const { abortControllerRef } = useAbortController();

	const updateSearchState = useCallback((updates: Partial<SearchState>) => {
		setSearchState((prev) => ({ ...prev, ...updates }));
	}, []);

	const fetchSuggestions = useCallback(
		debounce(async (searchQuery: string) => {
			try {
				if (abortControllerRef.current) {
					abortControllerRef.current.abort();
				}

				abortControllerRef.current = new AbortController();

				updateSearchState({ isLoading: true });

				const response = await axios.get<Bird[]>(
					`${API_URL}?q=${searchQuery}`,
					{
						signal: abortControllerRef.current.signal,
					}
				);

				updateSearchState({
					suggestions: response.data,
					message:
						response.data.length === 0 ? NO_RESULTS_MESSAGE : "",
					isLoading: false,
				});
			} catch (error) {
				if (axios.isCancel(error)) {
					return;
				}

				const errorMessage =
					error instanceof AxiosError
						? error.response?.data?.message || API_ERROR_MESSAGE
						: API_ERROR_MESSAGE;

				updateSearchState({
					message: errorMessage,
					isLoading: false,
					suggestions: [],
				});
			}
		}, SEARCH_INPUT_DEBOUNCE_TIME_MS),
		[updateSearchState]
	);

	return {
		query,
		setQuery,
		searchState,
		fetchSuggestions,
		updateSearchState,
	};
};
