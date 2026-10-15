import {BrowserRouter, Routes,Route} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Default from "./pages/Default"
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

function App() {
    return (
        <BrowserRouter>
        <CartProvider>
        <Routes>
        <Route path="/" element={<Default/>}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/products/:id" element={<ProductDetails/>}/>
        <Route path="/wishlist" element={<Wishlist/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/checkout" element={<Checkout/>}/>
        <Route path="/order-success/:id" element={<OrderSuccess/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/orders/:id" element={<OrderDetails/>}/>
        </Routes>
        </CartProvider>
        </BrowserRouter>
    );
}

export default App;