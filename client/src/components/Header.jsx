import React from 'react'
import {FaSearch} from 'react-icons/fa';
import {Link} from 'react-router-dom'

export default function Header() {
  return (
    <header className='bg-green-200 shadow-md '>
        <div className='flex justify-between item-center max-w-6xl mx-auto p-4'>
            <Link to='/'>
            <h1 className='font-extrabold text-sm sm:text-2xl flex flex-wrap'>
                <span className='text-emerald-600'>Viraj</span>
                <span className='text-emerald-400'>RealEstate</span>
            </h1>
            </Link>
            <form className='bg-green-100 p-3 rounded-full flex items-center'>
                <input type="text" placeholder='Search...' className='bg-transparent focus:outline-none w-24 sm:w-64'/>
                <FaSearch className='text-emerald-500' />
            </form>
            <ul className='flex gap-5 items-center'>
                <Link to='/'>
                <li className='hidden sm:inline text-emerald-700 hover:underline'>Home</li>
                </Link>
                <Link to='/About'>
                <li className='hidden sm:inline text-emerald-700 hover:underline'>About</li>
                </Link>
                <Link to='Sign-In'>
                <li className='text-emerald-700 hover:underline'>Sign In</li>
                </Link>
            </ul>
        </div>
    </header>
  );
}
