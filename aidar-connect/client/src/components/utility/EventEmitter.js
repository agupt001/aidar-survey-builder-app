/*
 * Events utility
 * Description: Events are fired from one component to another which do not have any connection
 * Author: Ankit Gupta
 * Created Date: 10/19/2024
 */
const EventEmitter = {
    events: {}, // Manage events

    // If event is set to on, log it in events
    on: function (event, listener) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    },

    // If event is set to off, delete from events
    off: function (event, listenerToRemove) {
      if (!this.events[event]) return;
  
      this.events[event] = this.events[event].filter((listener) => listener !== listenerToRemove);
    },

    // Emit the event, if it is fired from somewhere
    emit: function (event, data) {
      if (!this.events[event]) return;
  
      this.events[event].forEach((listener) => listener(data));
    },
  };
  
  export default EventEmitter;
  