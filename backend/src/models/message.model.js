import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    SenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ReceiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    file: {
      url: {
        type: String,
      },
      name: {
        type: String,
      },
      type: {
        type: String,
      },
      size: {
        type: Number,
      },
    },
    audio: {
      url: {
        type: String,
      },
      duration: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
