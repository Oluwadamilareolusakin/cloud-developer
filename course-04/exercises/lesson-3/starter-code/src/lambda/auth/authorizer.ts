import {
  CustomAuthorizerEvent,
  CustomAuthorizerHandler,
  CustomAuthorizerResult,
} from "aws-lambda";

import { verifyToken, extractUserId } from "../../utils";

export const handler: CustomAuthorizerHandler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const accessToken = getTokenFromTokenString(event.authorizationToken);
    await _verifyToken(accessToken);

    const userId = extractUserId(accessToken);

    console.log("Returning", policy("Allow", userId));

    return policy("Allow", userId);
  } catch (e) {
    console.log("Returning", policy("Deny"));
    console.log("Error message: ", e.message);
    return policy("Deny");
  }
};

const policy = (effect: "Allow" | "Deny", userId: string = "user") => {
  return {
    principalId: userId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Action: "execute-api:Invoke",
          Resource: "*",
        },
      ],
    },
  };
};

const _verifyToken = async (token: string) => {
  await verifyToken(token);
};

const getTokenFromTokenString = (tokenString) => {
  if (!tokenString) throw new Error("Invalid authorization header");

  if (!tokenString.toLowerCase().startsWith("bearer ")) {
    throw new Error("Invalid Token");
  }

  const accessKey = tokenString.split(" ")[1];

  if (!accessKey) throw new Error("Invalid Token");

  return accessKey;
};
