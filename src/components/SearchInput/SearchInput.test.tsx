import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import axios from "axios";
import SearchInput from "./SearchInput";
import { MOCK_API_RESPONSE } from "../../mocks";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const HUMMINGBIRD_SELECTOR = "Allen's Hummingbird";

HTMLElement.prototype.scrollIntoView = jest.fn();
describe("SearchInput", () => {
	it("fetches and displays suggestions", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: MOCK_API_RESPONSE,
		});

		render(<SearchInput />);

		await fireEvent.change(screen.getByTestId("search-input"), {
			target: { value: "american robin" },
		});

		await waitFor(() => {
			expect(screen.getByText("American Robin")).toBeInTheDocument();
		});
	});

	it("selects a suggestion", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: MOCK_API_RESPONSE,
		});

		render(<SearchInput />);

		fireEvent.change(screen.getByTestId("search-input"), {
			target: { value: HUMMINGBIRD_SELECTOR },
		});

		await waitFor(() => {
			expect(screen.getByText(HUMMINGBIRD_SELECTOR)).toBeInTheDocument();
		});

		await userEvent.click(screen.getByText(HUMMINGBIRD_SELECTOR));

		await waitFor(() => {
			expect(screen.getByText(/Selected ID:/i)).toBeInTheDocument();
		});
	});

	it("supports clearing the input", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: MOCK_API_RESPONSE,
		});

		render(<SearchInput />);

		fireEvent.change(screen.getByTestId("search-input"), {
			target: { value: "test value" },
		});

		await userEvent.click(screen.getByTestId("clear-button"));

		await waitFor(() => {
			expect(screen.getByTestId("search-input")).toHaveValue("");
		});
	});
});
