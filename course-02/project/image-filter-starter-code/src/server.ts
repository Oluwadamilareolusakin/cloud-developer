import express, { Response, Request } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req: Request, res: Response) => {
    let { image_url }: { image_url:string } = req.query;

    if (!image_url) {
      return res
        .status(400)
        .send({ message: "Required image_url parameter not provided" });
    }

    let filePath: string = await filterImageFromURL(image_url);

    res.status(200).sendFile(filePath, (err: Error) => {
      if (err) {
        res
          .status(200)
          .send({ message: "Could not filter that image, sorry!" });
      }

      deleteLocalFiles([filePath]);
    });
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
