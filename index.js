'use strict';

const firebase = require('firebase-admin');
const request = require('request');

var serviceAccount = require('./serviceAccountKey.json');
var host = serviceAccount.host;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: serviceAccount.databaseURL
});

function startListeners() {
    firebase.database().ref('/tasks').on('child_added', function(data) {
        if (data.val().respuesta)
            return;
        console.log(`task readed: ${data.val().fecha}`);
        taskProcessed(data);
    });
    console.log('Start');
}

function taskProcesser(task) {
    if (task.val().tipo == "cambiar") cambiar(task);
    else if (task.val().tipo == "estados") estados(task);
}

function cambiar(task) {
    let url = `${host}${task.val().dispositivo}`;
    request(url, { json: true }, (err, res, body) => {
        if (err) 
            return console.log(err);
        task.ref.update({ respuesta: res , fecha_proceso: new Date() });
    });
}

function estados(task) {
    let url = `${host}/estados`;
    request(url, { json: true }, (err, res, body) => {
        if (err) 
            return console.log(err);
        task.ref.update({ respuesta: res , fecha_proceso: new Date() });
    });
}

// Start the server.
startListeners();