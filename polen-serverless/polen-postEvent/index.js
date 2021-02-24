'use strict';

var AWS = require('aws-sdk');
var documentClient = new AWS.DynamoDB.DocumentClient({'region': 'eu-west-1'}); 
const uuidv1 = require('uuid/v1');

exports.handler = function(event, context, callback) {
  console.log(event);
  if (event.body !== null && event.body !== undefined) {
    let body = JSON.parse(event.body)
    let id = uuidv1();
    if (event.body.id !== null && event.body.id !== undefined) {
        id = body.id;
    }

    var params = {
        Item: {
          id: id,
          date: body.date,
          organizer: body.organizer,
          students: body.students
        },
        TableName: "polen-events"
      };
      
  } else {
    const errResponse = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ Error: 400, detail : "Invalid parameter value in the request" })
      };
      callback(null, errResponse);
  }

  documentClient.put(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      const errResponse = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ Error: 500, device : "DynamoDB", detail : err })
      };
      callback(null, errResponse);
    } else {
      console.log("Success", params.Items);
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(params.Items)
      };
      callback(null, response);
    }
  });
  
};
