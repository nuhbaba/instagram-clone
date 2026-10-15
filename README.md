# Instagram — Benzeri Uygulama (mobil web / PWA)

**🔗 Canlı demo:** <https://nuhbaba.github.io/instagram-clone/> · **Depo:** <https://github.com/nuhbaba/instagram-clone>

Instagram'ın arayüz dili ve kullanım akışını örnek alan, **tek başına çalışan** bir mobil
sosyal medya uygulaması prototipi. Kurulum, derleme veya sunucu gerekmez: `index.html`
dosyasını açtığınız anda çalışır. Tüm veriler yalnızca **sizin cihazınızda** (tarayıcı
`localStorage`) tutulur; hiçbir şey hiçbir sunucuya gönderilmez.

Telefondan canlı demo adresini açıp tarayıcı menüsünden **"Uygulamayı yükle"** derseniz
ana ekrana eklenen tam ekran bir uygulama olur ([ayrıntılar](TELEFONA-YUKLE.md)).

> **Profil:** Uygulama `gunseli_beyhan` hesabıyla **boş bir profille** açılır —
> Instagram'da hiç gönderi paylaşmamış bir hesabın profil sayfası nasıl görünüyorsa
> birebir öyle. Kendi fotoğraflarını ekleyerek doldurursun:
> **[PROFILINI-DOLDUR.md](PROFILINI-DOLDUR.md)** (tek/çoklu yükleme, profil düzenleme,
> cihazlar arası JSON yedeği).

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
- Instagram'ın güncel profil düzeniyle birebir: avatar (+ hikâye ekleme rozeti),
  `gönderi / takipçi / takip` istatistikleri, ad, kategori, biyografi, bağlantı
- **Hazır profil:** `gunseli_beyhan` · **58 gönderi · 215 takipçi · 444 takip** ·
  düğün temalı 58 gönderilik ızgara (başlıklarıyla) · **Anılar** ve **Düğün** öne
  çıkanları · profil fotoğrafı
- **Düğün içeriği:** 6 sohbette düğün yazışmaları (fotoğrafçı, gelinlik atölyesi,
  organizasyon, pasta, kahve ikramı, drone), düğün temalı bildirimler ve seni
  etiketleyen 3 düğün gönderisi — hepsi kurgusal demo metni, görseller üretilmiş
  tasarımlardır (gerçek kişi fotoğrafı içermez)
- Kendi profilinde tek geniş **Profili düzenle** düğmesi; başka profillerde
  takip et / takibi bırak (onay menüsüyle) ve mesaj gönder
- Öne çıkanlar şeridi: kapağı ve adı olan daireler; kendi profilinde başta **+ Yeni**
  ile yeni öne çıkan oluşturma, dairesine dokunup kapağını/adını değiştirme veya silme
- 3 sekme: **Gönderiler**, **Reels**, **Etiketlenenler** — Instagram'da olduğu gibi
  Kaydedilenler bir sekme değil, menüden açılan ayrı ekran
- Hiç gönderi yoksa Instagram'ın "Gönderi paylaş" boş durumu görünür

### Mesajlar
- Gelen kutusu: notlar (Notes), sabitlenmiş sohbetler, okunmamış rozetleri, çevrimiçi noktası
- Sohbet ekranı: gün ayırıcıları, gelen/giden balonlar, "Görüldü" bilgisi, yazıyor animasyonu
- Sohbetler düğün hazırlığı temalıdır (fotoğrafçı, atölye, organizasyon, pasta, ikram, drone)
- Mesaj gönderin — karşı taraf **bağlama göre otomatik yanıt verir** (selamlaşma, teşekkür,
  buluşma, kahve, fotoğraf…)

### Yeni gönderi
- Hazır galeriden seçme, kamerayla çekme veya **kendi dosyalarını yükleme**
- **Toplu yükleme:** birden fazla fotoğraf seçip ortak açıklamayla tek seferde paylaşma
  (yüklenen görseller tarayıcıda 1080 px'e küçültülür)
- Açıklama, konum, ses, "Reels olarak paylaş" anahtarı
- Paylaştıktan sonra gönderiniz akışta ve profilinizde görünür; kısa süre sonra
  **beğeni ve yorum gelir** (demo canlılığı için)

### Gönderi detayı
- Tüm yorumlar, yorum beğenme, yanıtlama, kendi yorumunu silme, açıklamayı düzenleme
- Beğeni/kaydet/paylaş; paylaş menüsünde bağlantı kopyalama, hikâyeye ekleme, DM ile gönderme
- Kendi gönderilerinde arşivleme ve silme

### Ayarlar
- Koyu / açık tema, Reels otomatik oynatma, veri tasarrufu
- Kaydedilenler ekranı, profili paylaşma, yeni gönderi kısayolu
- **Verileri indir (JSON yedeği)** ve **Yedeği geri yükle (JSON)** — profilini
  cihazlar arasında taşımak için
- **Tüm verileri sıfırlama** (örnek içerik geri yüklenir), Uygulamayı yükle (PWA),
  sürüm ve depolama bilgisi

---

## Klasör yapısı

```
instagram-clone/
├─ index.html              # uygulama kabuğu (durum çubuğu, üst çubuk, ekran, sekmeler)
├─ manifest.webmanifest    # PWA bildirimi
├─ sw.js                   # servis çalışanı (kabuk önbelleği + görseller)
├─ Instagram-TekDosya.html # tek dosyalık telefon sürümü (üretilmiş)
├─ README.md               # bu dosya
├─ TELEFONA-YUKLE.md       # telefona kurma / yayınlama kılavuzu
├─ PROFILINI-DOLDUR.md     # profili kendi içeriğinle doldurma kılavuzu
├─ css/styles.css          # tasarım sistemi: tema değişkenleri, tüm bileşenler
├─ media/                  # profil fotoğrafı, düğün fotoğrafları (58) ve kapaklar
├─ fotograflar/            # KENDİ fotoğraflarını koyduğun klasör (OKU-BENI.txt)
├─ CREDITS.md              # ızgaradaki fotoğrafların kaynak/lisans listesi
├─ js/
│  ├─ icons.js             # Instagram'a benzer SVG ikon seti (doğrulama rozeti dâhil)
│  ├─ data.js              # Türkçe örnek içerik: 16 hesap, 25 gönderi, hikâyeler, DM'ler
│  ├─ store.js             # durum, localStorage kalıcılığı, seçiciler, eylemler
│  ├─ components.js        # avatar, medya, gönderi kartı, alt sayfa, uyarı bileşenleri
│  └─ app.js               # yönlendirme, ekranlar, hikâye oynatıcı, tüm etkileşimler
├─ icons/                  # uygulama ikonları (gradyan + kamera glifi)
├─ screenshots/            # doğrulama ekran görüntüleri
└─ tools/
   ├─ make_icons.py          # uygulama ikonlarını üretir (Pillow)
   ├─ import-photos.py       # KENDİ fotoğraflarını profile aktarır (720x720, EXIF temiz)
   ├─ split-collage.py       # kolaj (3x3) fotoğrafı ayrı karelere böler
   ├─ fetch-wedding-photos.py # özgür lisanslı düğün fotoğrafı indirir
   ├─ build-wedding-pool.py  # seçim için aday havuzu indirir
   ├─ select-wedding-photos.py # havuzdan seçilenleri profile yerleştirir
   ├─ make-wedding-set.py    # (yedek) tasarım kartı üretir
   ├─ smoke-test.js          # veri katmanı testleri
   ├─ screen-test.js         # ekran/DOM entegrasyon testleri
   ├─ shot.html              # tam 414×880 ekran görüntüsü kabı
   └─ warm.html              # görsel önbelleği ısıtma (çekim öncesi)
```

---

## Testler

Node.js dışında hiçbir bağımlılık gerekmez (tarayıcı bile gerekmez):

```bash
node tools/smoke-test.js     # 137 doğrulama: istatistikler, kendi fotoğraflarım, düğün içeriği, yedekleme, XSS kaçışı
node tools/screen-test.js    # 99 doğrulama: 17 rota çizimi, sohbet regresyonu, tema, katmanlar
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
  simülasyondur. Bu yüzden iki cihaz arasında senkronizasyon olmaz (JSON yedeğiyle
  elle taşınabilir).
- **Profil içeriği cihaza özeldir:** uygulamada eklediğin fotoğraflar yalnızca kendi
  tarayıcında saklanır; GitHub Pages'teki yayında yalnızca depoya gömülü görseller
  (profil fotoğrafı, öne çıkan kapağı) görünür. Herkesin görmesi için fotoğrafların
  başlangıç içeriğine gömülmesi gerekir ([PROFILINI-DOLDUR.md](PROFILINI-DOLDUR.md)).
- **Izgaradaki 58 fotoğraf örnektir:** Wikimedia Commons'tan alınmış özgür lisanslı
  (CC0 / kamu malı / CC BY / CC BY-SA) düğün fotoğraflarıdır; kaynak ve lisans listesi
  [CREDITS.md](CREDITS.md) içindedir. Senin fotoğrafların değildir — kendi
  fotoğraflarını koymak için `python tools/import-photos.py`
  ([PROFILINI-DOLDUR.md](PROFILINI-DOLDUR.md)). Akışta ve keşfette görünmezler.
- **Düğün metinleri kurgusaldır:** gönderi başlıkları, sohbetler ve bildirimler
  fotoğraftaki düğün temasına uygun yazılmış demo içeriktir; gerçek mekân, tarih veya
  kişi adı içermez.
- **Gerçek video yok:** Reels'ler fotoğraf + otomatik oynatma efektiyle temsil edilir.
- **Hikâye ekleme** ve kamera ile canlı çekim bu sürümde yok (galeri/dosya yükleme ve
  toplu yükleme var).
- Örnek fotoğraflar internetten gelir; internet yoksa yerel gradyanlara düşer.
- Beğeni/yorum/takipçi sayıları demo verisidir; gerçek kişilerin istatistikleri değildir.

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
