const AWS = require("aws-sdk");
const axios = require("axios");

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME;
// URL of a service to test
const url = process.env.URL;

// CloudWatch client
const cloudwatch = new AWS.CloudWatch();

exports.handler = async (event) => {
  let requestWasSuccessful;

  const startTime = timeInMs();
  const response = await axios.get(url);
  const endTime = timeInMs();

  // / Example of how to write a single data point
  //

  await cloudwatch
    .putMetricData({
      MetricData: [
        {
          MetricName: "Service Name", // Use different metric names for different values, e.g. 'Latency' and 'Successful'
          Dimensions: [
            {
              Name: "Service Name",
              Value: serviceName,
            },
          ],
          Unit: "None", // 'Count' or 'Milliseconds'
          Value: 0,
        },
      ],
      Namespace: "Udacity/Serveless",
    })
    .promise();

  await cloudwatch
    .putMetricData({
      MetricData: [
        {
          MetricName: "Latency", // Use different metric names for different values, e.g. 'Latency' and 'Successful'
          Dimensions: [
            {
              Name: "Start Time",
              Value: startTime.toString(),
            },
            {
              Name: "End Time",
              Value: endTime.toString(),
            },
          ],
          Unit: "Milliseconds", // 'Count' or 'Milliseconds'
          Value: endTime - startTime, // Total value
        },
      ],
      Namespace: "Udacity/Serveless",
    })
    .promise();

  await cloudwatch
    .putMetricData({
      MetricData: [
        {
          MetricName: "Status", // Use different metric names for different values, e.g. 'Latency' and 'Successful'
          Dimensions: [
            {
              Name: "Status",
              Value: response.status.toString(),
            },
          ],
          Unit: "None", // 'Count' or 'Milliseconds'
          Value: response.status,
        },
      ],
      Namespace: "Udacity/Serveless",
    })
    .promise();
};

function timeInMs() {
  return new Date().getTime();
}
