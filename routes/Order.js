const { Orders } = require("../models/Order");
const { auth, isUser, isAdmin } = require("../middleware/auth");
const moment = require("moment");
const router = require("express").Router();
router.get("/", isAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const order = query
      ? await Orders.find().sort({ _id: -1 }).limit(4)
      : await Orders.find().sort({ _id: -1 });
    res.status(200).send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/orders", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");
  try {
    const orders = await Orders.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).send(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

///income stats
router.get("/income", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");
  try {
    const income = await Orders.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).send(income);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
///1 week sales
router.get("/sales", isAdmin, async (req, res) => {
  const oneweek = moment()
    .day(moment().day() - 7)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");
  try {
    const sales = await Orders.aggregate([
      {
        $match: { createdAt: { $gte: new Date(oneweek) } },
      },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$day",
          total: { $sum: "$sales" },
        },
      },
    ]);

    res.status(200).send(sales);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
//update Order
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const updateOrder = await Orders.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).send(updateOrder);
  } catch (err) {
    res.status(500).send(err);
  }
});
//get order
router.get("/findOne/:id", auth, async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (req.user._id !== order.userId || !req.user.isAdmin)
      return res.status(403).send("Acess denied .Not authorised...+");
    else res.status(200).send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/orders/:id", auth, async (req, res) => {
  try {
    const order = await Orders.find({userId:req.params.id});
    
    res.status(200).send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
