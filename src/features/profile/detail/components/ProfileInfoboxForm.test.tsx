import { render, screen } from "@testing-library/react";
import { mockProfile } from "../../../../test/fixtures/mockProfile";
import ProfileInfoboxForm from "./ProfileInfoboxForm";

describe("ProfileInfoboxForm", () => {
  it("renders the profile name", () => {
    render(
      <ProfileInfoboxForm
        profile={mockProfile}
        isEditing={true}
        setIsEditing={vi.fn()}
        onProfileUpdated={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
  });
});
