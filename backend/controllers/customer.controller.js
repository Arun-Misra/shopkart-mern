const Customer = require("../models/customer.model");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000
};

const register = async(req,res)=>{
  try{
    const{ fullName, email, password, phone } = req.body;
    if(!fullName|| !email|| !password||!phone){
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    if(password.length < 8){
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters"
      });
    }
    const existingCustomer = await Customer.findOne({ email });

    if(existingCustomer){
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer:{
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch(error){
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const login = async(req, res)=>{
  try{
    const{ email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if(!customer){
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if(!isMatch){
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = generateToken(customer._id);

    res.cookie("token", token, authCookieOptions);

    res.json({
      success: true,
      message: "Login successful"
    });

  } catch(error){
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getMe = async(req, res)=>{
  try{
    const customer = await Customer.findById(req.user).select("-password");

    if(!customer){
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    res.json(customer);

  } catch(error){
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const logout = async(req, res)=>{
  const { maxAge, ...clearCookieOptions } = authCookieOptions;
  res.clearCookie("token", clearCookieOptions);

  res.json({
    success: true,
    message: "Logged out successfully"
  });
};


module.exports ={
  register,
  login,
  getMe,
  logout
};
