export function AppSkeleton() {
  return (
    <div className="app skeleton-app">
      <div className="app-content">
        <div className="skeleton-header">
          <span className="skeleton-line w-40"></span>
          <span className="skeleton-line w-28"></span>
        </div>
        <div className="skeleton-card tall"></div>
        <TaskListSkeleton count={4} />
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-task" key={i}>
          <span className="skeleton-circle"></span>
          <div className="skeleton-grow">
            <span className="skeleton-line w-70"></span>
            <span className="skeleton-line w-45 small"></span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton-card stats"></div>
      <div className="stats-grid">
        <div className="skeleton-card mini"></div>
        <div className="skeleton-card mini"></div>
      </div>
      <div className="skeleton-card list"></div>
      <div className="skeleton-card list"></div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton-calendar"></div>
      <div className="skeleton-card list"></div>
    </div>
  );
}
