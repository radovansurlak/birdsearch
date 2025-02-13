import React, { useCallback, useRef, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";
import { PuffLoader } from "react-spinners";
import {
	LOADING_EFFECT_DEBOUNCE_TIME_MS,
	NO_RESULTS_MESSAGE,
} from "./constants";
import { emphasizeQueryInTextResult } from "../../utils";
import { NotFoundSVG } from "../NotFoundSVG";
import { SearchInputProps } from "./types";
import { useSearch } from "./hooks/useSearch";
import { useFocusOnMount } from "./hooks/useFocusOnMount";
import { useScrollToActiveItem } from "./hooks/useScrollToActiveItem";

import "./SearchInput.css";

export const SearchInput: React.FC<SearchInputProps> = ({ onSelect }) => {
	const {
		query,
		setQuery,
		searchState,
		fetchSuggestions,
		updateSearchState,
	} = useSearch();

	const { inputRef } = useFocusOnMount();

	const [isFocused, setIsFocused] = useState<boolean>(true);
	const [isTyping, setIsTyping] = useState(false);

	const { itemsRef, suggestionsRef } = useScrollToActiveItem(
		searchState.activeIndex
	);

	const typingTimeout = useRef<NodeJS.Timeout | null>(null);

	const handleSuggestionClick = useCallback(
		(id: number) => {
			updateSearchState({
				selectedId: id,
				suggestions: [],
			});
			setQuery("");
			onSelect?.(id);
		},
		[onSelect, updateSearchState, setQuery]
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
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
			}
		},
		[inputRef, searchState, updateSearchState, handleSuggestionClick]
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
		[fetchSuggestions, updateSearchState, setQuery]
	);

	const handleMouseEnter = useCallback(
		(index: number) => {
			updateSearchState({ activeIndex: index });
		},
		[updateSearchState]
	);

	const clearInput = useCallback(() => {
		setQuery("");
		updateSearchState({
			suggestions: [],
			message: "",
			activeIndex: null,
		});
	}, [setQuery, updateSearchState]);

	const { suggestions, isLoading, message, activeIndex, selectedId } =
		searchState;

	const showSuggestions = suggestions.length > 0 && isFocused;
	const showClearButton = query.length > 0;

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

					<LuX
						data-testid="clear-button"
						className={`clear-button ${
							showClearButton ? "show" : ""
						}`}
						onClick={clearInput}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								clearInput();
							}
						}}
						tabIndex={0}
						role="button"
						aria-label="Clear search input"
					/>

					<PuffLoader
						className="loading-icon"
						size="15px"
						cssOverride={{
							position: "absolute",
							top: "7px",
							right: "20px",
							opacity: isLoading || isTyping ? 1 : 0,
						}}
						aria-hidden="true"
					/>
					<LuSearch
						size="20px"
						className={`search-icon ${
							!isLoading && !isTyping ? "show" : ""
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
							onMouseDown={() => handleSuggestionClick(item.id)}
							onMouseEnter={() => handleMouseEnter(index)}
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
