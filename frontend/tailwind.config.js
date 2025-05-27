module.exports = {
  darkMode: 'class', // This is crucial
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can extend your color palette here if needed,
      // for example, adding the 'sky' and 'slate' colors if they aren't default
      colors: {
        sky: { // Example, Tailwind includes sky by default
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... up to 900
        },
        slate: { // Example, Tailwind includes slate by default
          50: '#f8fafc',
          100: '#f1f5f9',
          // ... up to 900
        }
      }
    },
  },
  plugins: [],
}
