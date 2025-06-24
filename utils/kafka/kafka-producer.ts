import kafka from "./kafka-client";

export async function KafkaProducerOrderSuccess(
  cartID: string,
  userID: string
) {
  const producer = kafka.producer();

  console.log("Connecting Producer");
  await producer.connect();
  console.log("Producer Connected Successfully");

  await producer.send({
    topic: "order-successfully-created",
    messages: [
      {
        key: "payment-update",
        value: JSON.stringify({ cartID, userID }),
      },
    ],
  });

  await producer.disconnect();
}

export async function KafkaVendorProducer(vendorID: string, orderID: string) {
  const producer = kafka.producer();

  console.log("Connecting Vendor Producer");
  await producer.connect();
  console.log("Vendor Producer Connected Successfully");

  await producer.send({
    topic: "vendor-updates",
    messages: [
      {
        key: "order-notification",
        value: JSON.stringify({ vendorID, orderID }),
      },
    ],
  });

  await producer.disconnect();
}