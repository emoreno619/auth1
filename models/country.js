var mongoose = require("mongoose");

var countrySchema = new mongoose.Schema({
  name: String,
  flag: String,
  capital: String,
  population: Number,
  ownerId: String,
  cities: []
});

var Country = mongoose.model("Country", countrySchema);

module.exports = Country;