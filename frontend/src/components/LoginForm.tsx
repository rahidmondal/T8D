import { FormEvent, useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('Note: Login functionality is not yet implemented.');
  };

  return (
    <section className="p-6">
      <h3 className="text-lg font-medium mb-4">Login</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Log in to your T8D account to enable sync.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
            }}
            required
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
            }}
            required
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full px-4 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </section>
  );
}

export default LoginForm;
