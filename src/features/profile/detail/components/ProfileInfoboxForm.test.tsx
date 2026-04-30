import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockProfile } from "../../../../test/fixtures/mockProfile";
import ProfileInfoboxForm from "./ProfileInfoboxForm";

describe("ProfileInfoboxForm", () => {
  it("renders profile data in edit mode", () => {
    render(
      <ProfileInfoboxForm
        profile={mockProfile}
        isEditing={true}
        setIsEditing={vi.fn()}
        onProfileUpdated={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/name/i)).toHaveValue(mockProfile.displayName);
    expect(screen.getByLabelText(/role/i)).toHaveValue(mockProfile.role);
    expect(screen.getByLabelText(/company/i)).toHaveValue(mockProfile.company);
    expect(screen.getByLabelText(/location/i)).toHaveValue(
      mockProfile.location,
    );
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockProfile.email);
    expect(screen.getByLabelText(/website/i)).toHaveValue(mockProfile.website);
    expect(screen.getByLabelText(/linkedin/i)).toHaveValue(
      mockProfile.linkedin,
    );
    expect(screen.getByLabelText(/github/i)).toHaveValue(mockProfile.github);

    mockProfile.expertise?.forEach((expertise) => {
      expect(screen.getByText(expertise)).toBeInTheDocument();
    });
  });

  it("shows validation errors for invalid input", async () => {
    const user = userEvent.setup();

    render(
      <ProfileInfoboxForm
        profile={mockProfile}
        isEditing={true}
        setIsEditing={vi.fn()}
        onProfileUpdated={vi.fn()}
      />,
    );

    await user.clear(screen.getByLabelText(/name/i));
    expect(screen.getByText("Name cannot be empty.")).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/email/i));
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    expect(
      screen.getByText("Please provide a valid email address."),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/github/i));
    await user.type(screen.getByLabelText(/github/i), "https://example.com/me");
    expect(
      screen.getByText("Please provide a GitHub profile URL."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/add expertise/i), "R");
    expect(
      screen.getByText("Expertise must be at least 2 characters."),
    ).toBeInTheDocument();
  });
});
