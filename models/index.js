var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/country_app2");

module.exports.User = require("./user");
module.exports.Country = require("./country");