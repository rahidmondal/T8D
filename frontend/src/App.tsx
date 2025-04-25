import './App.css';
import logo from './assets/t8d512.jpg';

function App() {
  return (
    <>
      <div className="flex flex-col justify-center items-center bg-blue-400 text-blue-200">
        <img src={logo} alt="T8D logo" className="h-20" />
        <h1>T8D</h1>
        <p>A Simple Productivity Application</p>
        <p>v0.0.0</p>
      </div>
    </>
  );
}

export default App;
