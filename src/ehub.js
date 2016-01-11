'use strict';
const util = require('util');
const EventEmitter = require('events');

var Ehub = function(){
    this.emitters = [];
    this.cursor = 0;
    EventEmitter.call(this);
};
util.inherits(Ehub, EventEmitter);

Ehub.prototype.finalizer = function(emitter){
    var i,l;
    for(i=0, l=this.emitters.length; i<l; i++){
        if(this.emitters[i] === emitter){
            this.emitters.splice(i, 1);
            if(this.cursor > i) this.cursor--;
	    //на самом деле курсор ВСЕГДА будет смотреть на текущий элемент
	    //причем провальную попытку мы не отслеживаем - его reciever просто не вызовется и все
	    //в дальнейшем это поведение надо сделать задаваемым
	    return;
	}
    }
};
Ehub.prototype.addEmitter = function(emitter){
    if(emitter instanceof Array){
    	this.emitters.push(emitter);
    	return this.emitters.length;
    }
    //console.log("emitter:", emitter);
    emitter.once("close", this.finalizer.bind(this));
    this.emitters.push(emitter);
    return this.emitters.length;
};
Ehub.prototype.pop = function(reciever){
    if(!this.emitters.length) return;
    if(this.cursor >= this.emitters.length) this.cursor = 0;
    //console.log("ehub emitters: ", this.emitters);
    if(this.emitters[this.cursor] instanceof Array){
    	if(this.emitters[this.cursor].length){
    	    reciever(this.emitters[this.cursor].pop());
    	    this.cursor++;
    	    return;
    	}else{
    	    this.finalizer(this.emitters[this.cursor]);
    	    this.pop(reciever);
    	    return;
    	}
    }
    this.emitters[this.cursor].pop(reciever);
    this.cursor++;
};

module.exports = Ehub;
