import { FormEvent, useState } from 'react';

import { useAuth } from '@src/hooks/useAuth';

interface EditUserFormProps {
  onDone: () => void;
}

function EditUserForm({ onDone }: EditUserFormProps) {
  const { user, editUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const newName = name.trim();
    const newPassword = password;

    if (!newName && !newPassword) {
      setError('You must provide a name or a new password');
      return;
    }
    if (newPassword && newPassword.length < 12) {
      setError('Password must be at least 12 characters long.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const updates: { name?: string; password?: string } = {};
    if (newName && newName !== (user?.name ?? '')) {
      updates.name = newName;
    }

    if (newPassword) {
      updates.password = newPassword;
    }

    if (Object.keys(updates).length === 0) {
      setSuccess('No changes were made.');
      setIsSubmitting(false);
      return;
    }

    try {
      await editUser(updates);
      setSuccess('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="p-6">
      <h3 className="text-lg font-medium mb-4">Edit Profile</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Update your name or set a new password.</p>
      <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
            }}
            autoComplete="name"
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
          />
        </div>
        <div>
          <label htmlFor="edit-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            New Password (Optional)
          </label>
          <input
            id="edit-password"
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
            }}
            minLength={12}
            autoComplete="new-password"
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Leave blank to keep your current password. Must be at least 12 characters.
          </p>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="w-full sm:w-auto px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditUserForm;
