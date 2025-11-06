import { FormEvent, useState } from 'react';

import { useAuth } from '@src/hooks/useAuth';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await register(email, password, name || undefined);
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
      <h3 className="text-lg font-medium mb-4">Register</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Create a new T8D account to enable sync.</p>
      <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Name (Optional)
          </label>
          <input
            id="register-name"
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
          <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
            }}
            required
            autoComplete="email"
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
          />
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
            }}
            required
            minLength={12}
            autoComplete="new-password"
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Must be at least 12 characters long.</p>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full px-4 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </section>
  );
}

export default RegisterForm;
