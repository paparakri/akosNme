// firebaseImageOps.js

/* THIS IS THE CODE IN THE COMPONENT FOR UPLOADING
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const file = e.target[0]?.files[0];
      if (!file) return;

      const { downloadURL, fileName } = await uploadImage(file);
      setImgUrl(downloadURL);
      
      // You might want to save the fileName to your database here
      // so you can retrieve the image later using getImage(fileName)

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }
  };
*/

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import storage from "./firebaseConfig"; // Assuming you have a separate file for Firebase configuration

export const uploadImage = (file: Blob | Uint8Array | ArrayBuffer, folder = "profilePics") => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const newName = self.crypto.randomUUID();
    const storageRef = ref(storage, `${folder}/${newName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        // You can use this to update a progress bar in the UI
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

export const getImage = async (fileName: any, folder = "profilePics") => {
  try {
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error retrieving image:", error);
    throw error;
  }
};