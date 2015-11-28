var EventProxy = require("eventproxy");
var util = require("util");

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

function WorkflowMetacell(channelName, channelEventDuty, channelInputsCount, finalDataReachHandler, finalErrorReachHandler, finalDataMapHandler, finalErrorMapHandler) {

    this._ep = new EventProxy();
    this._channelName = channelName;
    this._eventDuty = channelEventDuty;
    this._inputsCount = channelInputsCount;
    this._finalDataReducer = finalDataReachHandler;
    this._finalErrorReducer = finalErrorReachHandler;
    this._finalDataMapper = finalDataMapHandler;
    this._finalErrorMapper = finalErrorMapHandler;

    this._finalHandlerPool = [];

    var status = "pending";
    var result = null;

    this.resetStatus = function () {
        status = "pending";
        result = null;
    };

    this.getStatus = function () {
        return status;
    };
    this.getResult = function () {
        return result;
    };

    var self = this;
    self.turnSucceeded = function (data) {
        status = "success";
        result = new EventSeed(self._channelName, data, self._finalDataMapper);
        self._ep.unbind("__all__");
    };
    self.turnFailed = function (error) {
        status = "failure";
        result = new EventPoison(self._channelName, error, self._finalErrorMapper);
        self._ep.unbind("__all__");
    };

};

WorkflowMetacell.prototype.putSuccess = function (evtSeed) {

    if (evtSeed && evtSeed.data && evtSeed.channel && !evtSeed.error) {

        this._ep.emit(this._eventDuty + ".success", evtSeed);

    }
};

WorkflowMetacell.prototype.putFailure = function (evtPoison) {

    if (evtPoison && evtPoison.error && evtPoison.channel && evtPoison.error.stack) {

        this._ep.emit(this._eventDuty + ".failure", evtPoison);

    }
};

WorkflowMetacell.prototype.pipeTo = function (anotherWorkCell) {

    if (!anotherWorkCell || !anotherWorkCell.putSuccess || !anotherWorkCell.putFailure) {
        return;
    }
    var self = this;
    switch (self.getStatus()) {
        case "pending":
            var finalHandler = function (seedOrPoison) {
                if (seedOrPoison.data) {
                    anotherWorkCell.putSuccess(seedOrPoison);
                } else if (seedOrPoison.error && seedOrPoison.error.stack) {
                    anotherWorkCell.putFailure(seedOrPoison);
                } else {
                    console.error("input parameter is illegal");
                }
            };
            self._ep.once("final", finalHandler);
            self._finalHandlerPool.push(finalHandler);
            break;
        case "success":
            anotherWorkCell.putSuccess(self.getResult());
            break;
        case "failure":
            anotherWorkCell.putFailure(self.getResult());
            break;
        default:
            console.error("framework status definition error");
    }
};

WorkflowMetacell.prototype.final = function (dataConsumer, errorConsumer) {

    if (!dataConsumer && !errorConsumer || typeof dataConsumer !== "function") {
        return;
    }
    var self = this;
    switch (self.getStatus()) {
        case "pending":
            var finalHandler = function (seedOrPoison) {
                if (seedOrPoison.data) {
                    dataConsumer(seedOrPoison);
                } else if (seedOrPoison.error && seedOrPoison.error.stack && typeof errorConsumer === "function") {
                    errorConsumer(seedOrPoison);
                } else {
                    console.error("input parameter is illegal");
                }
            };
            self._ep.once("final", finalHandler);
            self._finalHandlerPool.push(finalHandler);
            break;
        case "success":
            dataConsumer(self.getResult());
            break;
        case "failure":
            if (typeof errorConsumer === "function") {
                errorConsumer(self.getResult());
            }
            break;
        default:
            console.error("framework status definition error");
    }
};

WorkflowMetacell.prototype.reset = function () {
    this._ep.unbind();
    this._ep._fired = {};
    delete this._ep._after;
};

WorkflowMetacell.prototype.clear = function () {
    this._ep.unbind();
    this._ep._fired = {};
    delete this._ep._after;
    this._ep = null;
};


////////////////////// TopOnePassCell //////////////////////////////
function TopOnePassCell(channelName, channelEventDuty, channelInputsCount, finalDataReachHandler, finalErrorReachHandler, finalDataMapHandler, finalErrorMapHandler) {
    var self = this;

    WorkflowMetacell.call(self, channelName, channelEventDuty, channelInputsCount, finalDataReachHandler, finalErrorReachHandler, finalDataMapHandler, finalErrorMapHandler);
    self.topOnePassHandler = function (evtSeed) {
        try {
            evtSeed.data = evtSeed.mapHandler ? evtSeed.mapHandler(evtSeed.channel, evtSeed.data) : evtSeed.data;
            delete evtSeed.mapHandler;
            self.turnSucceeded(self._finalDataReducer ? self._finalDataReducer(evtSeed) : evtSeed.data);

        } catch (err) {
            self.turnFailed(err);
        } finally {
            self._ep.emit("final", self.getResult());
            self.reset();
        }

    };
    self.failureHandler = function (poisonList) {
        try {
            var oneItem = null;
            for (index in poisonList) {
                oneItem = poisonList[index];
                oneItem.error = oneItem.mapHandler ? oneItem.mapHandler(oneItem.channel, oneItem.error) : oneItem.error;
                delete oneItem.mapHandler;
            }
            self.turnFailed(self._finalErrorReducer ? self._finalErrorReducer(poisonList) : new Error("All channels failed"));

        } catch (err) {
            self.turnFailed(err);
        } finally {
            self._ep.emit("final", self.getResult());
            self.reset();
        }

    };

    self._ep.once(self._eventDuty + ".success", self.topOnePassHandler);
    self._ep.after(self._eventDuty + ".failure", self._inputsCount, self.failureHandler);

};
util.inherits(TopOnePassCell, WorkflowMetacell);

TopOnePassCell.prototype.recover = function () {
    var self = this;
    self.reset();
    self._ep.once(self._eventDuty + ".success", self.topOnePassHandler);
    self._ep.after(self._eventDuty + ".failure", self._inputsCount, self.failureHandler);
    for (index in self._finalHandlerPool) {
        self._ep.once("final", self._finalHandlerPool[index]);
    }

    self.resetStatus();
};


///////////////////// AllInOnePassCell //////////////////////////////
function AllInOnePassCell(channelName, channelEventDuty, channelInputsCount, finalDataReachHandler, finalErrorReachHandler, finalDataMapHandler, finalErrorMapHandler) {
    var self = this;

    WorkflowMetacell.call(self, channelName, channelEventDuty, channelInputsCount, finalDataReachHandler, finalErrorReachHandler, finalDataMapHandler, finalErrorMapHandler);
    self.allInOnePassHandler = function (seedList) {
        try {
            var oneItem = null;
            for (index in seedList) {
                oneItem = seedList[index];
                oneItem.data = oneItem.mapHandler ? oneItem.mapHandler(oneItem.channel, oneItem.data) : oneItem.data;
                delete oneItem.mapHandler;
            }
            self.turnSucceeded(self._finalDataReducer ? self._finalDataReducer(seedList) : seedList);
        } catch (err) {
            self.turnFailed(err);
        } finally {
            self._ep.emit("final", self.getResult());
            self.reset();
        }

    };
    self.failureHandler = function (evtPoison) {
        try {
            evtPoison.error = evtPoison.mapHandler ? evtPoison.mapHandler(evtPoison.channel, evtPoison.error) : evtPoison.error;
            delete evtPoison.mapHandler;
            self.turnFailed(self._finalErrorReducer ? self._finalErrorReducer(evtPoison) : evtPoison.error);
        } catch (err) {
            self.turnFailed(err);
        } finally {
            self._ep.emit("final", self.getResult());
            self.reset();
        }

    };

    self._ep.after(self._eventDuty + ".success", self._inputsCount, self.allInOnePassHandler);
    self._ep.once(self._eventDuty + ".failure", self.failureHandler);

};
util.inherits(AllInOnePassCell, WorkflowMetacell);

AllInOnePassCell.prototype.recover = function () {
    var self = this;
    self.reset();
    self._ep.after(self._eventDuty + ".success", self._inputsCount, self.allInOnePassHandler);
    self._ep.once(self._eventDuty + ".failure", self.failureHandler);
    for (index in self._finalHandlerPool) {
        self._ep.once("final", self._finalHandlerPool[index]);
    }

    self.resetStatus();
};

function WorkCellsAgent(cellSystemBuildHandler, finalReduceHandler, cellSystemInputHandler) {
    var cellsPool = {};
    var poolRecoverHandler = function (a) {
        for (var key in cellsPool) {
            cellsPool[key].recover();
        }
    };
    cellSystemBuildHandler(cellsPool, TopOnePassCell, AllInOnePassCell);
    finalReduceHandler(cellsPool, EventProxy, poolRecoverHandler);
    cellSystemInputHandler ? cellSystemInputHandler(cellsPool, EventSeed, EventPoison) : null;

    return cellsPool;
};

function CellSystemLaunch(cellsPool, cellSystemInputHandler) {
    cellSystemInputHandler(cellsPool, EventSeed, EventPoison);
};


module.exports = {
    TopOnePassCell: TopOnePassCell,
    AllInOnePassCell: AllInOnePassCell,
    WorkCellsAgent: WorkCellsAgent,
    CellSystemLaunch: CellSystemLaunch
};
