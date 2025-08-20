import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BenefitDetailPage from "@/app/benefit/[id]/page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "b1" }),
}));

describe("BenefitDetailPage error + actions", () => {
  it("shows not found on 404 and action buttons open windows", async () => {
    // First render: 404
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
    render(<BenefitDetailPage />);
    await screen.findByText(/not found|לא נמצאה|benefit/i);

    // Second render: success payload
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "b1",
        title: "T",
        description: "D",
        brand: {
          name: "Brand",
          logoUrl: "/x.png",
          website: "https://brand.example",
        },
        validityType: "birthday_month",
        redemptionMethod: "Show code",
        url: "https://buy.example",
        termsAndConditions: "Terms",
      }),
    });

    const openSpy = jest
      .spyOn(window, "open")
      .mockImplementation(() => null as any);
    render(<BenefitDetailPage />);
    await waitFor(() => expect(screen.getByText("Brand")).toBeInTheDocument());

    // Buy button
    const buyBtn = screen.getByRole("button", { name: /buy|קנה|רכישה/i });
    fireEvent.click(buyBtn);
    expect(openSpy).toHaveBeenCalled();

    // Official site button
    const siteBtn = screen
      .getAllByRole("button")
      .find((b) => /official|רשמי|website/i.test(b.textContent || ""))!;
    fireEvent.click(siteBtn);
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});
