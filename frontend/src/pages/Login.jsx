/* eslint-disable no-unused-vars */
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
        await api.post(
            "/customers/login",
        {
                email,
                password
            }
        );
        refreshCart();
        navigate("/home");
        }
        catch (e){
            setError("Invalid Credentials");
        }
    };
    const toRegister = ()=>{
        navigate("/register");
    };
    return(
        <div className="auth-page">
        <main className="auth-content">
        <p className="eyebrow">SHOPKART</p>
        <h1>Welcome back</h1>
        <p className="auth-description">
            Sign in to continue shopping.
        </p>
          {error && (
          <p className="form-error">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
        <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
            setEmail(e.target.value)
        }
        />
        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
            setPassword(e.target.value)
        }
        />
        <button type="submit">Login</button>
        </form>
        <button type="register" className="switch-auth" onClick={toRegister}>New User? Register</button>
        </main>
        </div>
    );
}

export default Login;