const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists (req, res, next) {
    const {dishId} = req.params;
    const foundDish = dishes.find((dish) => dish.id === Number(dishId));

    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    } else {
        return next({ status: 404, message: `Dish does not exist: ${dishId}` })
    };
};

function create (req, res, next) {
    const {data: {name, description, price, image_url} = {}} = req.body;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    };
    dishes.push(newDish);
    res.status(201).json({data: newDish});
};

function read (req, res, next) {
    res.json({ data: res.locals.dish });
};

function update (req, res, next) {
    const dish = res.locals.dish;
    const {dishId} = req.params;
    const { data: {name, description, price, image_url} = {}} = req.body;

    dish = {
        id: res.locals.dishId,
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    };

    if (dish !== Number(dishId)) {
        res.sendStatus(404);
    } else {
        res.json({ data: dish });
    }
};

function list (req, res, next) {
    res.json({data: dishes});
};

function dataValidation (req, res, next) {
    const {data: {name, description, price, image_url} = {}} = req.body;

    if (!name || name == "") {
        return next({ status: 400, message: "Dish must include a name"});
    }
    if (!description || description == "") {
        return next({ status: 400, message: "Dish must include a description" });
    }
    if (!price) {
        return next({ status: 400, message: "Dish must include a price" });
    }
    if (price <= 0 || !Number.isInteger(price)) {
        return next({ status: 400, message: "Dish must have a price that is an integer greater than 0" });
    }
    if (!image_url || image_url == "") {
        return next({ status: 400, message: "Dish must include a image_url" });
    }
    next();
};

function idValidation (req, res, next) {
    const {dishId} = req.params;
    const { data: {id} = {}} = req.body;

    if (!id || id === Number(dishId)) {
        res.locals.dishId = dishId;
        return next();
    } else {
        next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`});
    }
    
};

module.exports = {
    create: [dataValidation, create],
    list,
    read: [dishExists, read],
    update: [dishExists, idValidation, dataValidation, update],
};