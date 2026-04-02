import AccountSettings from "../components/AccountSettings";
import DeleteAccount from "../components/DeleteAccount";

export default function Settings() {
  return (
    <div className="py-8 md:py-16">
      <AccountSettings />
      <DeleteAccount />
    </div>
  );
}
