interface SubtaskCountBadgeProps {
  completed: number;
  total: number;
}

function SubtaskCountBadge({ completed, total }: SubtaskCountBadgeProps) {
  if (total === 0) return null;
  return (
    <span
      className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
      title={`${String(completed)} completed out of ${String(total)} subtasks`}
      aria-label="Subtask count"
    >
      {completed}/{total}
    </span>
  );
}

export default SubtaskCountBadge;
