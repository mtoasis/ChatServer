const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    allchats: Object,
  },
  {
    timestamps:{
      createdAt:'created_at'
    }
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
