const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router()
const {
  register,
  login,
  getMe,
  logout
} = require("../controllers/customer.controller")

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)
router.post("/logout", authMiddleware, logout)
module.exports = router;