"use client";

import React, { useState } from 'react';

export default function UploadDarshan() {
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select an image');

    setUploading(true);
    setMessage('Compressing and uploading...');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption);

    try {
      const res = await fetch('/api/upload-darshan', {
        method: 'POST',
        body: formData, // Sending multipart form data
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Darshan uploaded successfully!');
        setImageFile(null);
        setCaption('');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>🙏 Upload Daily Darshan</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Select Darshan Photo:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImageFile(e.target.files[0])} 
            required
            style={{ display: 'block', marginTop: '5px' }}
          />
        </div>

        <div>
          <label>Caption (Optional):</label>
          <input 
            type="text" 
            placeholder="e.g. Mangala Aarti Darshan" 
            value={caption} 
            onChange={(e) => setCaption(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={uploading}
          style={{ padding: '10px', background: '#ff9933', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {uploading ? 'Processing...' : 'Upload Darshan'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}