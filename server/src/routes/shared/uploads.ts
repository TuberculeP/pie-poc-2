import { Router } from "express";
import pg from "../../config/db.config";
import { Upload } from "../../config/entities/Upload";
import storage from "../../config/storage.config";

const uploadsRouter = Router();

uploadsRouter.post("/", storage.single("file"), async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const file = req.file; // Récupère le fichier traité par multer
  if (!file) {
    return res.status(400).json({ message: "No file provided" });
  }

  const uploadRepository = pg.getRepository(Upload);
  const upload = new Upload();
  upload.filename = file.filename;
  upload.user = req.user;
  upload.createdAt = new Date();
  upload.updatedAt = new Date();
  upload.isActive = true;
  await uploadRepository.save(upload);

  return res.status(201).json({
    message: "File uploaded successfully",
    url: `/public/uploads/${file.filename}`,
  });
});

export default uploadsRouter;
