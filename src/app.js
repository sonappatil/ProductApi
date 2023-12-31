require('dotenv').config();
const express = require("express");
require("./db/conn");
const Product = require("./model/productModel");
const Register = require("./model/registerModel");
const ProductRouter = require("./router/router");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require('cors');
const validateToken = require('./middleware/validatetoken');
const asyncHandler =  require("express-async-handler");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(ProductRouter);

app.get("/",async(req,res)=>{
    res.send("Welcome to the server page");
})


//for  register
app.post('/register', asyncHandler(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !password || !email) {
            res.status(400);
            throw new Error("all the fields are required");
        }
        const userAvailable = await Register.findOne({ email });
        /// console.log(userAvailable);
        if (userAvailable) {
            res.status(400);
            throw new Error("user already register");

        }

        // hashed password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const user = await Register.create({
            username,
            email,
            password: hashedPassword,
        });

        console.log(`user created ${user}`);
        if (user) {
            res.status(201).json({ _id: user.id, email: user.email })
        } else {
            res.status(400);
            throw new Error("USer data not valid")
        }
        res.send({ message: "Register the user" });
    } catch (error) {
        res.send(error);
    }
}))

app.post("/login", asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400);
            throw new Error("all the fileds are mendatory");
        }
        const user = await Register.findOne({ email });
        //compare password with hash password
        if (user && (await bcrypt.compare(password, user.password))) {
            const accessToken = jwt.sign({
                user: {
                    username: user.username,
                    email: user.email,
                    id: user.id
                },
            }, process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );
            res.status(200).json({ accessToken });
        } else {
            res.status(401);
            throw new Error("password not valid")
        }

    } catch (error) {
        res.send({ message: "login User" })
    }
}));

app.get("/current", validateToken, asyncHandler(async(req, res)=>{
    res.json(req.user);
}))

app.listen(port, () => {
    console.log(`listen  to the port ${port}`);
})