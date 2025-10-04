interface RootTaskCountProps {
  completed: number;
  total: number;
}
function RootTaskCount({ completed, total }: RootTaskCountProps) {
  if (total === 0) return null;

  return (
    <span
      tabIndex={0}
      role="status"
      aria-label={`Root tasks: ${String(completed)} of ${String(total)} completed`}
      title={`${String(completed)} completed out of ${String(total)} root tasks`}
      className="ml-3 inline-flex items-center px-3 py-1 text-sm rounded-full
                 bg-gradient-to-r from-sky-50 to-white dark:from-sky-900/40 dark:to-slate-900
                 text-sky-700 dark:text-sky-200 border border-sky-200 dark:border-sky-700
                 shadow-md dark:shadow-lg/10 ring-0 focus:outline-none focus:ring-2 focus:ring-sky-400
                 focus:bg-sky-100 dark:focus:bg-sky-800 transition-transform transform hover:scale-105"
    >
      <span className="font-semibold tabular-nums leading-tight">
        {completed}/{total}
      </span>
    </span>
  );
}

export default RootTaskCount;
