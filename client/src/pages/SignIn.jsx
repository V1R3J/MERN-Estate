import { useState } from 'react'
import {data, Link, useNavigate} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.id] : e.target.value,
      });
  };
  const handleSubmit = async (e) =>{
    e.preventDefault();
    try {
      dispatchEvent(signInStart());
      const res = await fetch('/api/auth/signin', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        console.log(data);
        if(data.success === false){
          dispatchEvent(signInFailure(data.message));
          return; 
        }
        dispatchEvent(signInSuccess(data));
        navigate('/');

    } catch (error) {
      dispatchEvent(signInFailure(error.message));
    }
 
  };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold my-10 text-center fa '>Sign In</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="email" placeholder='JohnDoe10@gmail.com' className='border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm w-50 transition-all ' id='email'onChange={handleChange} />
        <input type="password" placeholder='*****' className='border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm w-50 transition-all ' id='password' onChange={handleChange}/>
        <button disabled={loading} className='bg-green-400 text-white p-3 uppercase rounded-md hover:opacity-85 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-700'>{loading? 'Loading...': 'Sign In'}</button>
        <button></button>
      </form>
      <div className='flex gap-2 mt-1'>
        <p>Dont have an account? </p>
        <Link to={"/sign-up"}>
        <span className='text-blue-700'>Sign Up</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  );
}

