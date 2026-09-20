# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio.spec.js >> the CV can be read on the page without downloading it
- Location: tests/portfolio.spec.js:735:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Lewati ke konten" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e5]:
    - link "Anung, beranda" [ref=e6] [cursor=pointer]:
      - /url: "#/"
      - text: anung.
    - navigation "Navigasi utama" [ref=e7]:
      - link "Beranda" [ref=e8] [cursor=pointer]:
        - /url: "#/"
      - link "Pengalaman" [ref=e9] [cursor=pointer]:
        - /url: "#/pengalaman"
      - link "Tentang" [ref=e10] [cursor=pointer]:
        - /url: "#/tentang"
      - link "Kontak" [ref=e12] [cursor=pointer]:
        - /url: "#/kontak"
    - generic [ref=e13]:
      - button "Aktifkan mode gelap" [ref=e14] [cursor=pointer]
      - link "Download CV" [ref=e17] [cursor=pointer]:
        - /url: /documents/anung-ramadhan-cv.pdf
  - main [ref=e20]:
    - generic [ref=e21]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: TENTANG SAYA
        - heading "Perkenalkan, saya Anung." [level=1] [ref=e24]:
          - generic [ref=e25]: Perkenalkan,
          - generic [ref=e27]: saya Anung.
        - paragraph [ref=e29]: Lulusan Bisnis IPB.Menekuni pemasaran afiliasi dan digital.
        - paragraph [ref=e30]: Nama lengkap saya Anung Hanindhita Ramadhan. Saya tinggal di Bekasi dan lulus dari IPB University pada 2026. Selama magang di AnyMind Group dan PT Sutan Vet Medika, saya terlibat dalam pengelolaan mitra afiliasi, kerja sama KOL, dan pembuatan konten.
        - link "Download CV" [ref=e31] [cursor=pointer]:
          - /url: /documents/anung-ramadhan-cv.pdf
      - generic [ref=e35]:
        - img "Anung Hanindhita Ramadhan di kantor AnyMind Group" [ref=e38]
        - generic [ref=e41]:
          - generic [ref=e42]: Anung Hanindhita Ramadhan
          - generic [ref=e43]: Lulusan Bisnis, IPB University
    - generic [ref=e44]:
      - heading "Tanggung jawab saya selama magang." [level=2] [ref=e45]: Tanggung jawab sayaselama magang.
      - paragraph [ref=e46]: Saya memastikan mitra menerima sampel produk, menindaklanjuti pembuatan konten sesuai arahan, serta memantau penyelesaiannya. Saya juga menyusun laporan penjualan dan kinerja konten untuk tim.
    - generic [ref=e47]:
      - generic [ref=e48]:
        - text: PENDIDIKAN
        - heading "Pendidikan bisnis di IPB University." [level=2] [ref=e49]: Pendidikan bisnisdi IPB University.
      - generic [ref=e50]:
        - text: Agu 2022 - Agu 2026
        - heading "IPB University" [level=3] [ref=e51]
        - paragraph [ref=e52]: Sarjana Bisnis
        - generic [ref=e57]:
          - strong [ref=e58]:
            - text: "3.74"
            - generic [ref=e59]: /4.00
          - generic [ref=e60]: IPK
        - paragraph [ref=e61]: Saya mengikuti dua bazar bisnis untuk menjual produk, mengumpulkan masukan pembeli, dan menilai peluang pasar.
        - generic [ref=e62]: Profit lebih dari Rp100.000 · 30+ transaksi produk · Nilai A untuk inovasi produk, pelaksanaan bisnis, dan evaluasi kinerja pasar
    - generic [ref=e63]:
      - heading "Keahlian dan aplikasi yang saya gunakan." [level=2] [ref=e64]: Keahlian danaplikasi yang saya gunakan.
      - generic [ref=e65]:
        - article [ref=e66]:
          - heading "Afiliasi & KOL" [level=3] [ref=e67]
          - list [ref=e68]:
            - listitem [ref=e69]: Pengelolaan mitra afiliasi
            - listitem [ref=e70]: Kerja sama KOL
            - listitem [ref=e71]: Koordinasi kegiatan promosi
            - listitem [ref=e72]: Analisis kinerja afiliasi Shopee & TikTok
        - article [ref=e73]:
          - heading "Konten & desain" [level=3] [ref=e74]
          - list [ref=e75]:
            - listitem [ref=e76]: Perencanaan konten
            - listitem [ref=e77]: Canva
            - listitem [ref=e78]: CapCut
            - listitem [ref=e79]: Adobe Photoshop
        - article [ref=e80]:
          - heading "Kerja tim & administrasi" [level=3] [ref=e81]
          - list [ref=e82]:
            - listitem [ref=e83]: Koordinasi lintas tim
            - listitem [ref=e84]: Microsoft Office
            - listitem [ref=e85]: Google Workspace
            - listitem [ref=e86]: Pemecahan masalah
      - generic [ref=e87]:
        - generic [ref=e88]:
          - text: Bahasa Indonesia
          - strong [ref=e89]: Bahasa ibu
        - generic [ref=e90]:
          - text: Bahasa Inggris
          - strong [ref=e91]: Komunikasi profesional
        - generic [ref=e92]:
          - text: TOEFL ITP
          - strong [ref=e93]: "583"
      - figure "TOEFL ITP 583 Professional Working Proficiency, seperti tertulis di CV saya." [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]: TOEFL ITP
          - strong [ref=e97]: "583"
          - generic [ref=e98]: Professional Working Proficiency, seperti tertulis di CV saya.
        - paragraph [aria-hidden] [ref=e101]:
          - generic [ref=e102]: "310"
          - generic [ref=e103]: "677"
        - paragraph [ref=e104]: Skor 583 pada skala total TOEFL ITP yang berjalan dari 310 sampai 677.
    - generic [ref=e105]:
      - generic [ref=e106]:
        - text: CV
        - heading "CV saya, bisa dibaca tanpa mengunduh." [level=2] [ref=e107]: CV saya, bisa dibacatanpa mengunduh.
        - paragraph [ref=e108]: Ini 2 halaman dari berkas PDF yang sama, bukan versi yang saya tulis ulang. Isinya juga tersedia sebagai teks di halaman Pengalaman dan Tentang.
        - link "Download CV" [ref=e109] [cursor=pointer]:
          - /url: /documents/anung-ramadhan-cv.pdf
      - list [ref=e112]:
        - listitem [ref=e113]:
          - figure "Halaman 1 dari 2" [ref=e114]:
            - 'img "Halaman 1 CV Anung Hanindhita Ramadhan: nama, kontak, ringkasan profil, pendidikan Institut Pertanian Bogor 2022-2026 dengan Bachelor of Business 3.74/4.00, lalu tiga pengalaman kerja — AnyMind Group, PT Sutan Vet Medika peran koordinasi, dan PT Sutan Vet Medika pemasaran digital." [ref=e115]'
        - listitem [ref=e117]:
          - figure "Halaman 2 dari 2" [ref=e118]:
            - 'img "Halaman 2 CV Anung Hanindhita Ramadhan: pengalaman organisasi BEM SB IPB, IDEANATION, ADDVENTURES 8.0, dan ABEST Internship Program, lalu daftar keterampilan lunak, keterampilan teknis, dan bahasa." [ref=e119]'
    - generic [ref=e121]:
      - heading "Mari berkenalan lebih jauh." [level=2] [ref=e124]: Mari berkenalanlebih jauh.
      - paragraph [ref=e125]: Saya terbuka untuk peluang magang lanjutan maupun posisi pemasaran tingkat awal.
      - link "Kirim pesan" [ref=e128] [cursor=pointer]:
        - /url: "#/kontak"
  - contentinfo [ref=e131]:
    - link "Anung, beranda" [ref=e132] [cursor=pointer]:
      - /url: "#/"
      - text: anung
      - generic [ref=e133]: .
    - generic [ref=e134]: © 2026 Anung Ramadhan
    - generic [ref=e135]:
      - link "WhatsApp" [ref=e136] [cursor=pointer]:
        - /url: https://wa.me/6281388116739?text=Halo%20Anung%2C%20saya%20melihat%20portofolio%20Anda%20dan%20ingin%20berdiskusi%20soal%20peluang%20kerja.
      - link "LinkedIn" [ref=e139] [cursor=pointer]:
        - /url: https://www.linkedin.com/in/anung-hanindhita-ramadhan
      - link "Email" [ref=e142] [cursor=pointer]:
        - /url: mailto:anungramadhan17@gmail.com
      - button "Kembali ke atas" [ref=e145] [cursor=pointer]
```

# Test source

```ts
  646 |     await ready(page, route);
  647 |     const found = await page.locator('[data-reveal], [data-reveal-group]').evaluateAll(list =>
  648 |       list.map(el => ({ tag: el.className, kind: el.dataset.revealKind || '' })));
  649 |     expect(found.length).toBeGreaterThan(0);
  650 |     expect(found.filter(item => !item.kind)).toEqual([]);
  651 |     found.forEach(item => kinds.add(item.kind));
  652 |   }
  653 |   // A vocabulary, not one uniform word: the visual pass targets these.
  654 |   expect(kinds.size).toBeGreaterThanOrEqual(4);
  655 | });
  656 | 
  657 | test('GSAP blocked still leaves every data visual on its final value', async ({ page }) => {
  658 |   let blocked = 0;
  659 |   await page.route(/\/node_modules\/.*gsap.*\.js/, route => { blocked++; return route.abort(); });
  660 |   await ready(page, '/tentang');
  661 |   const arc = await page.locator('.gpa-ring-value').evaluate(circle => ({
  662 |     length: Number(circle.getAttribute('stroke-dasharray')),
  663 |     offset: Number(getComputedStyle(circle).strokeDashoffset.replace('px', '')),
  664 |   }));
  665 |   expect(1 - arc.offset / arc.length).toBeCloseTo(3.74 / 4, 3);
  666 |   const scaleTrack = await trackGeometry(page.locator('.score-scale-track'));
  667 |   const scaleFill = await page.locator('.score-scale-fill').evaluate(el => el.getBoundingClientRect());
  668 |   expect(scaleFill.width / scaleTrack.width).toBeCloseTo((583 - 310) / (677 - 310), 2);
  669 |   await ready(page, '/pengalaman');
  670 |   const segments = await page.locator('.split-segment').evaluateAll(list => list.map(el => el.getBoundingClientRect().width));
  671 |   expect(segments[0] / segments[1]).toBeCloseTo(2, 1);
  672 |   const bars = await page.locator('.timeline-bar').evaluateAll(list => list.map(el => el.getBoundingClientRect().width));
  673 |   expect(bars).toHaveLength(4);
  674 |   expect(bars.every(width => width > 20)).toBe(true);
  675 |   expect(blocked).toBeGreaterThan(0);
  676 | });
  677 | 
  678 | // --- Kirim 4: konversi ---------------------------------------------------
  679 | 
  680 | async function fillContactForm(page) {
  681 |   await page.getByLabel('Nama', { exact: true }).fill('Test Portfolio');
  682 |   await page.getByLabel('Email', { exact: true }).fill('portfolio@example.com');
  683 |   await page.getByLabel('Topik pesan').selectOption('Kerja sama promosi');
  684 |   await page.getByLabel('Pesan', { exact: true }).fill('Halo Anung, mari berdiskusi tentang kolaborasi brand.');
  685 | }
  686 | 
  687 | test('WhatsApp stands beside email and LinkedIn with a prefilled Indonesian message', async ({ page }) => {
  688 |   await ready(page, '/kontak');
  689 |   const whatsapp = page.locator('.contact-info').getByRole('link', { name: 'WhatsApp', exact: true });
  690 |   await expect(whatsapp).toBeVisible();
  691 |   const href = await whatsapp.getAttribute('href');
  692 |   expect(href.startsWith('https://wa.me/6281388116739?text=')).toBe(true);
  693 |   const greeting = new URL(href).searchParams.get('text');
  694 |   expect(greeting).toContain('Halo Anung');
  695 |   expect(greeting.length).toBeGreaterThan(30);
  696 |   // Same weight as the other two channels, and repeated in the footer.
  697 |   await expect(page.locator('.contact-info .contact-social')).toHaveCount(3);
  698 |   await expect(page.locator('.contact-info').getByRole('link', { name: 'LinkedIn', exact: true })).toBeVisible();
  699 |   await expect(page.locator('.site-footer').getByRole('link', { name: 'WhatsApp', exact: true })).toHaveAttribute('href', href);
  700 | });
  701 | 
  702 | // A share preview is built by a crawler that never runs JavaScript, so this
  703 | // reads the served document instead of the live DOM.
  704 | test('share metadata is complete in the served document and shares one origin', async ({ request }) => {
  705 |   const html = await (await request.get('/')).text();
  706 |   const content = (attribute, key) => {
  707 |     const match = html.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`));
  708 |     return match && match[1].replace(/&amp;/g, '&');
  709 |   };
  710 |   const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)[1];
  711 |   expect(canonical).toBeTruthy();
  712 |   expect(content('property', 'og:url')).toBe(canonical);
  713 |   const image = content('property', 'og:image');
  714 |   expect(new URL(image).origin).toBe(new URL(canonical).origin);
  715 |   expect(new URL(image).pathname).toBe('/images/og-cover.png');
  716 |   expect(content('property', 'og:image:width')).toBe('1200');
  717 |   expect(content('property', 'og:image:height')).toBe('630');
  718 |   expect(content('property', 'og:image:alt').length).toBeGreaterThan(30);
  719 |   expect(content('property', 'og:type')).toBe('website');
  720 |   expect(content('property', 'og:description').length).toBeGreaterThan(30);
  721 |   expect(content('name', 'description').length).toBeGreaterThan(30);
  722 |   expect(content('name', 'twitter:card')).toBe('summary_large_image');
  723 |   expect(content('name', 'twitter:image')).toBe(image);
  724 |   expect(content('name', 'twitter:description')).toBe(content('property', 'og:description'));
  725 |   // og:title and the document title come from the same constant in src/site.js,
  726 |   // so the shared card and the tab can never drift apart.
  727 |   const title = html.match(/<title>([^<]*)<\/title>/)[1].replace(/&amp;/g, '&');
  728 |   expect(content('property', 'og:title')).toBe(title);
  729 |   expect(content('name', 'twitter:title')).toBe(title);
  730 |   // Exactly one canonical and one og:url; no repeated strings to drift.
  731 |   expect(html.match(/rel="canonical"/g)).toHaveLength(1);
  732 |   expect(html.match(/property="og:url"/g)).toHaveLength(1);
  733 | });
  734 | 
  735 | test('the CV can be read on the page without downloading it', async ({ page }) => {
  736 |   await ready(page, '/tentang');
  737 |   const pages = page.locator('.cv-pages img');
  738 |   await expect(pages).toHaveCount(2);
  739 |   const first = pages.first();
  740 |   await first.scrollIntoViewIfNeeded();
  741 |   const rendered = await first.evaluate(async (image) => {
  742 |     await image.decode().catch(() => {});
  743 |     return { natural: image.naturalWidth, width: image.getAttribute('width'), height: image.getAttribute('height'), alt: image.alt };
  744 |   });
  745 |   // width + height on every new image is what keeps CLS where it is.
> 746 |   expect(rendered.natural).toBeGreaterThan(0);
      |                            ^ Error: expect(received).toBeGreaterThan(expected)
  747 |   expect(rendered.width).toBe('1000');
  748 |   expect(rendered.height).toBe('1413');
  749 |   expect(rendered.alt).toContain('Halaman 1');
  750 |   await expect(page.locator('.cv-pages figcaption').first()).toHaveText('Halaman 1 dari 2');
  751 |   // The download button does not go away.
  752 |   await expect(page.locator('.cv-preview').getByRole('link', { name: 'Download CV', exact: true })).toHaveAttribute('download', '');
  753 | });
  754 | 
  755 | test('contact form reports a real send when the backend accepts it', async ({ page }) => {
  756 |   await ready(page, '/kontak', BACKEND_ORIGIN);
  757 |   let payload = null;
  758 |   await page.route('https://api.web3forms.com/submit', async (route) => {
  759 |     payload = JSON.parse(route.request().postData());
  760 |     await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Email sent successfully' }) });
  761 |   });
  762 |   await expect(page.locator('.form-footer p')).toContainText('Situs ini tidak menyimpan pesan Anda.');
  763 |   await fillContactForm(page);
  764 |   await page.getByRole('button', { name: 'Kirim pesan', exact: true }).click();
  765 |   await expect(page.locator('.form-status')).toContainText('Pesan terkirim ke anungramadhan17@gmail.com');
  766 |   await expect(page.locator('.form-status')).toHaveAttribute('data-status', 'sent');
  767 |   expect(payload.access_key).toBe('uji-kunci-bukan-kunci-asli');
  768 |   expect(payload.email).toBe('portfolio@example.com');
  769 |   expect(payload.name).toBe('Test Portfolio');
  770 |   expect(payload.message).toContain('kolaborasi brand');
  771 |   expect(payload.subject).toContain('Kerja sama promosi');
  772 |   // A sent message is cleared; nothing is promised about a reply.
  773 |   await expect(page.getByLabel('Pesan', { exact: true })).toHaveValue('');
  774 |   await expect(page.locator('.form-status')).not.toContainText('24 jam');
  775 |   await expect(page.locator('.form-fallback')).toHaveCount(0);
  776 | });
  777 | 
  778 | test('contact form offers the email draft when the backend rejects the send', async ({ page }) => {
  779 |   await ready(page, '/kontak', BACKEND_ORIGIN);
  780 |   await page.route('https://api.web3forms.com/submit', route => route.fulfill({
  781 |     status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Internal error' }),
  782 |   }));
  783 |   await fillContactForm(page);
  784 |   await page.getByRole('button', { name: 'Kirim pesan', exact: true }).click();
  785 |   await expect(page.locator('.form-status')).toContainText('Pesan belum terkirim');
  786 |   await expect(page.locator('.form-status')).toContainText('anungramadhan17@gmail.com');
  787 |   const fallback = page.locator('.form-fallback a');
  788 |   await expect(fallback).toBeVisible();
  789 |   const href = await fallback.getAttribute('href');
  790 |   expect(href.startsWith('mailto:anungramadhan17@gmail.com?subject=')).toBe(true);
  791 |   expect(decodeURIComponent(href)).toContain('kolaborasi brand');
  792 |   // What the visitor typed is still in the form.
  793 |   await expect(page.getByLabel('Pesan', { exact: true })).toHaveValue(/kolaborasi brand/);
  794 | });
  795 | 
  796 | test('contact send survives a dead network and keeps the draft reachable', async ({ page }) => {
  797 |   await ready(page, '/kontak', BACKEND_ORIGIN);
  798 |   await page.route('https://api.web3forms.com/submit', route => route.abort('failed'));
  799 |   await fillContactForm(page);
  800 |   await page.getByRole('button', { name: 'Kirim pesan', exact: true }).click();
  801 |   await expect(page.locator('.form-status')).toHaveAttribute('data-status', 'failed');
  802 |   await expect(page.locator('.form-status')).toContainText('Pesan belum terkirim');
  803 |   expect(await page.locator('.form-fallback a').getAttribute('href')).toContain('mailto:anungramadhan17@gmail.com');
  804 |   // The button comes back; a dead network does not lock the form.
  805 |   await expect(page.getByRole('button', { name: 'Kirim pesan', exact: true })).toBeEnabled();
  806 | });
  807 | 
  808 | test('a filled honeypot sends nothing and the trap stays out of the way', async ({ page }) => {
  809 |   await ready(page, '/kontak', BACKEND_ORIGIN);
  810 |   let calls = 0;
  811 |   await page.route('https://api.web3forms.com/submit', (route) => {
  812 |     calls++;
  813 |     return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  814 |   });
  815 |   await expect(page.locator('.form-trap')).toHaveAttribute('aria-hidden', 'true');
  816 |   await expect(page.locator('input[name="website"]')).toHaveAttribute('tabindex', '-1');
  817 |   await fillContactForm(page);
  818 |   await page.locator('input[name="website"]').evaluate((element) => { element.value = 'https://spam.example'; });
  819 |   await page.getByRole('button', { name: 'Kirim pesan', exact: true }).click();
  820 |   await page.waitForTimeout(700);
  821 |   expect(calls).toBe(0);
  822 |   await expect(page.locator('.form-status')).toHaveAttribute('data-status', 'idle');
  823 | });
  824 | 
```