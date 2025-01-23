import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import axios from "axios";
import SearchInput from "./SearchInput";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const HUMMINGBIRD_SELECTOR = "Allen's Hummingbird";

const MOCK_API_RESPONSE = [
	{ id: 6, title: "Allen's Hummingbird" },
	{ id: 7, title: "Altamira Oriole" },
	{ id: 8, title: "American Avocet" },
	{ id: 9, title: "American Bittern" },
	{ id: 10, title: "American Black Duck" },
	{ id: 11, title: "American Coot" },
	{ id: 12, title: "American Crow" },
	{ id: 13, title: "American Dipper" },
	{ id: 14, title: "American Golden-Plover" },
	{ id: 15, title: "American Goldfinch" },
	{ id: 16, title: "American Kestrel" },
	{ id: 17, title: "American Oystercatcher" },
	{ id: 18, title: "American Pipit" },
	{ id: 19, title: "American Redstart" },
	{ id: 20, title: "American Robin" },
	{ id: 21, title: "American Tree Sparrow" },
	{ id: 22, title: "American White Pelican" },
	{ id: 23, title: "American Wigeon" },
	{ id: 24, title: "American Woodcock" },
	{ id: 25, title: "Ancient Murrelet" },
];

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
});
