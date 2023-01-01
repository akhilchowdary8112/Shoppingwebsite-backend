const express = require("express");
const { isAdmin } = require("../middleware/auth");
const cloudinary = require("../utilities/Cloudinary");
const { products } = require("../models/Product");
const router = express.Router();
router.post("/", isAdmin, async (req, res) => {
  const { name, brand, desc, price, image } = req.body;
  try {
    if (image) {
      const uploaderres = await cloudinary.uploader.upload(image, {
        upload_preset: "shoppingwebsite",
      });

      if (uploaderres) {
        const product = new products({
          name,
          brand,
          desc,
          price,
          image: uploaderres,
        });
        const SavedProduct = await product.save();
        res.status(200).send(SavedProduct);
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/", async (req, res) => {
  try {
    const product = await products.find();
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/find/:id", async (req, res) => {
  try {
    const product = await products.findById(req.params.id);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const product = await products.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found...");
    if (product.image.public_id) {
      const destroyResponse = await cloudinary.uploader.destroy(
        product.image.public_id
      );
      if (destroyResponse) {
        const deletedProduct = await products.findByIdAndDelete(req.params.id);
        res.status(200).send(deletedProduct);
      }
    } else {
      console.log("Action terminated. Failed to deleted product image...");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//update product
router.put("/:id", isAdmin, async (req, res) => {
  if (req.body.productImg) {
    const destroyResponse = await cloudinary.uploader.destroy(
      req.body.product.image.public_id
);
    if (destroyResponse) {
        
      const uploadedResponse = await cloudinary.uploader.upload(
        req.body.productImg,
        { upload_preset: "shoppingwebsite" }
      );
      if (uploadedResponse) {
      
        const updatedProduct = await products.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              ...req.body.product,
              image: uploadedResponse,
            },
          },
          { new: true }
        );
    
        res.status(200).send(updatedProduct);
      }
    }
  } else {
        try{
      const updatedProduct = await products.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body.product,
        },
        {
          new: true,
        }
      )
      res.status(200).send(updatedProduct);
     
    } catch (error) {
      res.status(500).send(error);
}
  }
});

module.exports = router;
