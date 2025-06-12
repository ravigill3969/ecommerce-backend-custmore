import kafka from "./kafka-client";

async function KafkaProducer(cartID: string) {
  const producer = kafka.producer();

  console.log("Connecting Producer");
  await producer.connect();
  console.log("Producer Connected Successfully");

  await producer.send({
    topic: "order-successfully-created",
    messages: [
      {
        key: "payment-update",
        value: JSON.stringify({ cartID }),
      },
    ],
  });

  await producer.disconnect();
}

export default KafkaProducer;
