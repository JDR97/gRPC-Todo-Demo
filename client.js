const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;

//To read the todo activity from command, 3rd argument
const text = process.argv[2];
//Listening port should be the same
const client = new todoPackage.Todo("localhost:40404", grpc.credentials.createInsecure());

client.createTodo({
    "id" : -1,
    "text" : text
}, (err, response) => {
        console.log("Recieved from Server:" + JSON.stringify(response));
});

//Needed when we are expecting the response as Array format from Server
/*
//As we do not expect anything in request i.e. from Client in case of reading all the todos, so send {}
client.readTodos({}, (err, response) => {
    console.log("Received all todos from Server:" + JSON.stringify(response));
    //Handling null edge case
    if (!response.items)
        response.items.forEach( i => console.log(i.text));
        
});
*/

//On the basis of event the streaming goes on
const call = client.readTodosStream();
//Data event
call.on("data", item => {
    console.log( "Receiving data from Server (Stream) : " + JSON.stringify(item));
});
//End Event
call.on("end", e => console.log("Server has sent all the data..."));

