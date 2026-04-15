import { render, screen } from "@testing-library/react";
import { PaginationBar } from "@/components/ui/PaginationBar";

describe("PaginationBar", () => {
  it("renders nothing when totalPages is 1", () => {
    const { container } = render(<PaginationBar page={1} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when totalPages is 0", () => {
    const { container } = render(<PaginationBar page={1} totalPages={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows previous link on page 2+", () => {
    render(<PaginationBar page={2} totalPages={3} />);
    expect(
      screen.getByRole("link", { name: /previous/i })
    ).toHaveAttribute("href", "?page=1");
  });

  it("shows next link when not on last page", () => {
    render(<PaginationBar page={1} totalPages={3} />);
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute(
      "href",
      "?page=2"
    );
  });

  it("hides previous link on page 1", () => {
    render(<PaginationBar page={1} totalPages={3} />);
    expect(screen.queryByRole("link", { name: /previous/i })).toBeNull();
  });

  it("hides next link on last page", () => {
    render(<PaginationBar page={3} totalPages={3} />);
    expect(screen.queryByRole("link", { name: /next/i })).toBeNull();
  });

  it("shows current page and total pages", () => {
    render(<PaginationBar page={2} totalPages={5} />);
    expect(screen.getByText(/Page 2 of 5/i)).toBeInTheDocument();
  });

  it("previous link points to page-1", () => {
    render(<PaginationBar page={4} totalPages={5} />);
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute(
      "href",
      "?page=3"
    );
  });

  it("next link points to page+1", () => {
    render(<PaginationBar page={2} totalPages={5} />);
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute(
      "href",
      "?page=3"
    );
  });
});
