import mongoose, { Document, Schema } from "mongoose";

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<Address>(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: addressSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("Custmore", userSchema);
export default User;
