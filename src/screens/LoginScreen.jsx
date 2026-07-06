import { useState } from "react";
import { CalendarDays, Eye, EyeOff } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";

export default function LoginScreen() {
  const { login, signup } = useTaskStore();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (isSignup) await signup(email, password);
      else await login(email, password);
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "Email already registered"
          : err.code === "auth/invalid-credential"
            ? "Invalid email or password"
            : err.code === "auth/weak-password"
              ? "Password is too weak"
              : "Something went wrong",
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>
          <CalendarDays size={28} /> Daily Flow
        </h1>
        <p>{isSignup ? "Create your account" : "Welcome back"}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap">
              <input
                className="form-input"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
          <div className="error-msg">{error}</div>
        </form>
        <div className="login-toggle">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
