const mqtt = require('mqtt')

var MQTT_INFO={
    host:"mqtt://83.150.214.186",
    clientId:"ApiServerJS"+Math.floor(Math.random() * 100)+1,
    username:"admin",
    password:"adpublic3685",
    port:1883
}

module.exports={
    client:mqtt.connect(MQTT_INFO.host,{
        clientId:MQTT_INFO.clientId,
        port:MQTT_INFO.port,
        username:MQTT_INFO.username,
        password:MQTT_INFO.password
    }),
    subscribeDevice:function(imei){
        var topic = imei+"/APW/RES";
        console.log("abone oldu "+topic)
        this.client.subscribe(topic);
    },unsubscribeDevice:function(imei){
        var topic = imei+"/APW/RES";
        console.log("abone çık "+topic)
        this.client.unsubscribe(topic);
    },
    serverSubscribe:function(){
        var topic="KayseriKocasinan/Server";
        this.client.subscribe(topic)
    }
}