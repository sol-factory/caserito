import { CONFIG } from "@/config/constanst";

export const getPaypalToken = async () => {
  // Replace these with your actual CLIENT_ID and CLIENT_SECRET
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET_KEY;
  // Encode CLIENT_ID:CLIENT_SECRET in Base64
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${credentials}`,
  };

  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });
  try {
    const res = await fetch(`${CONFIG.paypalBaseApiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: headers,
      body: body.toString(),
    });
    const result = await res.json();

    return result.access_token;
  } catch (error) {
    return error;
  }
};
