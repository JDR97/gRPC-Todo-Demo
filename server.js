const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;

const server = new grpc.Server();
//BindAsync does not require start() function, Bind needed but as it is deprecated so!!!
server.bindAsync("0.0.0.0:40404", grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error(`Failed to bind server: ${err.message}`);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
});
//Adding the service created in proto file using package "todoPackage" and mapping them with the server side's functions
server.addService(todoPackage.Todo.service, 
    {
        "createTodo" : createTodoSrv,
        "readTodos" : readTodosSrv,
        "readTodosStream" : readTodosStreamSrv
    });

//server.start(); (Deprecated function in gRPC-js)

//call = Request coming from the Client
//callback  =  Response sending to the Client
const todos = [];
function createTodoSrv(call, callback){
    const todoItem  ={
        "id" : todos.length + 1,
        "text" : call.request.text //Reading the 3rd argument while running "node client.js 3rd_argument" at Terminal
    }
    todos.push(todoItem);
    callback(null, todoItem);
    //console.log(call);
}
//Incase of sending data as an array format but not recommended
function readTodosSrv(call, callback){
    callback(null, {"items" : todos} );
}
//Always better to send data from server as Stream rather than sending all at once
function readTodosStreamSrv(call, callback){
    todos.forEach(t => call.write(t));
    call.end();
}