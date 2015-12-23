'use strict';
const util = require('util');
const EventEmitter = require('events');

function Ehub(){
    this.emitters = [];
    this.cursor = 0;
    EventEmitter.call(this);
}
util.inherits(Ehub, EventEmitter);

Ehub.prototype.addEmitter = function(emitter){
    //подпишемся на удаление эмиттера
    var finalizer = function(emitter){
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
    console.log("emitter:", emitter)
    emitter.once("close", finalizer.bind(this));
    this.emitters.push(emitter);
    return this.emitters.length;
};
Ehub.prototype.pop = function(reciever){
    if(!this.emitters.length) return;
    if(!(this.cursor in this.emitters)) this.cursor = 0;
    this.emitters[this.cursor].pop(reciever);
    this.cursor++;
    if(this.cursor >= this.emitters.length) this.cursor = 0;
};

module.exports = Ehub;
