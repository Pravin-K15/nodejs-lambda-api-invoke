import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretName = "your-apikey-secret"; // Replace with your actual secret name
const apiUrl = "https://your-api-endpoint/"; // Replace with your actual API URL
const apiMethod = "POST"; // Adjust based on your API (GET, POST, etc.)

async function fetchSecret() {
  const client = new SecretsManagerClient({ region: "ap-south-1" });

  try {
    console.log("Attempting to fetch secret:", secretName);
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT", // Use current version by default
      })
    );

    const secret = response.SecretString;
    console.log("Secret fetched successfully!");
    return secret;
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error; // Re-throw for further handling (optional)
  }
}

export const lambdaHandler = async (event, context) => {
  try {
    const apiKey = await fetchSecret();
    console.log("Fetched API key:", apiKey);

    // 1. Prepare the request data (optional)
    const requestData = {
      // Replace with your specific data if needed
      message: "Hello from Lambda hahaha!",
    };

    // 2. Send the request to the API
    const response = await fetch(apiUrl, {
      method: apiMethod,
      headers: {
        "Content-Type": "application/json", // Adjust if needed
        Authorization: apiKey ? `Bearer ${apiKey}` : "", // Add auth header if needed
      },
      body: JSON.stringify(requestData), // Include data if needed
    });
    console.log("API response:", response);
    // 3. Check for successful response
    if (!response.ok) {
      console.error("API request failed:", await response.text());
      throw new Error(`API request failed with status: ${response.status}`);
    }

    // 4. Process the API response (optional)
    const apiResponseData = await response.json();

    // 5. Build the Lambda response object
    const lambdaResponse = {
      statusCode: 200,
      body: JSON.stringify({
        message: "API call successful!",
        apiResponse: apiResponseData, // Include API response data if needed
      }),
    };

    return lambdaResponse;
  } catch (error) {
    console.error("Error calling API:", error);
    // You can modify the response here based on the error
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error calling external API" }),
    };
  }
};
