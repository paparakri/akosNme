const { ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage");
const { storage } = require("../config/firebaseConfig");

const uploadImage = ({ file, fileName, folderPath, contentType }) => {
  return new Promise((resolve, reject) => {
      if (!file) {
          reject(new Error("No file provided"));
          return;
      }

      // Get file extension from original content type
      const extension = contentType ? `.${contentType.split('/')[1]}` : '.jpg';
      
      // Generate a unique filename if not provided, now with extension
      const newName = fileName ? 
          (fileName.includes('.') ? fileName : `${fileName}${extension}`) : 
          `${crypto.randomUUID()}${extension}`;

      const storageRef = ref(storage, `${folderPath}${newName}`);

      // Create metadata object with content type
      const metadata = {
          contentType: contentType || 'image/jpeg'
      };

      // Create upload task with buffer and metadata
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
          "state_changed",
          (snapshot) => {
              const progress = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              console.log(`Upload progress: ${progress}%`);
          },
          (error) => {
              console.error("Upload error:", error);
              reject(error);
          },
          async () => {
              try {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve({ downloadURL, fileName: newName });
              } catch (error) {
                  console.error("Error getting download URL:", error);
                  reject(error);
              }
          }
      );
  });
};

const getImage = async (fileName, folderPath) => {
  try {
    const storageRef = ref(storage, `${folderPath}${fileName}`);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error retrieving image:", error);
    throw error;
  }
};

// Helper function to get file extension based on content type
const getFileExtension = (contentType) => {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg'
  };
  return extensions[contentType] || '.jpg';
};

module.exports = { uploadImage, getImage };