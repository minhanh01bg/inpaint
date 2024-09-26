import { useState, useEffect } from 'react';
import logo from '../assets/img/icons8-fancy-voxel-48.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';
import Title from '../templates/Title'
import { setToken } from '../services/authService';
import config from '../configs';
import { useNotification } from '../contexts/NotificationContext';

import { useDispatch, useSelector } from 'react-redux';
import { setActive, filterAdmin, togglePin, toggleLogin } from '../redux/slices/navigationSlice';
import { persistor } from '../redux/store';
function Login() {
  const [formData, setFormData] = useState({
    username: localStorage.getItem('username') || '',
    password: localStorage.getItem('password') || ''
  });
  const { showErrorNotification, showSuccessNotification } = useNotification();

  const [rememberMe, setRememberMe] = useState(false);
  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  // When user unchecks "Remember me"

  useEffect(() => {
    if (document.getElementById('remember').checked) {
      setRememberMe(true);
    } else {
      setRememberMe(false);
      localStorage.removeItem('username');
      localStorage.removeItem('password');
      setFormData({
        username: '',
        password: ''
      });
    }
  }, []);
  // navigate
  const navigation = useSelector((state) => state.navigation);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    persistor.purge();
    console.log('Form submitted', formData);
    if (rememberMe) {
      localStorage.setItem('username', formData.username);
      localStorage.setItem('password', formData.password);
    } else {
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }
    const url = `${config.apiUrl}/login?permit_key=${config.permit_key}`;
    const option = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': `multipart/form-data`,
      },
    };
    axios.post(url, formData, option)
      .then(res => {
        console.log('res', res)
        setToken(res.data.access_token);
        showSuccessNotification('Login success');
        window.location.href = '/background_removal'
        dispatch(setActive('Background removal'));
        dispatch(toggleLogin());
        
      })
      .catch(err => {
        localStorage.removeItem('token');
        if (err.response.data.detail[0].msg !== undefined){
          showErrorNotification(err.response.data.detail[0].msg)
        } else if (err.response.data.detail !== undefined){
          showErrorNotification(err.response.data.detail)
        } else {
          showErrorNotification(err.message)
        }
      })
  }
  return (
    <>
      <Title title='Login' />
      <div className='h-screen items-center grid grid-rows-3 gap-2 bg-base-100 lg:grid-rows-1 lg:grid-cols-2 lg:gap-0'>
        <div className='max-w-lg lg:w-full mx-auto lg:p-5'>
          <div className='logo flex items-center lg:mb-5'>
            <img src={logo} alt='logo' />
            <span className='ml-3 font-semibold text-2xl'>PHYSCODE demo</span>
          </div>
          <div className='hidden lg:block'>
            <div className='flex mb-5'>
              <div className='mr-3'>
                <FontAwesomeIcon icon={faCircleCheck} className='text-primary' />
              </div>
              <div className=''>
                <div className='mb-2'>
                  <span className='font-semibold leading-none tracking-tight text-2xl'>Get started quickly</span>
                </div>
                <div>
                  <span className='font-semibold text-sm line-clamp-3 opacity-50'>Integrate with developer-friendly APIs or choose low-code.</span>
                </div>
              </div>
            </div>
            <div className='flex mb-5'>
              <div className='mr-3'>
                <FontAwesomeIcon icon={faCircleCheck} className='text-primary' />
              </div>
              <div className=''>
                <div className='mb-2'>
                  <span className='font-semibold leading-none tracking-tight text-2xl'>Support any business model</span>
                </div>
                <div>
                  <span className='font-semibold text-sm line-clamp-3 opacity-50'>Host code that you don't want to share with the world in private.</span>
                </div>
              </div>
            </div>
            <div className='flex mb-5'>
              <div className='mr-3'>
                <FontAwesomeIcon icon={faCircleCheck} className='text-primary' />
              </div>
              <div className=''>
                <div className='mb-2'>
                  <span className='font-semibold leading-none tracking-tight text-2xl'>Join millions of businesses</span>
                </div>
                <div>
                  <span className='font-semibold text-sm line-clamp-3 opacity-50'>PHYSCODE is trusted by ambitious startups and enterprises of every size.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form className="w-10/12 lg:w-10/12 max-w-lg mx-auto border shadow-md rounded-box p-7" onSubmit={handleSubmit} onChange={handleChange}>
          <div className='mb-5'>
            <span className='font-bold text-1xl leading-tight tracking-tight sm:text-2xl'>Welcom back</span>
          </div>
          <div className="mb-5">
            <label className="input input-bordered flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                  d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
              </svg>
              <input type="text" id='username' className="grow" placeholder="Username" value={formData.username} onChange={handleChange} />
            </label>
          </div>
          <div className="mb-5">
            <label className="input input-bordered flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd" />
              </svg>
              <input type="password" id="password" className="grow" placeholder='Password' value={formData.password} onChange={handleChange} />
            </label>
          </div>
          <div className="mb-5 form-control">
            <label className="flex items-center h-5 cursor-pointer">
              <input id="remember" type="checkbox" className="checkbox checkbox-primary checkbox-sm" onChange={handleRememberChange} />
              <span className="ms-2 label-text">Remember me</span>
            </label>
          </div>
          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>

      </div>
    </>
  )
}

export default Login;