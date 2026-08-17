export default function SaveBanner({
  saved,
  error,
}: {
  saved?: boolean;
  error?: string;
}) {
  if (error) {
    return (
      <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <strong>Save failed:</strong> {error}
      </div>
    );
  }
  if (saved) {
    return (
      <div className="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        Saved. Your change is live immediately.
      </div>
    );
  }
  return null;
}
