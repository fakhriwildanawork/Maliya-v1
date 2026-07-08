import app from "../server.js";

export const maxDuration = 60; // Max allowed by plan, ensures Gemini has enough time
export const config = {
  api: {
    bodyParser: false, // Let Express handle the body parsing (e.g. 50mb limit)
  },
};

export default app;
