import AccountSettings from "../../components/profile/settings/AccountSettings";
import DeleteAccount from "../../components/profile/settings/DeleteAccount";

export default function Settings() {
  return (
    <div className="py-8 md:py-16">
      <AccountSettings />
      <DeleteAccount />
    </div>
  );
}
