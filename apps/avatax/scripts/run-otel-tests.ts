const url = "http://localhost:3000/api/manifest";
const numberOfRequests = 10;
const delayBetweenRequests = 20000; // 20 seconds in milliseconds

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendRequest(i: number) {
  try {
    const response = await fetch(url);
    const data = await response.text();

    console.log(`Request ${i + 1} completed. Response:`, data);
  } catch (error) {
    console.error(`Request ${i + 1} failed:`, error);
  }
}

async function sendMultipleRequests() {
  console.log(
    `Sending ${numberOfRequests} requests to ${url}  with ${
      delayBetweenRequests / 1000
    } seconds delay between each`,
  );

  for (let i = 0; i < numberOfRequests; i++) {
    if (i > 0) {
      console.log(`Waiting for ${delayBetweenRequests / 1000} seconds before next request...`);
      await delay(delayBetweenRequests);
    }
    await sendRequest(i);
  }

  console.log("All requests completed");
}

sendMultipleRequests();
