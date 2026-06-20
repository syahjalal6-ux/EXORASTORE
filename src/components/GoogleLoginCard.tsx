/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Shield, ArrowRight, Chrome } from 'lucide-react';
import { dbService } from '../lib/supabaseClient';

interface GoogleLoginCardProps {
  onLoginSuccess?: (user: any) => void;
}

export default function GoogleLoginCard({ onLoginSuccess }: GoogleLoginCardProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const user = await dbService.auth.signInWithGoogle();
      if (user && onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (e) {
      console.error('Sign in failed:', e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div id="google-login-panel" className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-zinc-150 p-8 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
        <Chrome className="w-8 h-8 stroke-[1.8]" />
      </div>
      
      <div className="space-y-2">
        <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Akses Akun Terpusat</span>
        <h3 className="text-xl font-bold text-zinc-950 font-sans tracking-tight">Koneksi Dashboard Penjual</h3>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
          Masuk menggunakan akun Google Anda untuk mengelola produk secara privat, melacak transaksi, dan menikmati akses komunikasi pelanggan real-time.
        </p>
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2.5 text-left text-xs">
        <div className="flex items-start gap-2.5">
          <span className="text-blue-500 mt-0.5 font-bold font-mono">✓</span>
          <span className="text-zinc-650">Aman dan terenkripsi menggunakan Google OAuth & Supabase Auth.</span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="text-blue-500 mt-0.5 font-bold font-mono">✓</span>
          <span className="text-zinc-650">Kelola toko unik milik Anda sendiri tanpa campur tangan orang lain.</span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="text-blue-500 mt-0.5 font-bold font-mono">✓</span>
          <span className="text-zinc-650">Sinkronisasi data otomatis yang persisten ke Database PostgreSQL cloud.</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoggingIn}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-blue-500/10 cursor-pointer active:scale-98 transition-all"
      >
        {isLoggingIn ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Chrome className="w-4 h-4 shrink-0" />
            <span>Masuk dengan Google Auth</span>
          </>
        )}
      </button>

      <div className="pt-2 text-[10px] text-zinc-400 font-mono flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-zinc-400" />
        <span>Strictly Google Auth-Only authentication</span>
      </div>
    </div>
  );
}
