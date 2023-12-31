const express  = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const Product = require("../model/productModel");
const validateToken = require("../middleware/validatetoken");
const Register = require("../model/registerModel");

router.use(validateToken);

router.post('/products', asyncHandler(async (req, res) => {
  try {
    const {productID, name, price, featured, rating, company} = req.body;
    const savedProduct = await Product.create({
      productID, name, price, featured, rating, company, user_id: req.user.id,
    })
    // console.log(savedProduct)
    res.status(201).send(savedProduct);
  } catch (error) {
    res.status(400).send({ message: error.message });
    res.send(error)
  }
}));
  
  // Get all products
  router.get('/products',asyncHandler(async (req, res) => {
    try {
      const products = await Product.find({user_id: req.user.id});
      //console.log(products);
      res.status(200).send(products);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  })
  );
  // Update a product
  router.put('/products/:id',validateToken, asyncHandler(async (req, res) => {
    try {
      const updatedProduct = await Product.findById(req.params.id);
      if(updatedProduct.user_id.toString() != req.user.id){
        res.status(403);
        throw new Error("User don't have permission to update");
      }
      const updateProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true}
      );
      res.status(200).send(updateProduct);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }));
  
  // Delete a product
  router.delete('/products/:id',asyncHandler(async (req, res) => {
    try {
     const deleteProduct =  await Product.findById(req.params.id);
     if (deleteProduct.user_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error("User don't have permission to delete the product");
     }
     await Product.deleteOne({_id: req.params.id});
      res.status(200).send({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }));
  
  // Fetch featured products
router.get('/products/featured', asyncHandler(async (req, res) => {
  try {
      const user = await Product.findOne({user_id:req.user.id});
      if (user.user_id.toString() !== req.user.id) {
          res.status(403);
          throw new Error("User don't have permission to access featured products");
      }
      const featuredProducts = await Product.find({ user_id: req.user.id, featured: true });
      res.status(200).send(featuredProducts);
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
}));

 
  
  // Fetch products with price less than a certain value
  router.get('/products/price/:value', asyncHandler(async (req, res) => {
    try {
        const { value } = req.params;
        const user = await Product.findOne({user_id:req.user.id});
        if (user.user_id.toString() !== req.user.id) {
            res.status(403);
            throw new Error("User don't have permission to access featured products");
        }
        const products = await Product.find({user_id: req.user.id, price: { $lt: value } });
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}));

  // Fetch products with rating higher than a certain value
  router.get('/products/rating/:value', asyncHandler(async (req, res) => {
    try {
      const { value } = req.params;
      const user = await Product.findOne({ user_id: req.user.id });
      if (user.user_id.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User don't have permission to access featured products");
      }
      const products = await Product.find({ user_id: req.user.id, rating: { $gt: value } });
      res.send(products);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }));
  
  
module.exports = router;