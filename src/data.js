// Public portfolio facts transcribed from the CV supplied by the owner.
// Do not present outreach targets as sales outcomes or coordination as sole ownership.
// Evidence slots: `placeholder: true` means the real material is not published
// yet and the cover is an abstract illustration. Swapping in a real asset means
// dropping the file at the same `src` path and deleting `placeholder: true`.
// It never means editing JSX, and the honest caption stays until the flag goes.
export const profile = {
  name: 'Anung Hanindhita Ramadhan',
  email: 'anungramadhan17@gmail.com',
  phone: '+6281388116739',
  linkedin: 'https://www.linkedin.com/in/anung-hanindhita-ramadhan',
  cv: '/documents/anung-ramadhan-cv.pdf',
};

export const experience = [
  {
    id: 'anymind', company: 'AnyMind Group', role: 'Affiliate Marketing Intern',
    period: 'Jan - Apr 2026', start: '2026-01', end: '2026-04', location: 'Jakarta', category: 'Pemasaran afiliasi',
    context: 'AnyMind Group adalah perusahaan teknologi BPaaS yang menyediakan solusi terpadu untuk pemasaran, e-commerce, transformasi digital, logistik, dan monetisasi kreator di 15 pasar Asia dan Timur Tengah.',
    title: 'Mengelola mitra afiliasi Unicharm dan acara Pantene.',
    summary: 'Saya menghubungi calon mitra afiliasi, menangani pengiriman sampel, dan memantau penyelesaian konten. Saya juga mengoordinasikan undangan dan kehadiran mitra dalam acara Pantene Affiliate Gathering.',
    stats: [{ value: '150', label: 'mitra afiliasi baru dihubungi per hari' }, { value: '40', label: 'mitra afiliasi dikoordinasikan untuk acara' }],
    details: [
      'Menghubungi dan mengundang 150 calon mitra afiliasi setiap hari untuk bergabung dengan komunitas afiliasi Unicharm.',
      'Menangani pengiriman sampel dan memastikan penerimaannya, serta memantau pembuatan konten sesuai arahan dan lingkup pekerjaan yang disepakati.',
      'Menyusun laporan pertengahan dan akhir bulan tentang penjualan dan kinerja konten mitra afiliasi.',
      'Menghubungi 50 mitra afiliasi setiap hari untuk bergabung dengan jaringan kreator MCN AnyMind.',
      'Mengoordinasikan undangan dan kehadiran 40 mitra afiliasi dalam acara Pantene Affiliate Gathering.',
    ],
    evidence: {
      title: 'Dokumentasi',
      items: [
        {
          id: 'anymind-pantene', type: 'Foto tim',
          src: '/images/anymind-pantene-team.webp', width: 1200, height: 900,
          alt: 'Foto bersama sekitar dua puluh anggota tim AnyMind Group berpakaian nuansa krem, berdiri dan duduk di depan layar besar bertuliskan AnyMind x Pantene New Product Launch.',
          caption: 'Foto bersama tim AnyMind Group di acara AnyMind × Pantene New Product Launch. Saya ikut di tim pemasaran afiliasi selama periode ini; acara yang saya koordinasikan undangan dan kehadirannya adalah Pantene Affiliate Gathering.',
        },
      ],
    },
  },
  {
    id: 'anima-coordination', company: 'PT Sutan Vet Medika', role: 'Marketing Intern (Coordination Role)',
    period: 'Jan - Jul 2026', start: '2026-01', end: '2026-07', location: 'Bogor', category: 'Kerja sama KOL',
    context: 'PT Sutan Vet Medika adalah startup kesehatan hewan dengan merek Anima Companion. Suplemennya teruji klinis dan difokuskan pada imunitas, pengelolaan stres, kesehatan kulit, serta nafsu makan.',
    title: 'Membantu tim mengelola kerja sama Anima Companion.',
    summary: 'Anima Companion adalah merek suplemen kesehatan hewan. Saya membantu tim mengelola kerja sama KOL dan memantau kerja sama dengan mitra afiliasi Shopee serta TikTok.',
    stats: [{ value: '200', label: 'kerja sama KOL yang saya bantu kelola' }, { value: '150', label: 'mitra afiliasi dipantau di Shopee dan TikTok' }],
    details: [
      'Membantu mengelola 200 kerja sama KOL untuk kegiatan pemasaran afiliasi Anima Companion.',
      'Memantau kerja sama dengan 100 mitra afiliasi Shopee dan 50 mitra afiliasi TikTok untuk mendukung penjualan dan memperkenalkan produk.',
    ],
    // The 150 in the stat above is this sum and nothing else. Both parts stay
    // visible so the figure can never be read as 150 unique individuals.
    split: {
      total: 150,
      caption: 'Angka 150 di atas adalah penjumlahan dua platform, bukan hitungan orang unik.',
      parts: [{ platform: 'Shopee', value: 100 }, { platform: 'TikTok', value: 50 }],
    },
  },
  {
    id: 'anima-digital', company: 'PT Sutan Vet Medika', role: 'Digital Marketing Intern',
    period: 'Sep - Des 2025', start: '2025-09', end: '2025-12', location: 'Bogor', category: 'Pemasaran digital',
    context: 'PT Sutan Vet Medika adalah startup kesehatan hewan dengan merek Anima Companion. Suplemennya teruji klinis dan difokuskan pada imunitas, pengelolaan stres, kesehatan kulit, serta nafsu makan.',
    title: 'Membuat konten promosi dan mengelola mitra afiliasi.',
    summary: 'Saya membuat konten Instagram dan video promosi produk, bekerja sama dengan KOL, serta mengelola mitra afiliasi TikTok dan Shopee. Saya juga menyelenggarakan webinar B2B.',
    stats: [{ value: '30+', label: 'KOL terlibat dalam kegiatan promosi' }, { value: '100+', label: 'mitra afiliasi TikTok dan Shopee dikelola' }],
    details: [
      'Bekerja sama dengan lebih dari 30 KOL dalam kegiatan promosi.',
      'Merekrut dan mengelola lebih dari 100 mitra afiliasi TikTok dan Shopee, termasuk mengoordinasikan pekerjaan dan memantau kinerja mereka.',
      'Menyelenggarakan webinar B2B dengan lebih dari 15 peserta.',
      'Membuat lebih dari 4 konten Instagram, 3 video promosi produk, video profil perusahaan, dan video webinar B2B.',
    ],
    evidence: {
      title: 'Materi yang saya buat',
      items: [
        {
          id: 'konten-sosial', type: '4+ konten Instagram', placeholder: true,
          src: '/images/placeholder/konten-sosial.webp', width: 1200, height: 900,
          alt: 'Ilustrasi abstrak: lingkaran bordo dan hijau yang saling menumpuk di atas bidang krem.',
          caption: 'Materi asli belum dipublikasikan — ilustrasi sementara, bukan tangkapan layar konten.',
        },
        {
          id: 'video-produk', type: '3 video produk + video profil perusahaan', placeholder: true,
          src: '/images/placeholder/video-produk.webp', width: 1200, height: 900,
          alt: 'Ilustrasi abstrak: bidang hijau dengan gelombang krem dan satu lingkaran bordo.',
          caption: 'Materi asli belum dipublikasikan — ilustrasi sementara, bukan cuplikan video.',
        },
        {
          id: 'webinar-b2b', type: 'Webinar B2B 15+ peserta', placeholder: true,
          src: '/images/placeholder/webinar-b2b.webp', width: 1200, height: 900,
          alt: 'Ilustrasi abstrak: cincin krem sepusat di atas bidang bordo dengan satu titik hijau.',
          caption: 'Rekaman dan materi webinar belum dipublikasikan — ilustrasi sementara, bukan dokumentasi acara.',
        },
      ],
    },
  },
];

export const organizations = [
  { name: 'BEM SB IPB', role: 'Bendahara Departemen Sosial Politik', period: 'Mar - Nov 2024', detail: 'Mengelola anggaran departemen Rp600.000, menyusun 11 laporan keuangan bulanan termasuk rangkuman tengah dan akhir periode, menyiapkan laporan keuangan untuk 3+ program departemen, serta membimbing 5 peserta magang selama satu bulan.' },
  { name: 'IDEANATION', role: 'Kepala Divisi Logistik', period: 'Sep - Nov 2024', detail: 'Memimpin 7 staf logistik, menyediakan lebih dari 200 barang kebutuhan acara, dan menangani logistik untuk 6 acara utama.' },
  { name: 'ADDVENTURES 8.0', role: 'Staf Operasional', period: 'Agu - Sep 2024', detail: 'Mengadakan 20+ barang kebutuhan acara, berkoordinasi dengan 3+ vendor, membuat 5+ jenis dekorasi, dan menuntaskan 7+ misi respons cepat untuk kebutuhan logistik mendesak.' },
  { name: 'ABEST Internship Program', role: 'Event Division Intern', period: 'Sep - Nov 2023', detail: 'Membantu perencanaan dan pelaksanaan CEO Visit bersama Mirae Asset Sekuritas dengan lebih dari 30 peserta.' },
];

export const skills = [
  { title: 'Afiliasi & KOL', items: ['Pengelolaan mitra afiliasi', 'Kerja sama KOL', 'Koordinasi kegiatan promosi', 'Analisis kinerja afiliasi Shopee & TikTok'] },
  { title: 'Konten & desain', items: ['Perencanaan konten', 'Canva', 'CapCut', 'Adobe Photoshop'] },
  { title: 'Kerja tim & administrasi', items: ['Koordinasi lintas tim', 'Microsoft Office', 'Google Workspace', 'Pemecahan masalah'] },
];

// CV: "Bachelor of Business, 3.74/4.00", "Aug 2022 - Aug 2026".
export const education = {
  institution: 'IPB University', degree: 'Sarjana Bisnis', period: 'Agu 2022 - Agu 2026',
  gpa: 3.74, gpaMax: 4,
};

// CV: "English (Professional Working Proficiency - TOEFL ITP Score 583)".
// 310 and 677 are the lowest and highest possible TOEFL ITP total scores, the
// published range of the test itself. They are the axis, not a claim about Anung.
export const english = {
  score: 583, scaleMin: 310, scaleMax: 677,
  level: 'Professional Working Proficiency',
};
