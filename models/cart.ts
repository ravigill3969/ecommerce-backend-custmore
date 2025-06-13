import mongoose, { Schema, model, Types, Document } from "mongoose";

interface CartItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  addedAt?: Date;
}

export interface CartDocument extends Document {
  userId: Types.ObjectId;
  items: CartItem[];
  status: "Initialized" | "Paid" | "On the way" | "Delivered";
}

const CartItemSchema = new Schema<CartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CartSchema = new Schema<CartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Initialized", "Paid", "On the way", "Delivered"],
      default: "Initialized",
    },

    items: [CartItemSchema],
  },

  { timestamps: true }
);

// Export model
export const Cart = model<CartDocument>("Cart", CartSchema);
