import axios, { AxiosError } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { PuffLoader } from "react-spinners";
import {
	API_ERROR_MESSAGE,
	API_URL,
	LOADING_EFFECT_DEBOUNCE_TIME_MS,
	NO_RESULTS_MESSAGE,
	SEARCH_INPUT_DEBOUNCE_TIME_MS,
} from "../constants";
import { Bird } from "../types";
import { debounce, emphasizeQueryInTextResult } from "../utils";
import "./SearchInput.css";
import { SearchInputProps, SearchState } from "./types";
import { NotFoundSVG } from "./NotFoundSVG";

const INITIAL_SEARCH_STATE: SearchState = {
	suggestions: [],
	loading: false,
	message: "",
	activeIndex: null,
	selectedId: null,
};

export const SearchInput: React.FC<SearchInputProps> = ({ onSelect }) => {
	const [query, setQuery] = useState<string>("");
	const [searchState, setSearchState] =
		useState<SearchState>(INITIAL_SEARCH_STATE);
	const [isFocused, setIsFocused] = useState<boolean>(true);
	const [isMouseHovering, setIsMouseHovering] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	const typingTimeout = useRef<NodeJS.Timeout | null>(null);
	const suggestionsRef = useRef<HTMLUListElement>(null);
	const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	const updateSearchState = useCallback((updates: Partial<SearchState>) => {
		setSearchState((prev) => ({ ...prev, ...updates }));
	}, []);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const fetchSuggestions = useCallback(
		debounce(async (searchQuery: string) => {
			try {
				updateSearchState({ loading: true });
				const response = await axios.get<Bird[]>(
					`${API_URL}?q=${searchQuery}`
				);

				updateSearchState({
					suggestions: response.data,
					message:
						response.data.length === 0 ? NO_RESULTS_MESSAGE : "",
					loading: false,
				});
			} catch (error) {
				const errorMessage =
					error instanceof AxiosError
						? error.response?.data?.message || API_ERROR_MESSAGE
						: API_ERROR_MESSAGE;

				updateSearchState({
					message: errorMessage,
					loading: false,
					suggestions: [],
				});
			}
		}, SEARCH_INPUT_DEBOUNCE_TIME_MS),
		[updateSearchState]
	);

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
		if (searchState.activeIndex !== null) {
			scrollToActiveItem(searchState.activeIndex);
		}
	}, [searchState.activeIndex, scrollToActiveItem]);

	const handleSuggestionClick = useCallback(
		(id: number) => {
			updateSearchState({
				selectedId: id,
				suggestions: [],
			});
			setQuery("");
			onSelect?.(id);
		},
		[onSelect, updateSearchState]
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (isMouseHovering) return;

			const { suggestions, activeIndex } = searchState;

			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					updateSearchState({
						activeIndex:
							activeIndex === null ||
							activeIndex === suggestions.length - 1
								? 0
								: activeIndex + 1,
					});
					break;
				case "ArrowUp":
					event.preventDefault();
					updateSearchState({
						activeIndex:
							activeIndex === null || activeIndex === 0
								? suggestions.length - 1
								: activeIndex - 1,
					});
					break;
				case "Enter":
					if (activeIndex !== null) {
						handleSuggestionClick(suggestions[activeIndex].id);
					}
					break;
				case "Escape":
					updateSearchState({
						activeIndex: null,
						suggestions: [],
					});
					inputRef.current?.blur();
					break;
			}
		},
		[isMouseHovering, searchState, updateSearchState, handleSuggestionClick]
	);

	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setIsTyping(true);
			const value = event.target.value;
			setQuery(value);

			updateSearchState({ activeIndex: null });

			if (value.length >= 3) {
				fetchSuggestions(value);
			} else {
				updateSearchState({
					suggestions: [],
					message: "Enter at least 3 characters",
				});
			}

			if (typingTimeout.current) {
				clearTimeout(typingTimeout.current);
			}

			typingTimeout.current = setTimeout(() => {
				setIsTyping(false);
			}, LOADING_EFFECT_DEBOUNCE_TIME_MS);
		},
		[fetchSuggestions, updateSearchState]
	);

	const handleMouseEnter = useCallback(
		(index: number) => {
			updateSearchState({ activeIndex: index });
			setIsMouseHovering(true);
		},
		[updateSearchState]
	);

	const { suggestions, loading, message, activeIndex, selectedId } =
		searchState;

	const showSuggestions = suggestions.length > 0 && isFocused;

	return (
		<div
			className="search-container"
			role="search"
			aria-label="Search birds"
		>
			{selectedId && (
				<div className="selected-id" aria-live="polite">
					Selected ID: {selectedId}
				</div>
			)}
			<div className={`input-wrapper ${showSuggestions ? "open" : ""}`}>
				<div className={`search-input ${isFocused ? "focused" : ""}`}>
					<input
						ref={inputRef}
						data-testid="search-input"
						type="text"
						value={query}
						onChange={handleInputChange}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder="Search for birds..."
						onKeyDown={handleKeyDown}
						role="combobox"
						aria-expanded={showSuggestions}
						aria-controls="suggestions-list"
						aria-autocomplete="list"
						aria-activedescendant={
							activeIndex !== null
								? `suggestion-${activeIndex}`
								: undefined
						}
					/>

					<PuffLoader
						className="loading-icon"
						size="15px"
						cssOverride={{
							position: "absolute",
							top: "7px",
							right: "20px",
							opacity: loading || isTyping ? 1 : 0,
						}}
						aria-hidden="true"
					/>
					<LuSearch
						size="20px"
						className={`search-icon ${
							!loading && !isTyping ? "show" : ""
						}`}
						aria-hidden="true"
					/>
				</div>
			</div>

			{showSuggestions && (
				<ul
					id="suggestions-list"
					className="suggestions-list"
					ref={suggestionsRef}
					role="listbox"
				>
					{suggestions.map((item, index) => (
						<li
							key={item.id}
							id={`suggestion-${index}`}
							onMouseDown={(event) => {
								event.preventDefault();
								event.stopPropagation();
								handleSuggestionClick(item.id);
							}}
							onMouseEnter={() => handleMouseEnter(index)}
							onMouseLeave={() => setIsMouseHovering(false)}
							className={activeIndex === index ? "active" : ""}
							ref={(el) => (itemsRef.current[index] = el)}
							role="option"
							aria-selected={activeIndex === index}
							tabIndex={-1}
						>
							{emphasizeQueryInTextResult(item.title, query)}
						</li>
					))}
				</ul>
			)}
			{message && (
				<div className="message" role="status" aria-live="polite">
					{message}
				</div>
			)}
			<NotFoundSVG
				style={{
					opacity: searchState.message === NO_RESULTS_MESSAGE ? 1 : 0,
					width: "50%",
					alignSelf: "center",
					marginTop: "20px",
				}}
			/>
		</div>
	);
};

export default SearchInput;
