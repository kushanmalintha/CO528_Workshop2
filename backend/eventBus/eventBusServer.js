const express = require("express");
const { randomUUID } = require("crypto");
const { postJson } = require("./httpClient");

const app = express();
app.use(express.json());

const subscriptions = [];

const isValidEvent = (eventPayload) => {
  return Boolean(
    eventPayload &&
      eventPayload.eventName &&
      eventPayload.entityId &&
      eventPayload.timestamp &&
      eventPayload.metadata
  );
};

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", subscriptions: subscriptions.length });
});

app.post("/subscriptions", (req, res) => {
  const { eventName, targetUrl } = req.body;
  if (!eventName || !targetUrl) {
    return res.status(400).json({
      message: "eventName and targetUrl are required to subscribe"
    });
  }

  const subscription = {
    id: randomUUID(),
    eventName,
    targetUrl
  };

  subscriptions.push(subscription);
  console.log(
    `[EventBus] Registered subscription ${subscription.id} for ${eventName} -> ${targetUrl}`
  );

  return res.status(201).json(subscription);
});

app.post("/events", (req, res) => {
  const eventPayload = req.body;
  if (!isValidEvent(eventPayload)) {
    return res.status(400).json({
      message:
        "Invalid event payload. eventName, entityId, timestamp, metadata are required."
    });
  }

  console.log(
    `[EventBus] Received ${eventPayload.eventName} for entity ${eventPayload.entityId}`
  );

  res.status(202).json({ status: "accepted" });

  setImmediate(() => {
    const matchingSubscriptions = subscriptions.filter(
      (subscription) => subscription.eventName === eventPayload.eventName
    );

    if (matchingSubscriptions.length === 0) {
      console.log(
        `[EventBus] No subscribers for ${eventPayload.eventName}, event discarded`
      );
      return;
    }

    matchingSubscriptions.forEach((subscription) => {
      postJson(subscription.targetUrl, eventPayload, 3000)
        .then(() => {
          console.log(
            `[EventBus] Delivered ${eventPayload.eventName} to ${subscription.targetUrl}`
          );
        })
        .catch((error) => {
          console.error(
            `[EventBus] Delivery failed to ${subscription.targetUrl}: ${error.message}`
          );
        });
    });
  });
});

const PORT = process.env.EVENT_BUS_PORT || 4001;
app.listen(PORT, () => {
  console.log(`Event bus listening on http://localhost:${PORT}`);
});
