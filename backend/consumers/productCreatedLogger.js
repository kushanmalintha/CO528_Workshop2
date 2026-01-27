const express = require("express");
const { postJson } = require("../eventBus/httpClient");

const app = express();
app.use(express.json());

app.post("/events/product-created", (req, res) => {
  const eventPayload = req.body;
  console.log(
    `[Consumer] Received ${eventPayload.eventName} for entity ${eventPayload.entityId} at ${new Date().toISOString()}`
  );

  res.status(202).json({ status: "accepted" });

  setTimeout(() => {
    console.log(
      `[Consumer] Finished processing ${eventPayload.eventName} for entity ${eventPayload.entityId} at ${new Date().toISOString()}`
    );
  }, 2000);
});

const PORT = process.env.CONSUMER_PORT || 4002;
const EVENT_BUS_SUBSCRIPTIONS_URL =
  process.env.EVENT_BUS_SUBSCRIPTIONS_URL ||
  "http://localhost:4001/subscriptions";
const CONSUMER_BASE_URL =
  process.env.CONSUMER_BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Product consumer listening on http://localhost:${PORT}`);

  setImmediate(() => {
    postJson(
      EVENT_BUS_SUBSCRIPTIONS_URL,
      {
        eventName: "ProductCreated",
        targetUrl: `${CONSUMER_BASE_URL}/events/product-created`
      },
      2000
    )
      .then(() => {
        console.log(
          `[Consumer] Subscribed to ProductCreated events via ${EVENT_BUS_SUBSCRIPTIONS_URL}`
        );
      })
      .catch((error) => {
        console.error(
          `[Consumer] Failed to subscribe to event bus: ${error.message}`
        );
      });
  });
});
