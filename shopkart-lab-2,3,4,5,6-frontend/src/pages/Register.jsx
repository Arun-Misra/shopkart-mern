import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register(){
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");
        if(!fullName || !email || !password || !phone){
            setError("All fields are required");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }   
        try{
        await api.post(
            "/customers/register",
                {
                    fullName,
                    email,
                    password,
                    phone
                }
            );
            navigate("/login");
        }
        catch(error){
            setError(error.response?.data?.message ||"Registration failed");
        }
        
    };

    const alreadyUser = ()=>{
        navigate("/login");
    }
        
    return(
        <div className="auth-page">
        <main className="auth-content">
        <p className="eyebrow">SHOPKART</p>
        <h1>Create your account</h1>
        <p className="auth-description">
            Create an account to start shopping on ShopKart.
        </p>
        {error && (<p className="form-error">{error}</p>)}
        <form onSubmit={handleSubmit}>
        <input 
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        />
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
        <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) =>
            setPhone(e.target.value)
        }
        />
        <button type="submit">Create Account</button>
        </form>
        <button type="login" className="switch-auth" onClick={alreadyUser}>Already an User? Login</button>
        </main>
        </div>
    )
}

export default Register;