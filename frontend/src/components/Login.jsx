import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../css/style.css';

function Login() {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
    password: Yup.string().required('Password wajib diisi')
  });

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (error) {
      setStatus({ error: error.response.data.error });
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, status, isSubmitting }) => (
          <Form>
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
                  <span>Masuk...</span>
                </div>
              ) : (
                'Login'
              )}
            </button>
            {status && status.error && 
              <div className="error-message">{status.error}</div>}
            <div className="auth-link">
              <Link to="/forgot-password">Lupa Password?</Link>
            </div>
            <div className="auth-link">
              Belum punya akun? <Link to="/register">Register</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Login;