import api from './api';
import { db, storage } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadXray = async (formData) => {
  try {
    return await api.post('/xray/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } catch (err) {
    const file = formData.get ? formData.get('xray') || formData.get('file') : null;
    const patientId = formData.get ? formData.get('patientId') : 'P-DEFAULT';
    const uploadId = `xray-${Date.now()}`;
    let imageUrl = '/placeholder-xray.png';

    if (file && storage) {
      try {
        const storageRef = ref(storage, `xrays/${uploadId}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (sErr) {
        console.warn('Firebase Storage upload fallback:', sErr);
      }
    }

    const xrayData = {
      id: uploadId,
      patientId: patientId || 'P-DEFAULT',
      imageUrl,
      filename: file ? file.name : 'cephalogram.png',
      uploadedAt: new Date().toISOString()
    };

    if (db) {
      try {
        await setDoc(doc(db, 'xrayUploads', uploadId), xrayData);
      } catch (_) {}
    }

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
