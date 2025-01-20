import axios from "axios";
import React, { useCallback, useRef, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { PuffLoader } from "react-spinners";
import {
	API_URL,
	LOADING_EFFECT_DEBOUNCE_TIME_MS,
	NO_RESULTS_MESSAGE,
	SEARCH_INPUT_DEBOUNCE_TIME_MS,
} from "../constants";
import { Bird } from "../types";
import { debounce, emphasizeQueryInTextResult } from "../utils";
import "./SearchInput.css";

export const SearchInput: React.FC = () => {
	const [query, setQuery] = useState<string>("");
	const [suggestions, setSuggestions] = useState<Bird[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [focused, setFocused] = useState<boolean>(false);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [message, setMessage] = useState<string>("");
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [isMouseHovering, setIsMouseHovering] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const typingTimeout = useRef<NodeJS.Timeout | null>(null);
	const suggestionsRef = useRef<HTMLUListElement>(null);
	const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (isMouseHovering) return;

		if (event.key === "ArrowDown") {
			setActiveIndex((prev) => {
				const newIndex =
					prev === null || prev === suggestions.length - 1
						? 0
						: prev + 1;
				scrollToActiveItem(newIndex);
				return newIndex;
			});
		} else if (event.key === "ArrowUp") {
			setActiveIndex((prev) => {
				const newIndex =
					prev === null || prev === 0
						? suggestions.length - 1
						: prev - 1;
				scrollToActiveItem(newIndex);
				return newIndex;
			});
		} else if (event.key === "Enter" && activeIndex !== null) {
			handleSuggestionClick(suggestions[activeIndex].id);
		} else if (event.key === "Escape") {
			setActiveIndex(null);
			setSuggestions([]);
		}
	};

	const handleMouseEnter = (index: number) => {
		setActiveIndex(index);
		setIsMouseHovering(true);
	};

	const handleMouseLeave = () => {
		setActiveIndex(null);
		setIsMouseHovering(false);
	};

	const scrollToActiveItem = (index: number) => {
		if (itemsRef.current[index]) {
			itemsRef.current[index]?.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
			});
		}
	};

	const fetchSuggestions = useCallback(
		debounce(async (searchQuery: string) => {
			try {
				setLoading(true);
				const response = await axios.get<Bird[]>(
					`${API_URL}?q=${searchQuery}`
				);
				setSuggestions(response.data);
				setMessage(
					response.data.length === 0 ? NO_RESULTS_MESSAGE : ""
				);
			} catch (error) {
				setMessage("Error fetching suggestions");
			} finally {
				setLoading(false);
			}
		}, SEARCH_INPUT_DEBOUNCE_TIME_MS),
		[]
	);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsTyping(true);
		setActiveIndex(null);

		const value = event.target.value;

		setQuery(value);

		if (value.length >= 3) {
			fetchSuggestions(value);
		} else {
			setSuggestions([]);
			setMessage("Enter at least 3 characters");
		}

		if (typingTimeout.current) {
			clearTimeout(typingTimeout.current); // Clear the previous timeout
		}

		typingTimeout.current = setTimeout(() => {
			setIsTyping(false);
		}, LOADING_EFFECT_DEBOUNCE_TIME_MS);
	};

	const handleSuggestionClick = (id: number) => {
		setSelectedId(id);
		setSuggestions([]);
		setQuery("");
	};

	return (
		<>
			<div className="search-container">
				<div
					className={`input-wrapper ${
						suggestions.length > 0 ? "open" : ""
					}`}
				>
					<div className={`search-input ${focused ? "focused" : ""}`}>
						<input
							data-testid="search-input"
							type="text"
							value={query}
							onChange={handleInputChange}
							onFocus={() => setFocused(true)}
							onBlur={() => setFocused(false)}
							placeholder="Search for birds..."
							onKeyDown={handleKeyDown}
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
						/>
						<LuSearch
							size="20px"
							className={`search-icon ${
								!loading && !isTyping ? "show" : ""
							}`}
						/>
					</div>
				</div>
				{suggestions.length > 0 && (
					<ul className="suggestions-list" ref={suggestionsRef}>
						{suggestions.map((item, index) => (
							<li
								key={item.id}
								onClick={() => handleSuggestionClick(item.id)}
								tabIndex={0}
								onMouseEnter={() => handleMouseEnter(index)}
								onMouseLeave={handleMouseLeave}
								className={
									activeIndex === index ? "active" : ""
								}
								ref={(el) => (itemsRef.current[index] = el)} // Attach refs to items
							>
								{emphasizeQueryInTextResult(item.title, query)}
							</li>
						))}
					</ul>
				)}
				{message && <div className="message">{message}</div>}
				{selectedId && (
					<div className="selected-id">Selected ID: {selectedId}</div>
				)}
			</div>
		</>
	);
};

export default SearchInput;
