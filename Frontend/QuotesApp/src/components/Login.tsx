import React, { useState, useContext } from "react";
import { QuoteContext, api_url } from "../QuotesContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>(""); 
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { state, dispatch } = useContext(QuoteContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${api_url}/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), 
      });

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const data = await response.json();
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { isUserLoggedIn: true, isUserAdmin: false, email: email, token: data.accessToken}
      });

      console.log("Login successful:", data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Simulace odhlášení
    dispatch({ type: "LOGOUT_SUCCESS" });
  };

  return (
    <div className="login-container">
      {state.isUserLoggedIn ? (
        <div>
          <p>Přihlášen jako: {state.userName}</p> {/* Zobrazení jména */}
          <button onClick={handleLogout}>Logout</button> {/* Logout tlačítko */}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label htmlFor="email">Email:</label> 
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
