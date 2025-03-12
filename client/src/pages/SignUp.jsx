import {Link} from 'react-router-dom'

export default function SignUp() {
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold my-10 text-center'>Sign Up</h1>
      <form className='flex flex-col gap-4'>
        <input type="text" placeholder='JohnDoe10' className='border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm w-50 transition-all ' id='username' />
        <input type="email" placeholder='JohnDoe10@gmail.com' className='border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm w-50 transition-all ' id='email' />
        <input type="password" placeholder='*****' className='border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm w-50 transition-all ' id='password' />
        <button className='bg-green-400 text-white p-3 uppercase rounded-md hover:opacity-80 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-700'>Sign Up</button>
        <button></button>
      </form>
      <div className='flex gap-2 mt-1'>
        <p>Have an account? </p>
        <Link to={"/sign-in"}>
        <span className='text-blue-700'>Sign In</span>
        </Link>
      </div>
    </div>
  )
}
