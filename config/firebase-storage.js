const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase-admin/storage');
const admin = require('firebase-admin');

const bucket = admin.storage().bucket();

async function uploadImage(file, folder = 'achievements') {
  try {
    const fileName = `${folder}/${Date.now()}_${file.originalname}`;
    const fileRef = bucket.file(fileName);
    
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype
      }
    });
    
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });
    
    return {
      url,
      publicId: fileName
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

async function deleteImage(publicId) {
  try {
    const fileRef = bucket.file(publicId);
    await fileRef.delete();
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

module.exports = { uploadImage, deleteImage };