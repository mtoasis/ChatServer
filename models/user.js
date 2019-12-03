const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userId:String,
  userName:String
});

const User = mongoose.model("User", userSchema);

module.exports = User;
