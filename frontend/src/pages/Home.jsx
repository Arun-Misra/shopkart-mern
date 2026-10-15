/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home(){
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
    const getUser = async()=>{
        try{
            const response = await api.get("/customers/me");
            setUser(response.data);
        } catch (error) {
            navigate("/login");
        }
    };
    getUser();
    }, []);

    if (!user) {
    return <p>Loading...</p>;
    }
    return(
        <div>
        <Navbar/>
<button
    onClick={() => navigate("/products")}
    className="browse-products"
>
    Browse Products →
</button>
        <main className="home-page">
        <section className="home-content">
        <p className="eyebrow">SHOPKART</p>
        <h1>Welcome, {user.fullName}</h1>
        <p className="home-description">Your account details</p>
        <div className="user-details">
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone}</p>
        </div>
        </section>
        </main>
        </div>
    );
}

export default Home;