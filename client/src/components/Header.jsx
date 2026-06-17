import React, { useState, useEffect } from 'react';
import { FaSearch, FaLeaf } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Fixed: useLocation hook instead of window.location
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  return (
    <header className='bg-green-600 shadow-lg'>
      <div className='flex justify-between items-center max-w-6xl mx-auto px-4 py-3'>

        {/* Logo + Brand */}
        <Link to='/' className='flex items-center gap-2'>
          <img
            src='images/logo.png'
            alt='Nestora logo'
            className='h-10 w-10 object-contain'
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <h1 className='font-bold text-sm sm:text-2xl flex items-baseline gap-1'>
            <span className='text-white'>Nestora</span>
          </h1>
        </Link>

        
        <form
          onSubmit={handleSubmit}
          className='flex items-center bg-green-800 border border-green-700 hover:border-emerald-500 focus-within:border-emerald-400 rounded-full px-4 py-2 transition-colors duration-200'
        >
          <input
            type='text'
            placeholder='Search...'
            className='bg-transparent focus:outline-none text-green-100 placeholder-green-400 text-sm w-24 sm:w-64'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
         
          <button type='submit' aria-label='Search' className='ml-2 text-emerald-400 hover:text-emerald-300 transition-colors'>
            <FaSearch />
          </button>
        </form>

        <ul className='flex gap-5 items-center'>
          <Link to='/'>
            <li className='hidden sm:inline text-green-100 hover:text-white text-sm font-medium transition-colors'>
              Home
            </li>
          </Link>
          <Link to='/About'>
            <li className='hidden sm:inline text-green-100 hover:text-white text-sm font-medium transition-colors'>
              About
            </li>
          </Link>
          <Link to='/profile'>
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt='Profile'
                className='rounded-full h-9 w-9 object-cover ring-2 ring-emerald-200 hover:ring-emerald-300 transition-all'
                referrerPolicy='no-referrer'
              />
            ) : (
              <li className='text-green-300 hover:text-white text-sm font-medium transition-colors'>
                Sign In
              </li>
            )}
          </Link>
        </ul>

      </div>
    </header>
  );
}