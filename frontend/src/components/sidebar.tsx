import logo from '../assets/t8d512.jpg';

export const SideBar = function () {
  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="flex flex-col justify-center items-center bg-gradient-to-r from-purple-700 to-purple-500 text-white py-6">
        <img src={logo} alt="T8D logo" className="h-16 w-16 mb-2 rounded-lg shadow-md object-cover" />
        <h1 className="text-xl font-bold">T8D</h1>
        <p className="text-sm text-purple-100">Task Manager</p>
      </div>

      <div className="p-4 flex-1">
        <nav className="space-y-1">
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm rounded-md bg-purple-50 text-purple-700 font-medium"
          >
            <svg
              className="mr-3 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            My Tasks
          </a>
          <div
            className="flex items-center px-3 py-2 text-sm rounded-md text-gray-400 cursor-not-allowed opacity-60"
            title="Coming soon"
          >
            <svg
              className="mr-3 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </div>
        </nav>
      </div>

      <div className="flex justify-center p-3 text-xs text-gray-500 border-t bg-gray-50">
        <p>T8D v0.1.0</p>
      </div>
    </div>
  );
};
