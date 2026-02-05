export function UserProfile() {
  return (
    <div className="border-t border-border px-lg py-md">
      <div className="flex items-center gap-sm">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
          AS
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            Admin User
          </p>
          <p className="text-xs text-text-muted truncate">admin@salon.com</p>
        </div>
      </div>
    </div>
  );
}
