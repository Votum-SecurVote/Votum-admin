import axios from 'axios';

const API = 'http://localhost:5000/api';

export const loginAdmin = async (username, password) => {
  const res = await axios.post(`${API}/auth/login`, {
    username,
    password,
  });

  localStorage.setItem(
    'auth',
    JSON.stringify({
      token: res.data.token,
      role: res.data.role,
    })
  );

  return res.data;
};
