import axios from "axios";
import React, { useCallback, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Bird } from "../types";
import { debounce, emphasizeQueryInTextResult } from "../utils";
import "./SearchInput.css";
import { API_URL, SEARCH_INPUT_DEBOUNCE_TIME_MS } from "../constants";

export const SearchInput: React.FC = () => {
	const [query, setQuery] = useState<string>("");
	const [suggestions, setSuggestions] = useState<Bird[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [focused, setFocused] = useState<boolean>(false);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [message, setMessage] = useState<string>("");

	const fetchSuggestions = useCallback(
		debounce(async (searchQuery: string) => {
			try {
				setLoading(true);
				const response = await axios.get<Bird[]>(
					`${API_URL}?q=${searchQuery}`
				);
				setSuggestions(response.data);
				setMessage(
					response.data.length === 0 ? "No results found" : ""
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
		const value = event.target.value;
		setQuery(value);

		if (value.length >= 3) {
			fetchSuggestions(value);
		} else {
			setSuggestions([]);
			setMessage("Enter at least 3 characters");
		}
	};

	const handleSuggestionClick = (id: number) => {
		setSelectedId(id);
		setSuggestions([]);
		setQuery("");
	};

	const handleKeyDown = (
		event: React.KeyboardEvent<HTMLLIElement>,
		id: number
	) => {
		if (event.key === "Enter") {
			handleSuggestionClick(id);
		}
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
							type="text"
							value={query}
							onChange={handleInputChange}
							onFocus={() => setFocused(true)}
							onBlur={() => setFocused(false)}
							placeholder="Search for birds..."
						/>
						<FaSearch className="search-icon" />
					</div>
				</div>
				{/* {loading && <div className="loading">Loading...</div>} */}
				{suggestions.length > 0 && (
					<ul className="suggestions-list">
						{suggestions.map((item) => (
							<li
								key={item.id}
								onClick={() => handleSuggestionClick(item.id)}
								tabIndex={0}
								onKeyDown={(event) =>
									handleKeyDown(event, item.id)
								}
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
