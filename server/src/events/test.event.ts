import type { EventGroup } from "./event_handler";

const testEvents: EventGroup = {
  default: ({ event, data }) => {
    // logic for the default event handler
    console.log(`Event: ${event}, Data: ${data}`);
  },
};

export default testEvents;
