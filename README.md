# Instagram — Benzeri Uygulama (mobil web / PWA)

Instagram'ın arayüz dili ve kullanım akışını örnek alan, **tek başına çalışan** bir mobil
sosyal medya uygulaması prototipi. Kurulum, derleme veya sunucu gerekmez: `index.html`
dosyasını açtığınız anda çalışır. Tüm veriler yalnızca **sizin cihazınızda** (tarayıcı
`localStorage`) tutulur; hiçbir şey hiçbir sunucuya gönderilmez.

> **Not:** Bu uygulama Instagram'ın kopyası değil, Instagram ile **benzer** çalışan bağımsız
> bir demodur. Instagram/Meta ile bir bağlantısı yoktur. Kaynak kodun tamamı bu klasördedir.

---

## Hızlı başlangıç

**1. En basit yol — dosyayı aç**

`index.html` dosyasına çift tıklayın (veya tarayıcıya sürükleyin). Uygulama anında açılır.

**2. Telefona taşımak / kurmak**

- Tek dosyalık sürüm: **`Instagram-TekDosya.html`** (217 KB) — CSS ve JS gömülüdür,
  WhatsApp/Drive/USB ile telefona atıp tarayıcıda açmanız yeterlidir.
- Aynı Wi-Fi'dan PWA olarak kurmak (Ana ekrana ekle) veya internetten yayınlamak için
  adım adım anlatım: **[TELEFONA-YUKLE.md](TELEFONA-YUKLE.md)**
- Tek dosyayı kaynaktan yeniden üretmek: `node tools/build-single.js`

**3. Tam deneyim (kurulabilir PWA + çevrimdışı kabuk)**

Servis çalışanı ve "Uygulamayı yükle" özelliği `http(s)` adresi ister. Klasörde basit bir
yerel sunucu çalıştırın:

```powershell
# Windows (PowerShell) — bu klasörde
python -m http.server 4173
# ardından: http://127.0.0.1:4173/index.html
```

```bash
# macOS / Linux
python3 -m http.server 4173
```

Telefondan denemek için aynı Wi-Fi'da `http://<bilgisayarın-yerel-IP'si>:4173/index.html`
adresini açın (ayrıntılar: [TELEFONA-YUKLE.md](TELEFONA-YUKLE.md)).

Masaüstünde pencereyi daraltın ya da **F12 → cihaz araç çubuğu** ile telefon görünümüne
geçin: geniş ekranda uygulama, kenarında açıklama notu bulunan bir telefon çerçevesi
içinde görünür.

---

## Neler var?

### Akış (Ana Sayfa)
- Hikâye şeridi: görülmemiş hikâyeler Instagram gradyanıyla, görülenler gri halkayla;
  "Hikâyen" girişi ve canlı yayın etiketi
- Gönderi kartları: kullanıcı, konum, medya, eylem çubuğu, beğeni özeti
  ("elifkaman, selin.arslan ve 212 kişi daha beğendi"), açıklama, etiketler, yorum
  önizlemeleri ve zaman bilgisi
- **Çift dokunuşla beğeni** (büyük kalp animasyonu), tek dokunuşla gönderi detayı
- Aşağı çekerek yenileme

### Hikâye oynatıcı
- Otomatik ilerleyen segmentli ilerleme çubukları, sola/sağa dokunarak gezinme
- Basılı tutunca duraklatma, aşağı sürükleyince kapatma
- Yanıt yazma alanı, ses bilgisi, kendi hikâyende görüntüleme sayısı

### Keşfet ve Arama
- Anlık arama: hesaplar (takip düğmeleriyle), etiketler ve gönderi sonuçları
- Popüler etiket çipleri, önerilen hesap kartları, 3 sütunlu keşfet ızgarası

### Reels
- Dikey kaydırmalı (scroll-snap) tam ekran akış, otomatik oynatma efekti (Ken Burns)
- Sağda beğeni / yorum / paylaş / kaydet / menü ve dönen plak, altta kullanıcı,
  açıklama ve ses satırı
- Reels üzerinde de çift dokunuşla beğeni

### Bildirimler
- "Yeni / Bu hafta / Daha eski" grupları, tür rozetleri (beğeni, yorum, takip, bahsetme,
  etiket, hikâye), takip et / takip ediliyor düğmeleri, okunmamış vurgusu

### Profil
- İstatistikler (gönderi / takipçi / takip), biyografi, bağlantı, doğrulama rozeti
- Öne çıkanlar şeridi, Gönderiler / Reels / Kaydedilenler / Etiketlenenler sekmeleri
- Kendi profilinde **Profili düzenle** (ad, kullanıcı adı, biyografi, bağlantı, fotoğraf)
- Başka profillerde takip et / takibi bırak (onay menüsüyle), mesaj gönder

### Mesajlar
- Gelen kutusu: notlar (Notes), sabitlenmiş sohbetler, okunmamış rozetleri, çevrimiçi noktası
- Sohbet ekranı: gün ayırıcıları, gelen/giden balonlar, "Görüldü" bilgisi, yazıyor animasyonu
- Mesaj gönderin — karşı taraf **bağlama göre otomatik yanıt verir** (selamlaşma, teşekkür,
  buluşma, kahve, fotoğraf…)

### Yeni gönderi
- Hazır galeriden seçme veya **kendi dosyanı yükleme** (görsel tarayıcıda küçültülüp
  cihazda saklanır)
- Açıklama, konum, ses, "Reels olarak paylaş" anahtarı
- Paylaştıktan sonra gönderiniz akışta ve profilinizde görünür; kısa süre sonra
  **beğeni ve yorum gelir** (demo canlılığı için)

### Gönderi detayı
- Tüm yorumlar, yorum beğenme, yanıtlama, kendi yorumunu silme, açıklamayı düzenleme
- Beğeni/kaydet/paylaş; paylaş menüsünde bağlantı kopyalama, hikâyeye ekleme, DM ile gönderme
- Kendi gönderilerinde arşivleme ve silme

### Ayarlar
- Koyu / açık tema, Reels otomatik oynatma, veri tasarrufu
- Verileri JSON olarak indirme, **tüm verileri sıfırlama** (örnek içerik geri yüklenir)
- Uygulamayı yükle (PWA), sürüm ve depolama bilgisi

---

## Klasör yapısı

```
instagram-clone/
├─ index.html              # uygulama kabuğu (durum çubuğu, üst çubuk, ekran, sekmeler)
├─ manifest.webmanifest    # PWA bildirimi
├─ sw.js                   # servis çalışanı (kabuk önbelleği + görseller)
├─ css/styles.css          # tasarım sistemi: tema değişkenleri, tüm bileşenler
├─ js/
│  ├─ icons.js             # Instagram'a benzer SVG ikon seti (doğrulama rozeti dâhil)
│  ├─ data.js              # Türkçe örnek içerik: 16 hesap, 25 gönderi, hikâyeler, DM'ler
│  ├─ store.js             # durum, localStorage kalıcılığı, seçiciler, eylemler
│  ├─ components.js        # avatar, medya, gönderi kartı, alt sayfa, uyarı bileşenleri
│  └─ app.js               # yönlendirme, ekranlar, hikâye oynatıcı, tüm etkileşimler
├─ icons/                  # uygulama ikonları (gradyan + kamera glifi)
├─ screenshots/            # doğrulama ekran görüntüleri
└─ tools/
   ├─ make_icons.py        # ikonları üretir (Pillow)
   ├─ smoke-test.js        # veri katmanı testleri
   ├─ screen-test.js       # ekran/DOM entegrasyon testleri
   ├─ shot.html            # tam 414×880 ekran görüntüsü kabı
   └─ warm.html            # görsel önbelleği ısıtma (çekim öncesi)
```

---

## Testler

Node.js dışında hiçbir bağımlılık gerekmez (tarayıcı bile gerekmez):

```bash
node tools/smoke-test.js     # 95 doğrulama: seçiciler, eylemler, HTML üretimi, XSS kaçışı
node tools/screen-test.js    # 79 doğrulama: 15 rota çizimi, sohbet regresyonu, tema, katmanlar
```

`screen-test.js`, sahte bir DOM üzerinde `app.js`'i gerçekten çalıştırır ve **her rotayı
tek tek çizer**; çöken ya da boş kalan ekranları, `undefined` sızan HTML'i yakalar.

İkonları yeniden üretmek için:

```bash
python tools/make_icons.py
```

---

## Veri ve gizlilik

- Tüm durum `localStorage` içinde tek anahtarda (`instaclone.tr.v1`) saklanır.
- Beğeniler, yorumlar, takipler, kaydedilenler, mesajlar ve yüklediğiniz fotoğraflar
  yenilemeden sonra korunur.
- Ayarlar → *Tüm verileri sıfırla* ile başlangıç içeriğine dönebilirsiniz.
- Hiçbir ağ isteği veri göndermez. Tek dış çağrı, örnek fotoğraflar içindir
  (`picsum.photos`, `pravatar.cc`). İnternet yoksa uygulama otomatik olarak yerel
  gradyan görsellere ve baş harf avatarlarına düşer; arayüz bozulmaz.

---

## Bilinen sınırlar (dürüst liste)

- **Tek kullanıcı:** gerçek bir sunucu/çok kullanıcılı yapı yoktur; karşı taraflar
  simülasyondur. Bu yüzden iki cihaz arasında senkronizasyon olmaz.
- **Gerçek video yok:** Reels'ler fotoğraf + otomatik oynatma efektiyle temsil edilir.
- **Hikâye yükleme** ve kamera ile canlı çekim bu sürümde yok (galeri/dosya yükleme var).
- Örnek fotoğraflar internetten gelir; internet yoksa yerel gradyanlara düşer.
- Beğeni/yorum/takipçi sayıları demo amaçlı "temel sayı + sizin etkileşiminiz" şeklinde
  hesaplanır.

---

## Klavye ve erişilebilirlik

- `Esc`: açık katmanı, hikâye oynatıcıyı veya detay ekranını kapatır
- Tüm ikon düğmelerinde `aria-label`, sekmelerde `role`, bildirimlerde `aria-live`
- `prefers-reduced-motion` tercihine saygı duyulur (animasyonlar kapanır)
- Dokunma hedefleri en az 36–44 px, güvenli alan (`env(safe-area-inset-*)`) desteklenir

---

## Ekran görüntüleri

`screenshots/` klasöründe akış, keşfet, reels, profil, mesajlar, sohbet, bildirimler,
gönderi detayı, yeni gönderi, ayarlar ve açık tema görüntüleri bulunur.
