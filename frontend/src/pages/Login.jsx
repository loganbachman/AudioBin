import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styling/Auth.css';

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState('');
    const [quoteLoading, setQuoteLoading] = useState(true);

    // Fetch daily music quote from microservice
    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const response = await fetch('http://localhost:3000/quotes?quantity=1&category=music');
                const data = await response.json();

                if (data.success && data.quotes && data.quotes.length > 0) {
                    setQuote(data.quotes[0]);
                }
            } catch (err) {
                console.error('Failed to fetch quote:', err);
            } finally {
                setQuoteLoading(false);
            }
        };

        fetchQuote();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify({
                    userId: data.user_id,
                    username: data.username
                }));

                // Redirect to dashboard
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Log in to your AudioBin account</p>

                {quote && !quoteLoading && (
                    <div className="quote-container">
                        <p className="quote-text">"{quote}"</p>
                    </div>
                )}

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;