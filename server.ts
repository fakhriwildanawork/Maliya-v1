import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "stream";
import multer from "multer";
import pg from "pg";
const { Client } = pg;

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.TIGRIS_STORAGE_ENDPOINT || "https://t3.storage.dev",
  credentials: {
    accessKeyId: process.env.TIGRIS_STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.TIGRIS_STORAGE_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

const upload = multer({ storage: multer.memoryStorage() });

import { analyzeReceipt } from "./src/logic/services/aiService";

const app = express();
app.use(express.json({ limit: '50mb' }));

async function startServer() {
  const PORT = 3000;

  // API Route: AI Receipt Analysis
  app.post("/api/ai/analyze-receipt", async (req, res) => {
    try {
      const { image, context } = req.body;
      if (!image) return res.status(400).json({ error: "Image is required" });
      
      const result = await analyzeReceipt(image, context);
      res.json(result);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze receipt" });
    }
  });

  // API Route: Tigris S3 Image Proxy Stream
  app.get("/api/images/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const bucketName = process.env.TIGRIS_STORAGE_BUCKET;

      if (!bucketName) {
        res.status(500).json({ error: "Bucket not configured" });
        return;
      }

      const response = await s3Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }));

      if (response.ContentType) res.setHeader("Content-Type", response.ContentType);
      if (response.ContentLength) res.setHeader("Content-Length", response.ContentLength);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      if (response.Body) {
        (response.Body as Readable).pipe(res);
      } else {
        res.status(404).send("File tidak ditemukan");
      }
    } catch (error: any) {
      if (error.name === "NoSuchKey") {
        res.status(404).send("File tidak ditemukan");
      } else {
        console.error("Error fetching image:", error);
        res.status(500).send("Gagal mengambil gambar");
      }
    }
  });

  // API Route: Upload Image to Tigris S3
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const bucketName = process.env.TIGRIS_STORAGE_BUCKET;
      if (!bucketName) {
        res.status(500).json({ error: "Bucket not configured" });
        return;
      }

      const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      }));

      const imageUrl = `/api/images/${filename}`;
      res.json({ url: imageUrl, filename });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Gagal mengupload gambar" });
    }
  });

  // API Route: Database Synchronization
  app.post("/api/sync-database", async (req, res) => {
    try {
      const dbUrl = process.env.SUPABASE_DB_URL;
      
      if (!dbUrl) {
        res.status(500).json({ error: "SUPABASE_DB_URL is not configured in environment variables." });
        return;
      }

      const client = new Client({
        connectionString: dbUrl,
      });

      await client.connect();
      
      const dbDir = path.join(process.cwd(), 'database');
      const files = await fs.readdir(dbDir);
      
      for (const file of files) {
        if (file.endsWith('.sql')) {
          const sqlPath = path.join(dbDir, file);
          const sqlContent = await fs.readFile(sqlPath, 'utf8');
          
          try {
            await client.query(sqlContent);
            console.log(`Executed: ${file}`);
          } catch (queryError: any) {
             console.error(`Error executing ${file}:`, queryError);
             await client.end();
             res.status(500).json({ error: `Failed to execute ${file}: ${queryError.message}` });
             return;
          }
        }
      }
      
      // Reload Supabase schema cache
      try {
        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log("PostgREST schema cache reloaded.");
      } catch (e) {
        console.error("Failed to reload schema cache:", e);
      }
      
      await client.end();
      res.json({ message: "All database schema files synchronized successfully." });
    } catch (error: any) {
      console.error("Database sync error:", error);
      res.status(500).json({ error: error.message || "Failed to synchronize database" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
