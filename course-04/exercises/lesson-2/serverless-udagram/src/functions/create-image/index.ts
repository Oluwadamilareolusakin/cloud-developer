// import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "groups",
        cors: true,
        request: {
          parameters: {
            querystrings: {
              limit: false,
              nextKey: false,
            },
          },
          // schemas: {
          //   "application/json": schema,
          // },
        },
      },
    },
  ],
};
