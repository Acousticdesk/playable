export default function PubSub () {
  this.events = {};
}

PubSub.prototype = {
  subscribe: function (event, cb) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(cb);
  },
  publish: function (event, data) {
    if (Array.isArray(this.events[event])) {
      this.events[event].forEach(function (cb) {
        cb(data);
      });
    }
  }
};
