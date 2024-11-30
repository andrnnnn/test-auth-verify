import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../css/style.css';

function Register() {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string().required('Nama wajib diisi'),
    email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
    password: Yup.string().min(6, 'Password minimal 6 karakter').required('Password wajib diisi')
  });

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      setSubmitting(true);
      await axios.post('http://localhost:5000/api/register', values);
      localStorage.setItem('pendingVerificationEmail', values.email);
      navigate('/verifycode');
    } catch (error) {
      if (error.response?.data?.error?.includes('Duplicate entry')) {
        setStatus({ 
          error: 'Email ini sudah terdaftar. Silakan gunakan email lain atau login jika ini email Anda.' 
        });
      } else {
        setStatus({ error: error.response?.data?.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <Formik
        initialValues={{ name: '', email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, status, isSubmitting }) => (
          <Form>
            <div className="form-group">
              <Field name="name" placeholder="Nama" />
              {errors.name && touched.name && 
                <div className="error-message">{errors.name}</div>}
            </div>
            <div className="form-group">
              <Field name="email" type="email" placeholder="Email" />
              {errors.email && touched.email && 
                <div className="error-message">{errors.email}</div>}
            </div>
            <div className="form-group">
              <Field name="password" type="password" placeholder="Password" />
              {errors.password && touched.password && 
                <div className="error-message">{errors.password}</div>}
            </div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Mendaftar...</span>
                </div>
              ) : (
                'Register'
              )}
            </button>
            {status && status.success && 
              <div className="success-message">{status.success}</div>}
            {status && status.error && 
              <div className="error-message">{status.error}</div>}
            <div className="auth-link">
              Sudah punya akun? <Link to="/login">Login</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Register; 