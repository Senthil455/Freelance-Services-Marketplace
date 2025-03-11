const EventEmitter = require('events');

class Logger extends EventEmitter {
  log(message) {
    this.emit('message', { id: Date.now(), text: message });
  }
}

const logger = new Logger();

logger.on('message', (data) => {
  console.log(`[${data.id}] ${data.text}`);
});

logger.log('first event fired');
logger.log('second event fired');
