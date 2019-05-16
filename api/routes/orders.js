const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

// Handle incoming GET requests to /orders
router.get('/', (req, res, next) => {
  Order
    .find()
    .select('_id product quantity')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            id: doc.id,
            productId: doc.product,
            quantity: doc.quantity,
          }
        })
      })
    })

});

router.post('/', (req, res, next) => {
  Product.findById(req.body.productId)
    .then(() => {
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      })
      return order.save()
        .then(result => {
          console.log(result);
          res.status(201).json({
            message: 'Order stored',
            createdOrder: {
              _id: result.id,
              product: result.product,
              quantity: result.quantity,
            }
          });
        })
    })
    .catch(() => {
      res.status(500).json({
        message: 'Product can not be found',
      });
    })
});

router.get('/:orderId', (req, res, next) => {
  Order.findById(req.params.orderId)
    .select('_id product quantity')
    .exec()
    .then(order => {
      res.status(200).json({
        order: order,
        request: {
          tyoe: 'GET',
          url: 'http://localhost:3000/orders'
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Product can not be found'
      })
    })
});

router.delete('/:orderId', (req, res, next) => {
  Order.remove({ _id: req.params.orderId })
    .exec()
    .then(() => {
      Order.find()
        .select('_id product quantity')
        .exec()
        .then(orders => {
          if (orders.length >= 0) {
            res.status(200).json({
              count: orders.length,
              orders: orders.map(order => {
                return {
                  id: order.id,
                  productId: order.product,
                  quantity: order.quantity,
                }
              })
            })
          }
        })
    })
})

module.exports = router;