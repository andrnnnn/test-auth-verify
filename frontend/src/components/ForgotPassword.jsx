import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import VerificationInput from './VerificationInput';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ message: '', error: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/forgot-password', { email });
      setStatus({
        message: 'Kode verifikasi telah dikirim ke email Anda',
        error: false
      });
      setStep(2);
    } catch (error) {
      setStatus({
        message: error.response?.data?.error || 'Terjadi kesalahan',
        error: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ message: 'Password tidak cocok', error: true });
      return;
    }
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/reset-password', {
        email,
        code,
        newPassword
      });
      setStatus({
        message: 'Password berhasil diubah! Anda akan diarahkan ke halaman login...',
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
      <h2>Lupa Password</h2>
      {step === 1 ? (
        <form onSubmit={handleSendCode}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Mengirim kode...</span>
              </div>
            ) : (
              'Kirim Kode Verifikasi'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <VerificationInput
            onComplete={(verificationCode) => setCode(verificationCode)}
            isDisabled={isLoading}
          />
          <div className="form-group">
            <input
              type="password"
              placeholder="Password baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Menyimpan...</span>
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}
      {status.message && (
        <div className={status.error ? 'error-message' : 'success-message'}>
          {status.message}
        </div>
      )}
      <div className="auth-link">
        <Link to="/login">Kembali ke Login</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;