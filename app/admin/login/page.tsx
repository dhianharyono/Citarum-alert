'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/admin/login')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace('/admin');
        }
      })
      .catch(() => { });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.replace('/admin');
        }, 500);
      } else {
        setErrorMsg(
          data.message || 'Login gagal. Periksa username dan password.',
        );
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#f5f6f5] text-[#173744] flex flex-col md:flex-row font-sans selection:bg-[#126b70] selection:text-white'>
      {/* ============================================================== */}
      {/* DESKTOP LEFT SIDEBAR (Figma Frame 15:4330 Identitas portal 540x960) */}
      {/* ============================================================== */}
      <div className='hidden md:flex w-[460px] lg:w-[540px] bg-[#173744] text-white p-10 lg:p-14 flex-col justify-between shrink-0 shadow-xl'>
        {/* Brand / Logo */}
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded bg-white flex items-center justify-center shrink-0 shadow-xs'>
            <svg
              className='w-6 h-6 text-[#173744]'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                d='M2 6c3-3 5-3 8 0s5 3 8 0 5-3 8 0M2 12c3-3 5-3 8 0s5 3 8 0 5-3 8 0M2 18c3-3 5-3 8 0s5 3 8 0 5-3 8 0'
                strokeWidth='2.2'
                strokeLinecap='round'
              />
            </svg>
          </div>
          <div className='flex flex-col'>
            <span className='font-bold text-xl leading-tight text-white tracking-tight'>
              Citarum Alert
            </span>
            <span className='text-[10px] tracking-widest text-[#b8cdce] font-semibold uppercase'>
              ADMIN PANEL
            </span>
          </div>
        </div>

        {/* Mandat Layanan */}
        <div className='space-y-4 my-auto py-12'>
          <span className='text-xs font-semibold text-[#b8cdce] tracking-widest uppercase block'>
            KABUPATEN BANDUNG
          </span>
          <h2 className='text-[28px] lg:text-[32px] font-bold leading-snug text-white'>
            Satu ruang kerja untuk pengawasan Citarum Alert.
          </h2>
          <p className='text-sm text-[#c3d4d4] leading-relaxed max-w-md'>
            Telemetri sungai, laporan warga, dan konfigurasi sistem dalam akses
            yang terkendali.
          </p>
        </div>

        {/* Batas Akses / Security Notice */}
        <div className='p-4 rounded border border-white/20 bg-white/5 flex items-start gap-3 text-xs text-[#c3d4d4]'>
          <ShieldCheck className='w-5 h-5 text-[#b8cdce] shrink-0 mt-0.5' />
          <p className='leading-relaxed'>
            Portal internal untuk pengelolaan layanan. Informasi pemantauan
            warga tersedia di peta publik.
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE TOP BAR (Figma Frame 15:4380) */}
      {/* ============================================================== */}
      <div className='flex md:hidden h-16 px-4 bg-white border-b border-[#dce2e2] items-center justify-between shrink-0'>
        <div className='flex items-center gap-2.5'>
          <div className='w-8 h-8 rounded bg-[#173744] flex items-center justify-center shrink-0'>
            <svg
              className='w-5 h-5 text-white'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                d='M2 6c3-3 5-3 8 0s5 3 8 0 5-3 8 0M2 12c3-3 5-3 8 0s5 3 8 0 5-3 8 0M2 18c3-3 5-3 8 0s5 3 8 0 5-3 8 0'
                strokeWidth='2.2'
                strokeLinecap='round'
              />
            </svg>
          </div>
          <div className='flex flex-col'>
            <span className='font-bold text-base leading-tight text-[#172d3b]'>
              Citarum Alert
            </span>
            <span className='text-[9px] tracking-wider text-[#66757c] font-semibold uppercase'>
              ADMIN PANEL
            </span>
          </div>
        </div>

        <Link
          href='/'
          className='text-xs font-semibold text-[#126b70] hover:text-[#0e5458] flex items-center gap-1'
        >
          <ArrowLeft className='w-3.5 h-3.5' />
          <span>Peta Publik</span>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* MAIN LOGIN FORM AREA (Desktop Frame 15:4330 & Mobile Frame 15:4380) */}
      {/* ============================================================== */}
      <div className='flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 min-h-[calc(100vh-64px)] md:min-h-screen overflow-y-auto'>
        {/* Top Back Link (Desktop only) */}
        <div className='hidden md:flex justify-start'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-xs font-semibold text-[#172d3b] hover:text-[#126b70] bg-white border border-[#dce2e2] px-3.5 py-2 rounded shadow-2xs transition group cursor-pointer'
          >
            <ArrowLeft className='w-3.5 h-3.5 text-[#172d3b] group-hover:-translate-x-0.5 transition-transform' />
            <span>Kembali ke Peta Publik Citarum Alert</span>
          </Link>
        </div>

        {/* Center Login Card (Frame 15:4330 Panel masuk 440x550) */}
        <div className='w-full max-w-[440px] mx-auto my-auto py-6'>
          <div className='bg-white border border-[#dce2e2] rounded-md shadow-xs p-6 sm:p-8'>
            {/* Header / Badge */}
            <div className='space-y-2 mb-6'>
              <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#eaf3f1] text-[#126b70] text-[11px] font-bold tracking-wider uppercase'>
                <ShieldCheck className='w-3.5 h-3.5' />
                <span>AKSES KHUSUS ADMIN</span>
              </div>
              <h1 className='text-2xl font-bold text-[#172d3b] tracking-tight'>
                Pusat Kendali Admin
              </h1>
              <p className='text-xs text-[#66757c] leading-relaxed'>
                Portal Pengawasan Sistem Citarum Alert. Masuk untuk mengelola
                data dan konfigurasi layanan.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className='mb-5 p-3 rounded bg-[#fbeeeb] border border-[#f5c6cb] flex items-start gap-2.5 text-xs text-[#b33e35] animate-in fade-in'>
                <AlertCircle className='w-4 h-4 text-[#b33e35] shrink-0 mt-0.5' />
                <span className='leading-snug'>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className='mb-5 p-3 rounded bg-[#eaf3f1] border border-[#c3e6cb] flex items-center gap-2 text-xs text-[#497665] animate-in fade-in'>
                <ShieldCheck className='w-4 h-4 text-[#497665]' />
                <span>Login berhasil. Mengalihkan ke dashboard...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Username Field */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-[#172d3b] block'>
                  Username Admin
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66757c]'>
                    <User className='w-4 h-4' />
                  </div>
                  <input
                    type='text'
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Masukkan username'
                    disabled={isLoading || isSuccess}
                    className='w-full h-11 pl-9 pr-3 text-xs bg-white border border-[#dce2e2] rounded focus:outline-none focus:border-[#126b70] focus:ring-1 focus:ring-[#126b70] text-[#173744] placeholder:text-[#66757c] transition'
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-[#172d3b] block'>
                  Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66757c]'>
                    <Lock className='w-4 h-4' />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Masukkan kata sandi'
                    disabled={isLoading || isSuccess}
                    className='w-full h-11 pl-9 pr-10 text-xs bg-white border border-[#dce2e2] rounded focus:outline-none focus:border-[#126b70] focus:ring-1 focus:ring-[#126b70] text-[#173744] placeholder:text-[#66757c] transition'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-[#66757c] hover:text-[#172d3b] cursor-pointer'
                  >
                    {showPassword ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isLoading || isSuccess}
                className='w-full h-11 mt-2 bg-[#126b70] hover:bg-[#0e5458] text-white font-semibold text-xs rounded shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Dashboard Admin</span>
                  </>
                )}
              </button>

              {/* Security Footnote */}
              <div className='pt-2 flex items-start gap-2 text-[11px] text-[#66757c] leading-relaxed'>
                <Lock className='w-3.5 h-3.5 text-[#66757c] shrink-0 mt-0.5' />
                <span>
                  Gunakan akun admin yang telah diberikan. Jaga kerahasiaan
                  kredensial Anda.
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Context Watermark */}
        <div className='text-center text-[11px] text-[#66757c] py-2'>
          Citarum Alert · Pusat Pengawasan Data &amp; Konfigurasi AI Bencana
        </div>
      </div>
    </div>
  );
}
