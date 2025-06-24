import { Cart } from "../../models/cart";
import User from "../../models/user";
import kafka from "./kafka-client";

const groupId = "cart-success";

async function kafkaConsumer() {
  console.log("kafka consumer here");
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();

  await consumer.subscribe({
    topic: "order-successfully-created",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const rawValue = message.value?.toString();
        if (!rawValue) {
          console.warn("Received empty message");
          return;
        }

        const { cartID, userID } = JSON.parse(rawValue);

        console.log(`[Kafka] Updating cart ${cartID} to status "Paid"`);

        const cart = await Cart.findOneAndUpdate(
          { _id: cartID },
          { $set: { status: "Paid" } },
          { new: true }
        );

        const user = await User.findByIdAndUpdate(userID, {
          $addToSet: { prevOrders: cartID },
        });

        if (!cart) {
          console.warn(`[Kafka] Cart not found for ID: ${cartID}`);
        } else {
          console.log(`[Kafka] Cart updated: ${cart._id} -> ${cart.status}`);
        }
        if (!user) {
          console.warn(`[Kafka] user not found for ID: ${userID}`);
        } else {
          console.log(
            `[Kafka] user updated: ${user._id} -> ${user.prevOrders}`
          );
        }
      } catch (error) {
        console.error("Kafka consumer error:", error);
      }
    },
  });
}

export default kafkaConsumer;
