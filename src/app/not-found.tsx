export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-light mb-4">404</h1>
        <p className="text-gray-400 mb-8">Page not found</p>
        <a 
          href="/" 
          className="text-white hover:text-gray-300 transition-colors underline"
        >
          Go back home
        </a>
      </div>
    </div>
  );
} 