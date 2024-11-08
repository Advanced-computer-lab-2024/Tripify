import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

const storage = new GridFsStorage({
  url: "mongodb+srv://anastamer136:WiRCmFKq4hmIe7DG@cluster0.b5hrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  file: (req, file) => {
    return new Promise((resolve, _reject) => {
      const fileInfo = {
        filename: file.originalname,
        bucketName: "uploads",
      };
      resolve(fileInfo);
    });
  },
});

export const upload = multer({ storage });
