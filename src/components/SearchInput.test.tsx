import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import SearchInput from "./SearchInput";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SearchInput", () => {
	it("fetches and displays suggestions", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: [
				{ id: 1, title: "American Robin" },
				{ id: 2, title: "Ruffed Grouse" },
			],
		});

		render(<SearchInput />);
		fireEvent.change(screen.getByTestId("search-input"), {
			target: { value: "american robin" },
		});

		await waitFor(() => {
			expect(screen.getByText("American Robin")).toBeInTheDocument();
			expect(screen.getByText("Ruffed Grouse")).toBeInTheDocument();

		});
	});
});
