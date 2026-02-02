interface ErrorStateProps {
  heading?: string;
  message?: string;
}

export default function ErrorState({
  heading = "Unable to Load Profiles",
  message = "An error occured. Please try again later.",
}: ErrorStateProps) {
  return (
    <div>
      <h2>{heading}</h2>
      <p>{message}</p>
    </div>
  );
}
