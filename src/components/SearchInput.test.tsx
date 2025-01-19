import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import SearchInput from "./SearchInput";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SearchInput", () => {
	it("shows message for less than 3 characters", () => {
		render(<SearchInput />);
		fireEvent.change(screen.getByPlaceholderText("Search for birds..."), {
			target: { value: "ab" },
		});
		expect(
			screen.getByText("Enter at least 3 characters")
		).toBeInTheDocument();
	});

	it("fetches and displays suggestions", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: [{ id: 1, name: "American Robin" }],
		});

		render(<SearchInput />);
		fireEvent.change(screen.getByPlaceholderText("Search for birds..."), {
			target: { value: "ame" },
		});

		await waitFor(() => {
			expect(screen.getByText("American Robin")).toBeInTheDocument();
		});
	});

	it("shows no results message", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: [] });

		render(<SearchInput />);
		fireEvent.change(screen.getByPlaceholderText("Search for birds..."), {
			target: { value: "xyz" },
		});

		await waitFor(() => {
			expect(screen.getByText("No results found")).toBeInTheDocument();
		});
	});

	it("displays selected ID", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: [{ id: 1, name: "American Robin" }],
		});

		render(<SearchInput />);
		fireEvent.change(screen.getByPlaceholderText("Search for birds..."), {
			target: { value: "ame" },
		});

		await waitFor(() => {
			fireEvent.click(screen.getByText("American Robin"));
			expect(screen.getByText("Selected ID: 1")).toBeInTheDocument();
		});
	});
});
