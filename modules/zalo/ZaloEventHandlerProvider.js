class ZaloEventHandlerProvider {
  constructor(config) {
    this.eventHandlers = {};
    this.config = config;
  }

  register(event, handler) {
    this.eventHandlers[event] = handler;
    return this;
  }

  apply(events, handle) {
    if (!Array.isArray(events)) {
      throw new Error('The events argument must be a list of events');
    }
    events.forEach((event) => {
      this.register(event, handle);
    });
    return this;
  }

  provide(event) {
    if (!this.hasEvent(event)) {
      throw new Error(`this event ${event} doesn't exist.`);
    }
    if (this.config.zaloWebhook.ignoringEvents && this.config.zaloWebhook.ignoringEvents.includes(event)) {
      return () => {};
    }
    return this.eventHandlers[event];
  }

  hasEvent(event) {
    return !!this.eventHandlers[event];
  }
}

module.exports = ZaloEventHandlerProvider;
