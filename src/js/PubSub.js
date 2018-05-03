export default class PubSub {
  constructor () {
    this.events = {};
  }
  
  unsub (event, cb) {
    if (Array.isArray(this.events[event])) {
      if (cb) {
        this.events[event] =
    
          this.events[event].map((c) => {
            if (c !== cb) {
              return c;
            }
            return null;
          })
      } else {
       this.events[event] = []; 
      }
    }
  }
  
  subscribe (event, cb) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(cb);
  }
  
  publish (event, data) {
    if (Array.isArray(this.events[event])) {
      this.events[event].forEach(function (cb) {
        if (typeof cb !== 'function') {
          return;
        }
        cb(data);
      });
    }
  }
} 

