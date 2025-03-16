import { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.id] : e.target.value,
      });
  };
  const handleSubmit = async (e) =>{
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if(data.success === false){
          setError(data.message);
          setLoading(false);
          return; 
        }
        setLoading(false);
        setError(null);
        navigate('/sign-in');

    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
 
  };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold my-10 text-center fa '>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="text" placeholder='JohnDoe10' className='border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm w-50 transition-all ' id='username' onChange={handleChange}/>
        <input type="email" placeholder='JohnDoe10@gmail.com' className='border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm w-50 transition-all ' id='email'onChange={handleChange} />
        <input type="password" placeholder='*****' className='border p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm w-50 transition-all ' id='password' onChange={handleChange}/>
        <button disabled={loading} className='bg-green-400 text-white p-3 uppercase rounded-md hover:opacity-80 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-700'>{loading? 'Loading...': 'Sign up'}</button>
        <button></button>
      </form>
      <div className='flex gap-2 mt-1'>
        <p>Have an account? </p>
        <Link to={"/sign-in"}>
        <span className='text-blue-700'>Sign In</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  );
}
