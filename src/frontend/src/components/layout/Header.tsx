import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/static/logo.png"
                alt="Kidoova" 
                className="h-8 sm:h-10 w-auto"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  // Try the GitHub URL as fallback
                  e.currentTarget.src = 'https://raw.githubusercontent.com/zerotype19/confident-kids-playbook/main/src/frontend/public/logo.png';
                }}
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 