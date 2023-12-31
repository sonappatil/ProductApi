const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    user_id:{
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref : "Register"
    },
    productID :{
        type:String,
        required: true,
        unique: true
    },
    name :{
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    featured:{
        type: Boolean,
        default: false
    },
    rating :{
        type: Number,
        min: 0,
        max: 10
    },
    createdAt:{
        type: Date,
        required:true,
        default:Date.now
    },
    company :{
        type: String,
        required: true
    }

})

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;