var EventEmitter = require("events").EventEmitter;
var _util = require("util");


function EventPoison(eventChannel, eventError, eventErrorMapHandler) {
    this.channel = eventChannel;
    this.error = eventError;
    this.mapHandler = eventErrorMapHandler;
}

function EventSeed(eventChannel, eventData, eventDataMapHandler) {
    this.channel = eventChannel;
    this.data = eventData;
    this.mapHandler = eventDataMapHandler;
}

function EventBus() {

    EventEmitter.call(this);

}
_util.inherits(EventBus, EventEmitter);

EventBus.prototype.oneShotService = function (serviceName, reduceHandler) {
    var self = this;
    self.once(serviceName, function (evtSeed) {
        try {
            evtSeed.data = evtSeed.mapHandler ? evtSeed.mapHandler(evtSeed.channel, evtSeed.data) : evtSeed.data;
            delete evtSeed.mapHandler;
            reduceHandler(evtSeed);
        } catch (err) {
            self.throw(evtSeed.channel, err);
        }
    });

};

EventBus.prototype.openService = function (serviceName, reduceHandler) {
    var self = this;
    self.on(serviceName, function (evtSeed) {
        try {
            evtSeed.data = evtSeed.mapHandler ? evtSeed.mapHandler(evtSeed.channel, evtSeed.data) : evtSeed.data;
            delete evtSeed.mapHandler;
            reduceHandler(evtSeed);
        } catch (err) {
            self.throw(evtSeed.channel, err);
        }

    });

};

EventBus.prototype.closeService = function (serviceName) {

    delete this._events[serviceName];
};

EventBus.prototype.closeAll = EventBus.prototype.removeAllListeners;


EventBus.prototype.doService = function (serviceName, eventChannel, eventData, dataMapHandler) {

    this.emit(serviceName, new EventSeed(eventChannel, eventData, dataMapHandler));
};

EventBus.prototype.fail = function (errorReduceHandler) {

    this.on("error", function (eventPoison) {
        try {
            eventPoison.error = eventPoison.mapHandler ? eventPoison.mapHandler(eventPoison.channel, eventPoison.error) : eventPoison.error;
            delete eventPoison.mapHandler;
            errorReduceHandler(eventPoison);
        } catch (err) {
            console.log(eventPoison.channel, err);
        }
    });
};

EventBus.prototype.throw = function (eventChannel, eventError, errorMapHandler) {

    this.emit("error", new EventPoison(eventChannel, eventError, errorMapHandler));
};

module.exports = EventBus;