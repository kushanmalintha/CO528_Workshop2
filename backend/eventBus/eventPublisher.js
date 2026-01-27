const { postJson } = require("./httpClient");

const EVENT_BUS_URL = process.env.EVENT_BUS_URL || "http://localhost:4001/events";

const publishDomainEvent = (eventPayload) => {
  setImmediate(() => {
    postJson(EVENT_BUS_URL, eventPayload, 2000)
      .then(() => {
        console.log(
          `[EventPublisher] Published ${eventPayload.eventName} for entity ${eventPayload.entityId}`
        );
      })
      .catch((error) => {
        console.error(
          `[EventPublisher] Failed to publish ${eventPayload.eventName}: ${error.message}`
        );
      });
  });
};

module.exports = { publishDomainEvent };
