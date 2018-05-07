// Imports the Google Cloud client library
const PubSub = require('@google-cloud/pubsub');

// Your Google Cloud Platform project ID
const projectId = 'pub-sub-demo';

// Instantiates a client
const pubsubClient = new PubSub({
  projectId: projectId,
});

// The name for the new topic
const topicName = 'my-new-topic';

async function init() {

  // Creates the new topic
  await pubsubClient
    .createTopic(topicName)
    .then(results => {
      const topic = results[0];
      console.log(`Topic ${topic.name} created.`);
    })
    .catch(err => {
      // dont throw error when topic exists
      if (err.code !== 6) {
        throw err;
      }
    });
  const data = JSON.stringify({ foo: 'bar' });

  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);

  await pubsubClient
    .topic(topicName)
    .publisher()
    .publish(dataBuffer)
    .then(messageId => {
      console.log(`Message ${messageId} published.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  const subscriptionName = 'your-subscription';
  const timeout = 60;

  // References an existing subscription
  await pubsubClient.createSubscription(topicName, subscriptionName);
  const subscription = pubsubClient.subscription(subscriptionName);

  // Create an event handler to handle messages
  let messageCount = 0;
  const messageHandler = message => {
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${message.attributes}`);
    messageCount += 1;

    // "Ack" (acknowledge receipt of) the message
    message.ack();
  };

  subscription.on(`message`, messageHandler);
  setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`${messageCount} message(s) received.`);
  }, timeout * 1000);
}

init();