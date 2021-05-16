const mongoose = require("mongoose");
require("mongoose-type-url");
const validator = require("validator");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxLength: [100, "Name can not be more than 100 characters"],
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxLength: [500, "Description can not be more than 100 characters"],
  },
  website: {
    work: mongoose.SchemaTypes.Url,
    profile: mongoose.SchemaTypes.Url,
  },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email",
      isAsync: false,
    },
  },
  phone: {
    type: String,
    validate: {
      validator: validator.isMobilePhone,
      message: "{VALUE} is not a valid phone number",
      isAsync: false,
    },
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  careers: {
    type: [String],
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Business",
      "Other",
    ],
  },
  averageRating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [10, "Rating can not be more than 10"],
  },
  averageCost: Number,
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  housing: {
    type: Boolean,
    default: false,
  },
  jobAssistance: {
    type: Boolean,
    default: false,
  },
  jobGuarantee: {
    type: Boolean,
    default: false,
  },
  acceptGi: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

BootcampSchema.pre("save", function (next) {
  console.log("Slugify ran", this.name);
  this.slug = slugify(this.name, { lower: true });
  next();
});

BootcampSchema.pre("save", async function(next) {

  console.log("Starting geocoder");
  const location = await geocoder.geocode(this.address);
  this.location = {
    type: "point",
    coordinates: [location[0].longitude, location[0].latitude],
    formattedAddress: location[0].formattedAddress,
    street: location[0].streetName,
    city: location[0].city,
    state: location[0].stateCode,
    zipcode: location[0].zipcode,
    country: location[0].countryCode,

  }
  this.address = undefined;
  console.log("Ending geocoder")

  next();
})

module.exports = mongoose.model("Bootcamp", BootcampSchema);
