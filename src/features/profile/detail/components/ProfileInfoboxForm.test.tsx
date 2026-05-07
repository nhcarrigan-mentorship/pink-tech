import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { mockProfile } from "../../../../test/fixtures/mockProfile";
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

  it("adds a new expertise when pressing Enter", () => {
    renderForm();

    const expertiseInput = screen.getByLabelText(/new expertise/i);

    fireEvent.change(expertiseInput, {
      target: { value: "Testing" },
    });

    fireEvent.keyDown(expertiseInput, {
      key: "Enter",
      code: "Enter",
    });

    expect(screen.getByText("Testing")).toBeInTheDocument();
    expect(expertiseInput).toHaveValue("");
  });

  it("removes an expertise", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /remove react/i }));

    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  it("cancels editing", () => {
    const { setIsEditing } = renderForm();

    const cancelButton = screen.getByRole("button", { name: "Cancel" });

    fireEvent.click(cancelButton);

    // expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(setIsEditing).toHaveBeenCalledWith(false);
  });

  it("skips saving when nothing changed", () => {
    const { setIsEditing, onProfileUpdated } = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(setIsEditing).toHaveBeenCalledWith(false);
    expect(onProfileUpdated).not.toHaveBeenCalled();
  });
});
