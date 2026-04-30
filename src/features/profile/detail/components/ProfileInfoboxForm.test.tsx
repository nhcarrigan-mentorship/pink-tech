import { render, screen } from "@testing-library/react";
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
  });
});
