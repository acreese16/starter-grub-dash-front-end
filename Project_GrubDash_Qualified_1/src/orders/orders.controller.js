const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderValidation (req, res, next) {
    const { data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body;

    if (!deliverTo || deliverTo == "") {
        return next({ status: 400, message: "Order must include a deliverTo"});
    }
    if (!mobileNumber || mobileNumber == "") {
        return next({ status: 400, message: "Order must include a mobileNumber"});
    }
    if (!dishes) {
        return next({ status: 400, message: "Order must include a dish"});
    }
    if (!Array.isArray(dishes) || dishes.length == 0) {
        return next({ status: 400, message: "Order must include at least one dish"});
    }
    dishes.map((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
            return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
        };
    });
    res.locals.order = req.body.data;
    next();

}

function create (req, res, next) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body;

    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status ? status : "pending",
        dishes: dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder});

};

function orderExists (req, res, next) {
    const { orderId} = req.params;
    const foundOrder = orders.find((order) => order.id === Number(orderId));

    if (foundOrder) {
        res.locals.order = foundOrder;
        return next ();
    } else {
        return next({ status: 404, message: `Order id not does not exist ${orderId}`});
    }
}

function read (req, res, next) {
    res.json({data: res.locals.order })
};

function updateValidation (req, res, next) {
    const {orderId} = req.params;
    const {data: {id, deliverTo, mobileNumber, status, dishes} = {}} = req.body;

    if (id !== Number(orderId)) {
        return next({ status: 404, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`});
    }
    if (!status || status == "") {
        return next({status: 404, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"});
    }
    if (status == "delivered") {
        return next({ status: 404, message: "A delivered order cannot be changed"})
    }
}

function update (req, res, next) {
    const {orderId} = req.params;
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body;
    
    const orderUpdate = {
        id: orderId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
    };
    res.json({data: orderUpdate});
};

function list (req, res, next) {
    res.json({ data: orders})
};

function destroy (req, res, next) {
    const {orderId} = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));

    orders.splice(index, 1);
    res.sendStatus(201);
};

function destroyValidation (req, res, next) {
    const {data: {status} = {}} = req.body;

    if (status !== "pending") {
        return next({status: 404, message: "An order cannot be deleted unless it is pending"});
    }
    next();
};

module.exports = {
    create: [orderValidation, create],
    list,
    read: [orderExists, read],
    update: [orderExists, orderValidation, updateValidation, update],
    delete: [orderExists, destroyValidation, destroy],
};