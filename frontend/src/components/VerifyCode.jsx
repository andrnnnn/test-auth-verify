import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/style.css';
import VerificationInput from './VerificationInput';

function VerifyCode() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ message: '', error: false });
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (!pendingEmail) {
      navigate('/register');
    } else {
      setEmail(pendingEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/verify-code', { 
        email, 
        code
      });
      setStatus({
        message: 'Email berhasil diverifikasi! Anda akan diarahkan ke halaman login...',
        error: false
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus({
        message: error.response?.data?.error || 'Terjadi kesalahan',
        error: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Verifikasi Email</h2>
      <p>Masukkan kode verifikasi yang telah dikirim ke email: {email}</p>
      <form onSubmit={handleSubmit}>
        <VerificationInput 
          onComplete={(verificationCode) => setCode(verificationCode)}
          isDisabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Memverifikasi...</span>
            </div>
          ) : (
            'Verifikasi'
          )}
        </button>
        {status.message && (
          <div className={status.error ? 'error-message' : 'success-message'}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}

export default VerifyCode;