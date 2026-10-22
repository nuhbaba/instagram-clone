# Telefona nasıl yüklerim?

Üç yol var. **Hangisi işine yararsa onu seç** — hepsi aynı uygulamayı açar.

---

## Yol 1 — Tek dosyayı telefona at (en kolay, internet gerekmez)

Uygulamanın tamamı tek bir dosyada: **`Instagram-TekDosya.html`** (≈217 KB).
İçinde CSS ve JavaScript gömülüdür; yanında başka dosya olmadan çalışır.

**Dosyayı telefona nasıl gönderirim?** (herhangi biri yeterli)

- WhatsApp → kendine mesaj olarak gönder (belge olarak ekle)
- Google Drive / iCloud Drive / OneDrive → yükle, telefondan indir
- E-posta → kendine ek olarak gönder
- USB kablo → telefonun `Download` klasörüne kopyala

**Telefonda açma**

- **Android:** Dosya yöneticisinden `Instagram-TekDosya.html` dosyasına dokun →
  *Birlikte aç → Chrome*. Açılmazsa Chrome'un adres çubuğuna şunu yaz:
  `file:///sdcard/Download/Instagram-TekDosya.html`
  (Dosyayı başka klasöre koyduysan yolu ona göre değiştir. Firefox Android
  `file://` adreslerini sorunsuz açar.)
- **iPhone:** Dosyalar uygulamasından dosyaya dokun → önizleme açılır ve uygulama
  çalışır. Safari `file://` adreslerine doğrudan izin vermediği için kalıcı
  "Ana Ekrana Ekle" deneyimi için **Yol 2** veya **Yol 3**'ü kullan.

> Bu yolda uygulama çalışır ama **"Ana ekrana ekle" ile tam ekran kurulum olmaz**
> (PWA kurulumu bir adres/sunucu ister). Örnek fotoğraflar internetten gelir;
> internet yoksa uygulama yerel gradyan görsellere düşer.

---

## Yol 2 — Aynı Wi-Fi'dan aç ve gerçek uygulama olarak yükle (PWA)

Bilgisayar ve telefon **aynı Wi-Fi'da** olmalı.

1. Bilgisayarda bu klasörde bir sunucu başlat:

   ```powershell
   python -m http.server 4173
   ```

   (Python yoksa: `npx serve -l 4173` ya da `php -S 0.0.0.0:4173`)

2. Bilgisayarın yerel IP adresini öğren: `ipconfig` → **IPv4 Address**
   (Bu makinede görülen adres: **192.168.1.6**)

3. Telefonun tarayıcısına yaz:

   ```
   http://192.168.1.6:4173/index.html
   ```

4. Telefonda tarayıcı menüsü → **"Uygulamayı yükle"** / **"Ana ekrana ekle"**.
   Uygulama tam ekran, kendi ikonuyla ve çevrimdışı kabukla açılır.

**Bağlanamıyorsan:**

- Windows Güvenlik Duvarı ilk çalıştırmada izin sorar → **Özel ağlar** için izin ver.
- Kuralı elle eklemek için (yönetici PowerShell):
  ```powershell
  New-NetFirewallRule -DisplayName "Instagram Demo 4173" -Direction Inbound -LocalPort 4173 -Protocol TCP -Action Allow
  ```
- Telefonun mobil veri yerine Wi-Fi'da olduğundan emin ol.
- Modemde "istemci izolasyonu" (AP isolation) açıksa cihazlar birbirini görmez.

---

## Yol 3 — İnternetten erişilebilir hâle getir (her yerden çalışır, HTTPS)

**Bu proje için hâlihazırda yapıldı.** GitHub Pages açık:

### 👉 https://nuhbaba.github.io/instagram-clone/

Telefonda bu adresi aç → tarayıcı menüsü → **"Uygulamayı yükle" / "Ana ekrana ekle"**.
Artık ana ekranda kendi ikonuyla duran, tam ekran ve çevrimdışı açılan bir uygulama olur.

### 📱 Adres çubuğu görünmesin (uygulama gibi açılsın)

Adres çubuğunun gizlenmesi uygulamanın değil **kurulumun** yaptığı bir şeydir:

| Durum | Nasıl açılır | Adres çubuğu |
|---|---|---|
| Ana ekrana **kurulmuş** uygulama | Ana ekrandaki **ikona** dokun | **Yok** ✅ tam ekran |
| Tarayıcı sekmesi | Adresi tarayıcıya yaz / yer imi | Var |
| WhatsApp / Instagram **içi tarayıcı** | Sohbetteki linke dokun | Var (kurulum desteklenmez) ❌ |

Yani: linki önce **Chrome / Safari**'de aç, sonra kur:

- **Android Chrome:** sağ üst **⋮** → **"Uygulamayı yükle"** (bazı sürümlerde "Ana ekrana ekle").
  Kurulum çıkmıyorsa sayfayı bir kez yenile (servis çalışanı yüklenince çıkar).
- **iPhone Safari:** alt **Paylaş** → **"Ana Ekrana Ekle"**. (Chrome iOS'ta PWA kurulumu yok.)
- Kurduktan sonra ikonu **ana ekrandan** aç → adres çubuğu yok, sistem durum çubuğu dışında
  hiçbir tarayıcı arayüzü görünmez.

Kurulu modda uygulama, sahte durum çubuğunu gizler ve içeriği telefonun çentiğine/durum
çubuğuna göre hizalar (safe-area). Ayarlar → **"Uygulamayı yükle (PWA)"** düğmesi de aynı
kurulumu başlatır.

Kendi alan adınla ya da başka bir barındırmayla yayınlamak istersen ücretsiz seçenekler:

- **GitHub Pages** (bu projede kullanılan) → Depo → *Settings → Pages → Source: Deploy from
  a branch → main / (root)*. `index.html` kök dizinde olduğu için doğrudan çalışır.
- **Netlify Drop** → <https://app.netlify.com/drop> — `instagram-clone` klasörünü
  sayfaya sürükle-bırak, sana `https://xxxx.netlify.app` adresi verir.
- **Cloudflare Pages** veya **Vercel** → `npx vercel` (klasör içinde).

> Not: Yalnızca `file://` yerine `http(s)://` üzerinden açıldığında servis çalışanı
> (çevrimdışı destek) ve PWA kurulumu devreye girer.

---

## Tam projeyi de taşımak istersen

`instagram-clone.zip` (bir üst klasörde) projenin tamamını içerir: kaynak kodlar,
ikonlar, README, testler ve ekran görüntüleri. Telefonda zip'i açıp
`Instagram-TekDosya.html` dosyasına dokunmak da yeterlidir.

Tek dosyayı kaynak koddan yeniden üretmek için:

```bash
node tools/build-single.js
```
