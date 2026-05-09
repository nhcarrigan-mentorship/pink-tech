import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { mockProfile } from "../../../../test/fixtures/mockProfile";

vi.mock("../../../../shared/config/supabaseClient", () => ({
  getSupabase: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }),
}));

import ProfileInfoboxForm from "./ProfileInfoboxForm";

const renderForm = (
  props: Partial<React.ComponentProps<typeof ProfileInfoboxForm>> = {},
) => {
  const setIsEditing = vi.fn();
  const onProfileUpdated = vi.fn();

  render(
    <ProfileInfoboxForm
      profile={mockProfile}
      isEditing={true}
      setIsEditing={setIsEditing}
      onProfileUpdated={onProfileUpdated}
      {...props}
    />,
  );

  return { setIsEditing, onProfileUpdated };
};

describe("ProfileInfoboxForm", () => {
  it("renders profile data in edit mode", () => {
    renderForm();
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

    renderForm();

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

    await user.type(screen.getByLabelText(/new expertise/i), "R");
    expect(
      screen.getByText("Expertise must be at least 2 characters."),
    ).toBeInTheDocument();
  });

  it("adds a new expertise", async () => {
    const user = userEvent.setup();

    renderForm();

    const expertiseInput = screen.getByRole("textbox", {
      name: /new expertise/i,
    });

    const newExpertise = "SQL";

    await user.type(expertiseInput, newExpertise);

    const addExpertise = screen.getByRole("button", { name: /add expertise/i });
    await user.click(addExpertise);

    // Assert added expertise is in the form and expertise input is cleared
    expect(screen.getByText(newExpertise)).toBeInTheDocument();
    expect(expertiseInput).toHaveValue("");
  });

  it("adds a new expertise when pressing Enter", async () => {
    const user = userEvent.setup();

    renderForm();

    const expertiseInput = screen.getByLabelText(/new expertise/i);

    const newExpertise = "SQL";

    await user.type(expertiseInput, newExpertise);

    await user.keyboard("{Enter}");

    expect(screen.getByText(newExpertise)).toBeInTheDocument();
    expect(expertiseInput).toHaveValue("");
  });

  it("removes an expertise", async () => {
    const user = userEvent.setup();

    renderForm();

    const expertise = "TypeScript";
    const expertiseList = screen.getByLabelText(/current expertise/i);

    const removeExpertise = screen.getByRole("button", {
      name: `Remove ${expertise}`,
    });

    await user.click(removeExpertise);

    // Assert expertise not to be in the list
    expect(
      within(expertiseList).queryByText(expertise),
    ).not.toBeInTheDocument();
  });

  it("cancels editing", async () => {
    const { setIsEditing } = renderForm();

    const cancelButton = screen.getByRole("button", { name: "Cancel" });

    fireEvent.click(cancelButton);

    expect(setIsEditing).toHaveBeenCalledWith(false);
  });

  it("skips saving when nothing changed", async () => {
    const user = userEvent.setup();

    const { setIsEditing, onProfileUpdated } = renderForm();

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(setIsEditing).toHaveBeenCalledWith(false);
    expect(onProfileUpdated).not.toHaveBeenCalled();
  });

  it("saves changed profile data", async () => {
    const user = userEvent.setup();

    const { setIsEditing, onProfileUpdated } = renderForm();

    const newRole = "Backend Engineer";
    const roleInput = screen.getByLabelText(/role/i);
    const saveButton = screen.getByRole("button", { name: /save/i });

    await user.clear(roleInput);
    await user.type(roleInput, newRole);
    await user.click(saveButton);

    await waitFor(() => {
      expect(setIsEditing).toHaveBeenCalledWith(false);
      expect(onProfileUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ role: newRole }),
      );
    });
  });
});
