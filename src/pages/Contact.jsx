import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Asterisk, Check, Copy, LinkedinLogo, WhatsappLogo } from '@phosphor-icons/react';
import { profile } from '../data';
import { site, WHATSAPP_URL } from '../site';
import { Title } from '../ui.jsx';

// The contact form posts to Web3Forms when `VITE_WEB3FORMS_KEY` is set at
// build time. Without a key there is no backend at all, so the button falls
// back to the mailto draft and says exactly that. A failed send falls back to
// the same draft instead of swallowing the message.
const mailtoDraft = (data) => {
  const subject = `${data.get('topic')} — dari ${data.get('name')}`;
  const body = `Halo Anung,\n\n${data.get('message')}\n\nSalam,\n${data.get('name')}\n${data.get('email')}`;
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

function Contact() {
  const hasBackend = site.formKey !== '';
  const [copyState, setCopyState] = useState('idle');
  // idle · sending · sent · failed · drafted (the no-backend handoff)
  const [status, setStatus] = useState('idle');
  const [draft, setDraft] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopyState('copied'); }
    catch { setCopyState('failed'); }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState('idle'), 4000);
  };
  const send = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    // Honeypot: a human never sees this field, so anything in it is a bot.
    // Stay silent rather than explain the trap.
    if (String(data.get('website') ?? '') !== '') return;
    const href = mailtoDraft(data);
    setDraft(href);
    if (!hasBackend) {
      setStatus('drafted');
      window.location.href = href;
      return;
    }
    setStatus('sending');
    try {
      const response = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: site.formKey,
          subject: `${data.get('topic')} — dari ${data.get('name')}`,
          from_name: data.get('name'),
          name: data.get('name'),
          email: data.get('email'),
          topic: data.get('topic'),
          message: data.get('message'),
          botcheck: false,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true) throw new Error(result.message || `HTTP ${response.status}`);
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('failed');
    }
  };
  const statusText = status === 'sending' ? 'Mengirim pesan...'
    : status === 'sent' ? `Pesan terkirim ke ${profile.email}. Saya membacanya dari sana.`
    : status === 'failed' ? `Pesan belum terkirim. Pengiriman otomatis gagal, jadi silakan pakai draf email di bawah atau kirim langsung ke ${profile.email}.`
    : status === 'drafted' ? `Draf email siap dibuka. Jika aplikasi email tidak terbuka, kirim pesan langsung ke ${profile.email}.`
    : '';
  return <>
    <section className="page-heading contact-heading wrap"><p className="eyebrow hero-enter">KONTAK</p><Title lines={['Ada peluang', 'pekerjaan?']} /><p className="page-description hero-enter">Saya sedang aktif mencari lowongan dan peluang kerja di bidang pemasaran afiliasi dan digital marketing. Silakan hubungi saya melalui email, WhatsApp, atau LinkedIn untuk membahas posisi yang tersedia.</p></section>
    <section className="contact-grid wrap"><div className="contact-info hero-enter"><Asterisk className="contact-star" weight="bold" aria-hidden="true" data-spin /><h2>Hubungi saya di sini.</h2><div className="email-line"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="icon-button" onClick={copyEmail} aria-label="Copy email">{copyState === 'copied' ? <Check /> : <Copy />}</button></div><p className="copy-status" role="status">{copyState === 'copied' ? 'Email berhasil disalin.' : copyState === 'failed' ? 'Email belum bisa disalin. Silakan salin alamat di atas secara manual.' : ' '}</p><a href={WHATSAPP_URL} className="contact-social" target="_blank" rel="noreferrer"><WhatsappLogo size={22} />WhatsApp <ArrowUpRight size={20} /></a><a href={profile.linkedin} className="contact-social" target="_blank" rel="noreferrer"><LinkedinLogo size={22} />LinkedIn <ArrowUpRight size={20} /></a><a href={`tel:${profile.phone}`} className="contact-social">+62 813 8811 6739 <ArrowUpRight size={20} /></a><p className="contact-location">Bekasi, Jawa Barat, Indonesia</p></div>
      <form className="contact-form hero-enter" onSubmit={send}><div className="form-row"><label>Nama<input name="name" autoComplete="name" required maxLength={100} placeholder="Nama lengkap" /></label><label>Email<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="nama@email.com" /></label></div><label>Topik pesan<select name="topic" defaultValue="Lowongan pekerjaan"><option>Lowongan pekerjaan</option><option>Peluang kerja</option><option>Kerja sama promosi</option><option>Bertukar ide</option></select></label><label>Pesan<textarea name="message" required minLength={10} maxLength={3000} rows={4} placeholder="Halo Anung, saya ingin membahas..." /></label><div className="form-trap" aria-hidden="true"><label>Situs web<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div><div className="form-footer"><p>{hasBackend ? <>Pesan dikirim ke email saya lewat layanan formulir Web3Forms.<br />Situs ini tidak menyimpan pesan Anda.</> : <>Tombol ini membuka draf di aplikasi email.<br />Untuk mengirim pesan, tekan tombol kirim di aplikasi email.</>}</p><button className="button" type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'}>{hasBackend ? (status === 'sending' ? 'Mengirim...' : 'Kirim pesan') : 'Buka draf email'} <ArrowUpRight size={20} /></button></div><p className="form-status" data-status={status} role="status">{statusText}</p>{status === 'failed' && draft !== '' && <p className="form-fallback"><a className="text-link" href={draft}>Buka draf email <ArrowUpRight size={18} /></a></p>}</form></section>
    <div className="contact-signoff wrap" data-reveal="up" data-reveal-kind="text"><span>Terima kasih telah mengunjungi portofolio saya.</span><span className="signature">Anung.</span></div>
  </>;
}

export default Contact;
