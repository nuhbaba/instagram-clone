# Profilini doldurma (gunseli_beyhan)

Uygulama `gunseli_beyhan` hesabıyla **boş bir profille** açılır: Instagram'da hiç gönderi
paylaşmamış bir hesap nasıl görünüyorsa öyle. İçeriği sen eklersin — hepsi bu cihazda
saklanır, hiçbir şey sunucuya gönderilmez.

---

## 1) Profil bilgilerini gir

**Profil** sekmesi → **Profili düzenle** (veya sağ üstteki **☰ → profil satırı**):

- **Ad:** `Günseli Beyhan` (hazır gelir, değiştirebilirsin)
- **Kullanıcı adı:** `gunseli_beyhan` (hazır gelir)
- **Biyografi:** boş bırakıldı — yazdığın anda profil sayfasında görünür
- **Bağlantı:** istersen web siten
- **Profil fotoğrafı:** *Fotoğrafı değiştir* → telefondan bir görsel seç
  (seçmezsen baş harflerden üretilen **GB** avatarı görünür)

## 2) Fotoğrafları ekle

**Tek fotoğraf**

1. Üstteki **＋** (veya profilde *İlk gönderini paylaş*)
2. **Toplu seç** / **Kamera** / hazır galeriden bir kare
3. Açıklama, konum, istersen "Reels olarak paylaş"
4. **Paylaş** → gönderi profilinde ve akışta görünür

**Çoklu (toplu) yükleme — 30 fotoğrafı tek seferde eklemek için**

1. **＋ → Toplu seç**
2. Telefon galerisinden **birden fazla** fotoğraf seç (ilk seçimden sonra uzun basıp
   çoklu seçim yapabilirsin)
3. Seçilenler ızgarada listelenir; istemediğini **×** ile çıkar
4. Ortak açıklama ve konum yaz → **"N gönderi paylaş"**

Yüklenen her fotoğraf tarayıcıda en fazla 1080 px'e küçültülür ve JPEG olarak cihazda
saklanır (bu yüzden yükleme hızlıdır ve depolama şişmez).

## 3) Profilini başka cihaza taşıma (önemli)

Veriler **tarayıcının kendi deposunda** tutulur. Telefonda eklediklerin bilgisayarda
kendiliğinden görünmez. Taşımak için:

1. **Doldurduğun cihazda:** Ayarlar → **Verileri indir (JSON yedeği)**
2. Dosyayı diğer cihaza gönder (Drive, WhatsApp, e-posta…)
3. **Diğer cihazda:** Ayarlar → **Yedeği geri yükle (JSON)** → dosyayı seç

> Tarayıcı verilerini temizlersen içerik de silinir. Önemli fotoğraflar için yedeği
> ara ara almakta fayda var. İstersen "Tüm verileri sıfırla" ile her şeyi baştan
> örnek içeriğe döndürebilirsin.

## 4) Herkese açık ve kalıcı olmasını istiyorsan

GitHub Pages'te yayındaki sürüm, senin tarayıcı deposunu göremez: orada da boş profil
görünür. Fotoğrafların **ziyaretçilere de görünmesini** istiyorsan:

- Fotoğrafları (ve istediğin ad/biyografi metnini) bana ilet; onları uygulamanın
  başlangıç içeriğine gömüp depoya işlerim. Böylece `nuhbaba.github.io/instagram-clone`
  adresini açan herkes profili dolu görür ve sen hiçbir şey yüklemek zorunda kalmazsın.

## Sık sorulanlar

- **Öne çıkanlar (highlights) nereden geliyor?** Şu an gönderilerinden otomatik
  oluşur. Baştaki **+ Yeni** dairesi hikâye ekleme alanıdır; hikâye yükleme bu
  sürümde yok (yakında).
- **Gönderi sayısı / takipçi sayısı değişmiyor.** Gönderi sayısı paylaştıkça artar.
  Takipçi sayısı demo grafından gelir; gerçek sayını göstermek istersen söyle,
  profil ayarlarına düzenlenebilir alan ekleyeyim.
- **Beğeni ve yorumlar kimden?** Paylaştığın gönderilere birkaç dakika içinde örnek
  beğeni ve yorum gelir (demo canlılığı için). Tamamen yerel bir simülasyondur.
- **Yüklediğim fotoğraflar nereye gidiyor?** Hiçbir yere — yalnızca bu cihazdaki
  tarayıcı deposuna. Ağa yalnızca örnek fotoğraflar (picsum/pravatar) için çıkılır.
