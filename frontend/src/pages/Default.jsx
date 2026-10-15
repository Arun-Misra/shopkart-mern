import { useNavigate } from "react-router-dom";

function Default(){
    const navigate = useNavigate();
    return(
        <main className="landing-page">
            <p className="eyebrow">SHOPKART</p>
            <h1>Welcome to ShopKart</h1>
            <div className="landing-buttons">
                <button className=""onClick={() => navigate("/login")}>
                    Login
                </button>
                <button onClick={() => navigate("/register")}>
                    Register
                </button>
            </div>
        </main>
    );
}
export default Default;
