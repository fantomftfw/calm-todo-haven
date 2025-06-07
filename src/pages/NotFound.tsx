
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-8xl mb-4">🤔</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! This page seems to have wandered off...</p>
        <Link 
          to="/" 
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
