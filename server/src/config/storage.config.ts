import multer from "multer";

const storage = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => {
      cb(null, "public/uploads");
    },
    filename: (_, file, cb) => {
      const newFileName = `${Date.now()}-${file.originalname}`
        .replaceAll(/\s+/g, "-")
        .toLowerCase();
      cb(null, newFileName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default storage;
