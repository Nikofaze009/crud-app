// API Configuration
// Change this to your Render backend URL after deployment
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://crud-app-btz1.onrender.com';

export default API_BASE_URL;
