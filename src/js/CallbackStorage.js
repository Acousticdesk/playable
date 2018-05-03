/**
 * The only purpose of the class is to save references of callbacks
 * to be able to unbind them by link in the future if necessary
*/

export default class CallbackStorage {
  constructor () {
    this.callbacks = [];
  }
  
  addCallback (cb) {
    const regExp = /(?:bound )?(\w+)/i;
    const searchResult = regExp.exec(cb.name);
    
    if (!searchResult) {
      return false;
    }
    
    this.callbacks.push({
      name: searchResult[1],
      cb
    });
  }
  
  addCallbacks (cbs) {
    cbs.forEach((cb) => {
      this.addCallback(cb);
    });
  }
  
  getCallback (name) {
    const result = this.callbacks.filter((cb) => cb.name === name);
    
    return result[0] ? result[0].cb : null;
  }
}
