import React, { useState, useEffect } from 'react';
import { FaSearch, FaLeaf } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
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
    <header className='bg-green-600 shadow-lg sticky top-0 z-50'>
      <div className='flex justify-between items-center gap-4 max-w-6xl mx-auto px-4 sm:px-6 py-4'>

        {/* Logo + Brand */}
        <Link to='/' className='flex items-center gap-2 shrink-0'>
          <img
            src='images/logo.png'
            alt='Nestora logo'
            className='h-11 w-11 object-contain'
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <h1 className='font-bold text-2xl sm:text-3xl flex items-baseline gap-1 tracking-tight'>
            <span className='text-white'>Nestora</span>
          </h1>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className='flex items-center bg-green-800/60 border border-green-700 hover:border-emerald-400 focus-within:border-emerald-300 rounded-full px-5 py-2.5 transition-colors duration-200 flex-1 max-w-md'
        >
          <input
            type='text'
            placeholder='Search...'
            className='bg-transparent focus:outline-none text-green-50 placeholder-green-300 text-base w-full'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type='submit'
            aria-label='Search'
            className='ml-3 text-emerald-300 hover:text-emerald-200 transition-colors text-lg'
          >
            <FaSearch />
          </button>
        </form>

        {/* Nav */}
        <ul className='flex gap-6 items-center shrink-0'>
          {currentUser?.isAdmin && (
            <Link
              to='/admin'
              className='hidden sm:inline-block text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-full transition-colors'
            >
              Admin
            </Link>
          )}

          <Link to='/'>
            <li className='hidden sm:inline text-green-100 hover:text-white text-base font-medium transition-colors'>
              Home
            </li>
          </Link>

          <Link to='/About'>
            <li className='hidden sm:inline text-green-100 hover:text-white text-base font-medium transition-colors'>
              About
            </li>
          </Link>

          <Link to='/profile'>
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt='Profile'
                className='rounded-full h-10 w-10 object-cover ring-2 ring-emerald-200 hover:ring-emerald-300 transition-all'
                referrerPolicy='no-referrer'
              />
            ) : (
              <li className='text-green-200 hover:text-white text-base font-medium transition-colors'>
                Sign In
              </li>
            )}
          </Link>
        </ul>

      </div>
    </header>
  );
}