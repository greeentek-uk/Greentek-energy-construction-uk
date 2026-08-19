export default function SaveBanner({
  saved,
  error,
}: {
  saved?: boolean;
  error?: string;
}) {
  if (error) {
    return (
      <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
        <strong>Save failed:</strong> {error}
      </div>
    );
  }
  if (saved) {
    return (
      <div className="mb-6 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
        Saved. Your change is live immediately.
      </div>
    );
  }
  return null;
}
