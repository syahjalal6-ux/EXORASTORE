/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, X, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { dbService } from '../lib/supabaseClient';

interface ImageUploaderProps {
  label?: string;
  images: string[];
  maxCount?: number;
  onImagesChange: (updatedImages: string[]) => void;
  accountTier?: 'free' | 'pro';
}

export default function ImageUploader({
  label = 'Foto Produk',
  images = [],
  maxCount = 99,
  onImagesChange,
  accountTier = 'free'
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free Tier constraint: strictly maximum 2 photos per product
  const tierMax = accountTier === 'free' ? Math.min(maxCount, 2) : maxCount;
  const isLimitReached = images.length >= tierMax;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLimitReached) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLimitReached) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFiles(Array.from(files));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
    }
  };

  const uploadFiles = async (fileList: File[]) => {
    setIsUploading(true);
    const uploadedUrls: string[] = [...images];

    for (const file of fileList) {
      if (uploadedUrls.length >= tierMax) {
        break;
      }
      try {
        const url = await dbService.storage.upload(file);
        uploadedUrls.push(url);
      } catch (err) {
        console.error('Failed to upload file:', err);
      }
    }

    onImagesChange(uploadedUrls);
    setIsUploading(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-700 block uppercase tracking-wider">{label}</label>
        <span className="text-[10px] text-zinc-400 font-mono">
          {images.length} / {tierMax} (Limit {accountTier.toUpperCase()})
        </span>
      </div>

      {/* Warning limitation panel */}
      {accountTier === 'free' && (
        <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2 text-zinc-650">
          <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed">
            <span className="font-bold text-zinc-900">Akun Free Terbatas:</span> Maksimal <span className="font-bold text-blue-600">2 foto</span> per produk. Upgrade ke plan Pro untuk upload foto sebanyak-banyaknya tanpa batas!
          </p>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLimitReached && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${
          isLimitReached 
            ? 'border-zinc-200 bg-zinc-50 cursor-not-allowed opacity-70' 
            : isDragging
              ? 'border-blue-500 bg-blue-50/50' 
              : 'border-zinc-300 hover:border-zinc-400 bg-white'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*"
          multiple={tierMax > 1}
          disabled={isLimitReached}
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-medium">Sedang mengunggah galeri...</p>
          </div>
        ) : isLimitReached ? (
          <div className="space-y-1">
            <ImageIcon className="w-5 h-5 text-zinc-400 mx-auto" />
            <p className="text-xs text-zinc-500 font-bold">Slot foto telah penuh ({images.length} foto)</p>
            <p className="text-[10px] text-zinc-400">Hapus salah satu foto untuk mengganti</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Upload className="w-6 h-6 text-zinc-400 mx-auto animate-pulse" />
            <p className="text-xs text-zinc-700 font-semibold">Tarik & lepas foto di sini, atau <span className="text-blue-500">jelajahi berkas</span></p>
            <p className="text-[10px] text-zinc-400">Format PNG, JPG, GIF hingga 10MB</p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-3">
          {images.map((imgUrl, index) => (
            <div key={index} className="relative aspect-square bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden group">
              <img src={imgUrl} alt={`gallery-${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-500 text-zinc-700 hover:text-white rounded-full shadow-xs transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] font-bold text-white text-center py-0.5">
                {index === 0 ? 'Sampul' : `Foto ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
