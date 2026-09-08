import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

const LoginCallback = () => {
  const [status, setStatus] = useState('Authenticating with GitHub...');
  const navigate = useNavigate();
  const location = useLocation();

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    // 1. Extract the ?code= parameter that GitHub appended to the URL
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    if (!code) {
      setStatus('Error: No authorization code found from GitHub.');
      return;
    }

    // 2. Send the code to our Express backend
    const fetchToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/github/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (response.ok) {
          // 3. Save the JWT token and User data into the browser's local storage
          localStorage.setItem('codecanvas_token', data.token);
          localStorage.setItem('codecanvas_user', JSON.stringify(data.user));
          
          setStatus('Authentication successful! Loading workspace...');
          
          // 4. Redirect the user to the actual application dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setStatus(`Authentication Failed: ${data.error}`);
        }
      } catch (error) {
        setStatus(`Server Error: Make sure your backend (port 5001) is running. ${error.message}`);
      }
    };

    fetchToken();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">
      <div className="bg-dark-800 p-8 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.15)] border border-dark-700 text-center max-w-md w-full">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-bold mb-2">Securing Connection</h2>
        <p className="text-gray-400 text-sm">{status}</p>
      </div>
    </div>
  );
};

export default LoginCallback;
