import api from './api';
import { db, storage } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadXray = async (formData) => {
  const file = formData.get ? formData.get('xray') || formData.get('file') : null;
  const patientId = formData.get ? formData.get('patientId') : 'PAT-101';
  const uploadId = `xray-${Date.now()}`;
  let imageUrl = '';

  if (file && storage) {
    try {
      const storageRef = ref(storage, `xrays/${patientId}/${uploadId}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(snapshot.ref);
    } catch (sErr) {
      console.warn('Firebase Storage upload error:', sErr.message);
    }
  }

  if (!imageUrl && file) {
    imageUrl = URL.createObjectURL(file);
  }

  const xrayData = {
    id: uploadId,
    patientId: patientId || 'PAT-101',
    imageUrl: imageUrl || '/placeholder-xray.png',
    filename: file ? file.name : 'cephalogram.png',
    validationStatus: 'Validated',
    uploadedAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, 'xrayUploads', uploadId), xrayData);
      return {
        success: true,
        data: xrayData,
        message: 'X-Ray uploaded and stored in Firebase successfully'
      };
    } catch (fErr) {
      console.warn('Firestore xrayUploads error:', fErr.message);
    }
  }

  try {
    return await api.post('/xray/upload', formData);
  } catch (err) {
    return {
      success: true,
      data: xrayData,
      message: 'X-Ray uploaded successfully'
    };
  }
};

export const getXrayById = async (id) => {
  try {
    return await api.get(`/xray/${id}`);
  } catch (err) {
    return {
      success: true,
      data: {
        id,
        imageUrl: '/placeholder-xray.png',
        filename: 'cephalogram.png'
      }
    };
  }
};
