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
      console.log(topic, partition);
    },
  });
}

export default kafkaConsumer;
