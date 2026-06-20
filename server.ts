/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';


// Copy PWA icon if available at server startup
try {
  const iconSrc = path.join(process.cwd(), 'src/assets/images/exora_new_logo_1781954929441.jpg');
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const iconDest = path.join(publicDir, 'icon.jpg');
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, iconDest);
    console.log('[PWA Launch] Copied app-brand icon successfully to public/icon.jpg');
  }
} catch (e) {
  console.error('[PWA Launch] Non-critical icon copy warning:', e);
}

const app = express();
const PORT = 3000;

app.use(express.json());

// ---- BITESHIP API PROXY ENDPOINTS ----
  
  // 1. Calculate Shipping Rates
  app.post('/api/biteship/rates', async (req, res) => {
    const { originPostalCode, destinationPostalCode, weightGrams, couriers } = req.body;
    const apiKey = (req.headers['x-biteship-api-key'] as string) || process.env.VITE_BITESHIP_API_KEY || process.env.BITESHIP_API_KEY;

    if (apiKey && apiKey !== 'YOUR_BITESHIP_KEY') {
      try {
        const response = await fetch('https://api.biteship.com/v1/rates', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            origin_postal_code: originPostalCode || '40111',
            destination_postal_code: destinationPostalCode || '10110',
            weight: weightGrams || 1000,
            couriers: couriers || 'jne,sicepat,jnt'
          })
        });

        if (response.ok) {
          const result = await response.json();
          // Map to response format
          const formattedRates = (result.rates || []).map((r: any) => ({
            courier_code: r.courier_code,
            courier_name: r.courier_name,
            courier_service_name: r.courier_service_name,
            price: r.price,
            duration: r.duration
          }));
          return res.json(formattedRates);
        } else {
          console.error('Biteship API error response:', await response.text());
        }
      } catch (err) {
        console.error('Biteship connection error:', err);
      }
    }

    // High fidelity Indonesian Shipping Rate Simulation if API key is missing
    const dest = destinationPostalCode || '10110';
    const numValue = parseInt(dest.substring(0, 3)) || 100;
    
    // Deterministic prices based on destination postal code prefix
    const basePrice = 10000 + (numValue % 15) * 1000;

    const mockRates = [
      {
        courier_code: 'sicepat',
        courier_name: 'SiCepat',
        courier_service_name: 'Regular (REG)',
        price: basePrice,
        duration: '1-2 Hari'
      },
      {
        courier_code: 'jne',
        courier_name: 'JNE',
        courier_service_name: 'Regular (REG)',
        price: basePrice + 2000,
        duration: '2-3 Hari'
      },
      {
        courier_code: 'jnt',
        courier_name: 'J&T Express',
        courier_service_name: 'EZ Service',
        price: basePrice + 1000,
        duration: '1-3 Hari'
      }
    ];

    return res.json(mockRates);
  });

  // 2. Track Order Waybill
  app.get('/api/biteship/tracking/:waybill', async (req, res) => {
    const { waybill } = req.params;
    const courier = (req.query.courier as string) || 'jne';
    const apiKey = (req.headers['x-biteship-api-key'] as string) || process.env.VITE_BITESHIP_API_KEY || process.env.BITESHIP_API_KEY;

    if (apiKey && apiKey !== 'YOUR_BITESHIP_KEY') {
      try {
        const response = await fetch(`https://api.biteship.com/v1/trackings/${waybill}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          return res.json(result);
        }
      } catch (err) {
        console.error('Biteship track API connection error:', err);
      }
    }

    // High fidelity Simulated waybill lifecycle tracking
    const hours = new Date().getHours();
    const mockCheckpoints = [
      {
        title: 'Pesanan Diterima Penjual',
        description: 'Toko memproses pesanan dan mempackaging produk.',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        status: 'ordered'
      },
      {
        title: 'Paket Di-pickup Kurir',
        description: 'Kurir logistik menjemput barang dari hub gudang lokasi toko.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'manifested'
      },
      {
        title: 'Transit - Pusat Sortir Utama',
        description: 'Paket telah disortir dan dimasukkan ke kontainer pengiriman.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'transit'
      }
    ];

    // If order was created/accessed some time ago, simulate delivery!
    if (hours % 2 === 0) {
      mockCheckpoints.push({
        title: 'Sedang Diantar Kurir',
        description: 'Paket dibawa oleh kurir lokal menuju perumahan penerima.',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        status: 'transit'
      });
    }

    const mockResponse = {
      courier_name: courier.toUpperCase(),
      waybill_number: waybill,
      recipient_name: 'Fathur Rahman',
      status: hours % 2 === 0 ? 'transit' : 'delivered',
      checkpoints: mockCheckpoints.reverse()
    };

    return res.json(mockResponse);
  });


  // ---- GROQ AI CHAT & ANALYTICS PROXIES ----

  // 1. Groq Product Q&A Assistant for Buyers
  app.post('/api/groq/product-assistant', async (req, res) => {
    const { productName, productDescription, productPrice, question, chatHistory, shopPaymentRequisite, shopAiInstructions } = req.body;
    const apiKey = (req.headers['x-groq-api-key'] as string) || process.env.GROQ_API_KEY;

    let additionalRules = "";
    if (shopPaymentRequisite) {
      additionalRules += `\n- CATATAN REKENING & PEMBAYARAN TOKO (Gunakan jika pembeli bertanya rekening bank/pembayaran/transfer): ${shopPaymentRequisite}`;
    }
    if (shopAiInstructions) {
      additionalRules += `\n- BANK DATA & PENGETAHUAN TOKO (Rujukan utama menjawab pertanyaan/kebijakan toko): ${shopAiInstructions}`;
    }

    const basePrompt = `Anda adalah asisten belanja virtual AI yang ramah, sopan, dan persuasif untuk toko online di platform Exora.
Tugas Anda adalah menjawab pertanyaan pelanggan mengenai produk berikut:
- Nama Produk: ${productName}
- Deskripsi: ${productDescription}
- Harga: Rp ${productPrice?.toLocaleString('id-ID')}
${additionalRules}

Aturan Jawaban:
1. Jawablah menggunakan Bahasa Indonesia yang hangat, profesional, santun, dan meyakinkan.
2. Berikan informasi yang akurat berdasarkan deskripsi produk dan Bank Data Pengetahuan Toko.
3. Bantu membujuk pelanggan secara halus agar mereka yakin untuk membeli produk ini.
4. Jangan memberikan informasi fiktif yang tidak didukung oleh deskripsi, tapi Anda dapat memberikan saran logis yang relevan.
5. Jawab secara ringkas (maksimal 2-3 paragraf pendek) agar mudah dibaca di layar chat small screen.

Pertanyaan pembeli: "${question}"`;

    const messages = [
      { role: 'system', content: 'Anda adalah asisten belanja AI profesional untuk platform toko e-commerce Exora.' }
    ];

    if (Array.isArray(chatHistory)) {
      chatHistory.slice(-5).forEach(msg => {
        messages.push({
          role: msg.sender === 'buyer' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    messages.push({ role: 'user', content: basePrompt });

    // 1. Check if GROQ_API_KEY is active and valid for production
    if (apiKey && apiKey !== '' && apiKey !== 'YOUR_GROQ_KEY') {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages,
            temperature: 0.7,
            max_tokens: 512
          })
        });

        if (response.ok) {
          const result = await response.json();
          const aiText = result.choices?.[0]?.message?.content || '';
          return res.json({ answer: aiText, isSimulated: false });
        } else {
          console.error('Groq API error response:', await response.text());
        }
      } catch (err) {
        console.error('Groq connection error:', err);
      }
    }



    // High fidelity Indonesian fallback if BOTH keys are not configured
    let fallbackAnswer = `Terima kasih atas pertanyaan Anda tentang *${productName}*! \n\nBerdasarkan info produk kami, barang ini sangat premium dengan harga Rp ${productPrice?.toLocaleString('id-ID')}. Deskripsi produk: "${productDescription}". Ini opsi yang luar biasa dan sangat kami rekomendasikan untuk Anda!`;
    const lowercaseQ = question.toLowerCase();
    
    if ((lowercaseQ.includes('bayar') || lowercaseQ.includes('rek') || lowercaseQ.includes('transfer') || lowercaseQ.includes('bank') || lowercaseQ.includes('nomor rek') || lowercaseQ.includes('no rek')) && shopPaymentRequisite) {
      fallbackAnswer = `Untuk menyelesaikan pembayaran pesanan Anda, silakan lakukan transfer langsung ke rekening resmi toko kami berikut:\n\n*${shopPaymentRequisite}*\n\nSetelah melakukan pembayaran, jangan lupa sertifikatkan bukti transfer Anda ke admin WhatsApp kami ya Kak!`;
    } else if ((lowercaseQ.includes('aturan') || lowercaseQ.includes('garansi') || lowercaseQ.includes('retur') || lowercaseQ.includes('syarat') || lowercaseQ.includes('kebijakan') || lowercaseQ.includes('toko') || lowercaseQ.includes('info')) && shopAiInstructions) {
      fallbackAnswer = `Tentu, Kak! Berikut ini adalah panduan informasi & kebijakan resmi yang berlaku di toko kami:\n\n_${shopAiInstructions}_\n\nJika ada detail produk lain yang ingin ditanyakan, dengan senang hati asisten AI kami akan membantu Kakak!`;
    } else if (lowercaseQ.includes('ready') || lowercaseQ.includes('stok') || lowercaseQ.includes('ada')) {
      fallbackAnswer = `Halo! Produk *${productName}* saat ini ready stok dan siap dikirim kapan saja! Silakan langsung dimasukkan ke keranjang belanja Anda agar tidak kehabisan ya Kak.`;
    } else if (lowercaseQ.includes('kirim') || lowercaseQ.includes('ongkir') || lowercaseQ.includes('biteship')) {
      fallbackAnswer = `Tentu saja! Kami mendukung pilihan pengiriman super cepat menggunakan instrumen logistik terbaik. Ongkos kirim otomatis akan dihitung secara real-time saat Anda memasukkan alamat tujuan di halaman checkout.`;
    } else if (lowercaseQ.includes('diskon') || lowercaseQ.includes('murah') || lowercaseQ.includes('nego') || lowercaseQ.includes('kurang')) {
      fallbackAnswer = `Harga Rp ${productPrice?.toLocaleString('id-ID')} untuk *${productName}* sudah merupakan harga terbaik dengan kualitas premium yang ditawarkan, Kak. Namun, kumpulkan poin belanja Anda untuk potongan harga di kesempatan berikutnya ya!`;
    }

    return res.json({
      answer: fallbackAnswer,
      isSimulated: true
    });
  });

  // 2. Groq AI Analytics Insights & Business Consultant for Sellers
  app.post('/api/groq/analytics-insights', async (req, res) => {
    const { stats, question } = req.body;
    const apiKey = (req.headers['x-groq-api-key'] as string) || process.env.GROQ_API_KEY;

    if (!stats) {
      return res.status(400).json({ error: 'Missing statistical body.' });
    }

    const statsContext = `- Total Pendapatan / Sales: Rp ${stats.totalSales?.toLocaleString('id-ID')}
- Total Transaksi / Pesanan: ${stats.totalOrders}
- Rasio Konversi: ${stats.conversionRate || '2.4'}%
- Jumlah Produk Aktif: ${stats.activeProductsCount}
- Merchant Level: ${stats.currentTier?.toUpperCase()}`;

    const systemMsg = `Anda adalah seorang Konsultan E-commerce & Pertumbuhan Bisnis AI Senior untuk platform Exora Shop.
Tugas Anda adalah memberikan saran strategis, analisis data, dan rekomendasi pertumbuhan yang tajam kepada penjual berdasarkan statistik real-time toko mereka.
Berikan masukan taktis yang bisa langsung dipraktikkan (misal: strategi promosi, manajemen stok, peningkatan layanan).
Gunakan bahasa Indonesia yang profesional, penuh motivasi, ramah bisnis, berkharisma, dan berwawasan tinggi.
Gunakan format markdown dengan poin-poin tebal untuk keterbacaan yang maksimal.`;

    const userMsg = `Berikut adalah data statistik toko saya saat ini:
${statsContext}

Pertanyaan/permasalahan saya: "${question || 'Berikan saya analisis performa bisnis dan 3 langkah strategis utama untuk meningkatkan penjualan minggu ini.'}"`;

    // 1. Check if GROQ_API_KEY is configured for production-ready deployment
    if (apiKey && apiKey !== '' && apiKey !== 'YOUR_GROQ_KEY') {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemMsg },
              { role: 'user', content: userMsg }
            ],
            temperature: 0.6,
            max_tokens: 1024
          })
        });

        if (response.ok) {
          const result = await response.json();
          const aiText = result.choices?.[0]?.message?.content || '';
          return res.json({ answer: aiText, isSimulated: false });
        } else {
          console.error('Groq API error response:', await response.text());
        }
      } catch (err) {
        console.error('Groq connection error:', err);
      }
    }



    // Dynamic, professional simulated Indonesian fallback advice if BOTH keys are missing
    const fallbackAdvice = `### 📊 Analisis Performa Toko Exora (Simulasi Groq AI)

Berdasarkan metrik performa toko Anda (Pendapatan: **Rp ${stats.totalSales?.toLocaleString('id-ID')}** dengan **${stats.totalOrders} pesanan**), berikut adalah evaluasi dan langkah taktis konsultatif untuk Anda:

1. **Optimalkan Rasio Konversi (${stats.conversionRate || '3.2'}%)**
   * **Masalah**: Pelanggan berkunjung namun belum menyelesaikan pembayaran.
   * **Solusi**: Aktifkan fitur *Live Streaming Updates* serta hubungkan Biteship shipping rate otomatis untuk menghilangkan keraguan pembeli akibat biaya pengiriman yang tidak transparan. Modifikasi deskripsi produk agar menonjolkan jaminan originalitas/kepuasan pembeli.

2. **Daya Tarik Produk & Katalog**
   * Saat ini Anda mengelola **${stats.activeProductsCount} produk aktif** pada level **${stats.currentTier?.toUpperCase() || 'FREE'}**. 
   * Jika pada level Free, Anda dibatasi maksimal 2 foto. Pertimbangkan untuk upgrade ke **Exora Pro** untuk memajang galeri foto kualitas HD tanpa batas serta mengaktifkan Groq AI otomatis guna menjawab interaksi chat pembeli 24/7 saat Anda beristirahat.

3. **Inbound Marketing & Loyalitas Pelanggan**
   * Sediakan bonus poin belanja eksklusif. Di Exora, setiap poin belanja yang diberikan kepada pelanggan setia bertindak sebagai stimulus kuat bagi mereka untuk melakukan pemesanan ulang (*repeat order*).

*(Catatan: Konfigurasikan kunci **GROQ_API_KEY** di salah satu file lingkungan untuk mengaktifkan asisten AI Llama-3 secara real-time!)*`;

    return res.json({
      answer: fallbackAdvice,
      isSimulated: true
    });
  });


  // ---- VITE MIDDLEWARE CONFIGURATION ----
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    (async () => {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    })();
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if not running as a Vercel Serverless Function
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server boots successfully, routing traffic port: ${PORT}`);
    });
  }

export default app;
