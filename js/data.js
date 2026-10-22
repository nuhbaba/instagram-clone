/* ==========================================================================
   data.js — Uygulamanın başlangıç (tohum) içeriği
   Görseller internetten çekilir (picsum.photos / pravatar.cc); internet yoksa
   uygulama otomatik olarak yerel gradyan görsellere düşer.
   ========================================================================== */
window.IG = window.IG || {};

(function (IG) {
  "use strict";

  var AVATAR = function (n) { return "https://i.pravatar.cc/200?img=" + n; };
  var PIC = function (seed, w, h) {
    return "https://picsum.photos/seed/" + seed + "/" + (w || 1080) + "/" + (h || 1080);
  };

  var MIN = 60 * 1000;

  /* ------------------------------------------------------------------ */
  /* Kullanıcılar                                                        */
  /* ------------------------------------------------------------------ */
  var USERS = [
    {
      /* Bu hesap senin profilin: gönderilerini uygulamadan ekleyerek doldurursun.
         Profil fotoğrafı proje içindeki media/ klasöründe saklanır (yerel dosya),
         böylece yayındaki sitede de herkese görünür. */
      id: "u0", username: "gunseli_beyhan", name: "günseli arabacıoğlu 🎓 гюнсели", avatar: "media/gunseli-01.jpg",
      bio: "", link: "", verified: false, private: false,
      followersBase: 0, followingBase: 0, category: ""
    },
    {
      id: "u1", username: "elifkaman", name: "Elif Kaman", avatar: AVATAR(45),
      bio: "Fotoğrafçı 📷\nSokak hikâyeleri ve ışık peşinde.\nBaskı siparişi: elifkaman.art",
      link: "elifkaman.art", verified: true, private: false,
      followersBase: 128400, followingBase: 615, category: "Fotoğrafçı"
    },
    {
      id: "u2", username: "mertcanoz", name: "Mert Can Öz", avatar: AVATAR(15),
      bio: "Sabah koşusu 🌅 | 21K\nAntrenman günlüğü ve kahvaltı fikirleri.",
      link: "", verified: false, private: false,
      followersBase: 4310, followingBase: 288, category: "Sporcu"
    },
    {
      id: "u3", username: "zehra.demir", name: "Zehra Demir", avatar: AVATAR(47),
      bio: "Moda & tasarım 🧵\nSürdürülebilir tekstil üzerine çalışıyorum.",
      link: "zehrademir.co", verified: true, private: false,
      followersBase: 76400, followingBase: 402, category: "Tasarımcı"
    },
    {
      id: "u4", username: "baris.tekin", name: "Barış Tekin", avatar: AVATAR(33),
      bio: "Yazılım geliştirici 👨‍💻\nAçık kaynak, JavaScript, verimlilik.",
      link: "github.com/baristekin", verified: false, private: false,
      followersBase: 18600, followingBase: 511, category: "Yazılım"
    },
    {
      id: "u5", username: "nazlicelik", name: "Nazlı Çelik", avatar: AVATAR(26),
      bio: "Yoga & sağlıklı yaşam 🧘‍♀️\nNefes, denge, kahvaltı tarifleri.",
      link: "", verified: false, private: false,
      followersBase: 9830, followingBase: 640, category: "Sağlık"
    },
    {
      id: "u6", username: "canyilmaz", name: "Can Yılmaz", avatar: AVATAR(52),
      bio: "Müzisyen 🎸 Sokak konserleri her cuma Kadıköy'de.",
      link: "canyilmaz.bandcamp.com", verified: false, private: false,
      followersBase: 22400, followingBase: 830, category: "Müzisyen"
    },
    {
      id: "u7", username: "selin.arslan", name: "Selin Arslan", avatar: AVATAR(44),
      bio: "Seyahat ✈️ 34 ülke · 3 kıta\nRota ve bütçe rehberleri.",
      link: "selinrota.com", verified: true, private: false,
      followersBase: 152900, followingBase: 720, category: "Gezgin"
    },
    {
      id: "u8", username: "kerem_a", name: "Kerem Aydın", avatar: AVATAR(59),
      bio: "Basketbol 🏀 Antrenör.\nGençlerle sahada.",
      link: "", verified: false, private: false,
      followersBase: 3410, followingBase: 190, category: "Antrenör"
    },
    {
      id: "u9", username: "ayseozkan", name: "Ayşe Özkan", avatar: AVATAR(31),
      bio: "Yemek tarifleri 🍳\n30 dakikada akşam yemeği.",
      link: "ayseozkan.kitchen", verified: true, private: false,
      followersBase: 88400, followingBase: 355, category: "Yemek"
    },
    {
      id: "u10", username: "burak.sahin", name: "Burak Şahin", avatar: AVATAR(68),
      bio: "Bisiklet 🚴\nİstanbul–İzmir rotası 2024.",
      link: "", verified: false, private: false,
      followersBase: 6720, followingBase: 240, category: "Spor"
    },
    {
      id: "u11", username: "mavimelek", name: "Deniz Su", avatar: AVATAR(16),
      bio: "Kedi annesi 🐈 Pati Bahçesi derneği gönüllüsü.",
      link: "patibahcesi.org", verified: false, private: false,
      followersBase: 12050, followingBase: 460, category: "Sivil toplum"
    },
    {
      id: "u12", username: "gokhan.k", name: "Gökhan Kılıç", avatar: AVATAR(60),
      bio: "Sinema & dizi 🎬 Haftalık izleme listesi.",
      link: "", verified: false, private: false,
      followersBase: 8900, followingBase: 512, category: "Blogger"
    },
    {
      id: "u13", username: "pnarkoc", name: "Pınar Koç", avatar: AVATAR(24),
      bio: "Kitap kurdu 📚 Ayda 4 kitap, birlikte okuyalım.",
      link: "pnarkoc.reads", verified: false, private: false,
      followersBase: 15600, followingBase: 380, category: "Kitap"
    },
    {
      id: "u14", username: "hakan.dmr", name: "Hakan Demir", avatar: AVATAR(56),
      bio: "Kahve dükkânı sahibi ☕️ Üçüncü nesil kavurucu.",
      link: "", verified: false, private: false,
      followersBase: 5280, followingBase: 205, category: "İşletme"
    },
    {
      id: "u15", username: "tolgabay", name: "Tolga Bay", avatar: AVATAR(3),
      bio: "Foto + drone 🚁 Havadan Anadolu.",
      link: "tolgabay.aero", verified: false, private: false,
      followersBase: 34100, followingBase: 118, category: "İçerik üreticisi"
    },
    {
      /* Günseli'nin eşi: nişanlılıktan evliliğe uzanan yazışma d7 sohbetinde. */
      id: "u16", username: "beyhan", name: "Beyhan",
      avatar: "media/beyhan-01.jpg",
      bio: "Günseli'nin eşi 🤍 Kahve, yol ve deniz.",
      link: "", verified: false, private: false,
      followersBase: 640, followingBase: 412, category: ""
    }

  ];

  /* ------------------------------------------------------------------ */
  /* Yorumlar                                                            */
  /* ------------------------------------------------------------------ */
  var cseq = 0;
  function C(userId, text, minsAgo, likes, replies) {
    cseq++;
    return {
      id: "c" + cseq, userId: userId, text: text,
      at: Date.now() - minsAgo * MIN, likesBase: likes || 0,
      liked: false, replies: (replies || []).map(function (r) {
        cseq++;
        return { id: "c" + cseq, userId: r[0], text: r[1], at: Date.now() - r[2] * MIN, likesBase: r[3] || 0, liked: false };
      })
    };
  }

  /* ------------------------------------------------------------------ */
  /* Gönderiler                                                          */
  /* ------------------------------------------------------------------ */
  var pseq = 0;
  function P(o) {
    pseq++;
    return {
      id: o.id || ("p" + pseq),
      userId: o.userId,
      kind: o.kind || "post",
      src: o.src,
      alt: o.alt || "",
      caption: o.caption,
      location: o.location || "",
      at: Date.now() - o.mins * MIN,
      likesBase: o.likes,
      liked: false,
      saved: false,
      comments: o.comments || [],
      atUsers: o.atUsers || [],
      audio: o.audio || "",
      archived: false,
      /* Örnek (yer tutucu) gönderi: profilde görünür, akışta/keşfette görünmez.
         Kullanıcı kendi fotoğraflarını ekledikçe bunları silebilir. */
      placeholder: !!o.placeholder
    };
  }

  var POSTS = [
    P({
      userId: "u1", src: PIC("istanbul-sokak-01", 1080, 1350), mins: 38, likes: 4820,
      location: "Balat, İstanbul",
      caption: "Sabahın ilk ışığı Balat'ın sokaklarında dolaşırken yakaladığım o sessizlik. 🧡\n#sokakfotoğrafçılığı #istanbul #balat",
      comments: [
        C("u0", "Işık muhteşem, kadraj da öyle 👏", 30, 12),
        C("u7", "Bu sokağı çok seviyorum, tam köşede bir kahveci var ☕️", 22, 5, [["u1", "Kesinlikle orası! Bir gün birlikte gidelim 🙌", 18, 2]]),
        C("u3", "Renk paleti rüya gibi 😍", 12, 8)
      ]
    }),
    P({
      userId: "u9", src: PIC("aksam-yemegi-02", 1080, 1080), mins: 96, likes: 2130,
      location: "Kadıköy, İstanbul",
      caption: "30 dakikada akşam yemeği serisi #14: Fırında limonlu tavuk ve bebe patates 🍋🥔\nTarif için kaydet, akşam dene! 👇\n#yemektarifi #pratikyemek",
      comments: [
        C("u5", "Denedim, harika oldu! Zerdeçal da ekledim.", 60, 14),
        C("u12", "Bu seriyi kaydediyorum, hepsi birbirinden iyi.", 40, 3),
        C("u0", "Bebe patatesi hangi fırında yapıyorsun? 🍽️", 20, 1, [["u9", "Turbo 200 derece, 25 dakika yeterli 😊", 14, 1]])
      ]
    }),
    P({
      userId: "u7", src: PIC("kapadokya-balon-03", 1080, 1350), mins: 210, likes: 26400,
      location: "Göreme, Nevşehir",
      caption: "Balonlar sadece şafakta uçar derler, doğru. 🎈\n4:30'da kalkmaya değdi. Rota ve bütçe detayları yakında rehberde.\n#kapadokya #seyahat #balonlar",
      comments: [
        C("u15", "Drone ile çektiğim görüntüler yanında sönük kaldı 😅", 180, 66),
        C("u10", "Bu manzara için bisikletle gelmeye değer.", 150, 9),
        C("u1", "Işık, doku, kompozisyon... 10/10 💫", 120, 22)
      ]
    }),
    P({
      userId: "u4", src: PIC("kod-ekran-04", 1080, 1080), mins: 300, likes: 1240,
      location: "Ev ofis",
      caption: "Küçük bir alışkanlık: her sabah 25 dakika kod okuyorum, yazmıyorum. Sadece okuyorum. 📖\nBu ay 4 açık kaynak projeye katkı çıktı.\n#yazılım #javascript #açıkkaynak",
      comments: [
        C("u0", "Bunu denemeye başlıyorum, teşekkürler 💡", 240, 7),
        C("u12", "Hangi projeler? Merak ettim.", 200, 2, [["u4", "Profildeki bağlantıda hepsi var, bakabilirsin 👨‍💻", 190, 3]])
      ]
    }),
    P({
      userId: "u6", src: PIC("sahne-konser-05", 1080, 1080), mins: 420, likes: 3120,
      location: "Kadıköy Sahne",
      caption: "Dün akşam salon doluydu, sesimiz kısıldı ama kalbimiz açıldı. 🎸\nBu cuma yine buradayız, 21:00.\n#canyılmaz #sahne #cuma",
      comments: [C("u0", "Kaçırmam! Bilet var mı?", 400, 4)]
    }),
    P({
      userId: "u11", src: PIC("kedi-bahce-06", 1080, 1080), mins: 520, likes: 8940,
      location: "Pati Bahçesi",
      caption: "Bugün 6 yavru sahiplendirildi. 🐈 Vazgeçmeyin, hepsi bir yuva buluyor.\nKısırlaştırma destek kampanyası profil bağlantısında.\n#sahiplen #kedi #patibahcesi",
      atUsers: ["u5", "u13"],
      comments: [
        C("u13", "Kalp kalp kalp 💚", 500, 11),
        C("u5", "Harika haber, tebrikler!", 480, 6)
      ]
    }),
    P({
      userId: "u3", src: PIC("moda-atolye-07", 1080, 1350), mins: 700, likes: 5670,
      location: "Nişantaşı",
      caption: "Atölyeden kareler: bu sezonun kumaşları tamamen geri dönüştürülmüş iplikten. 🧵\nDetaylar yakında.\n#moda #sürdürülebilirlik #tasarım",
      comments: [C("u1", "Kumaşın dokusu fotoğrafta bile hissediliyor.", 650, 15)]
    }),
    P({
      userId: "u2", src: PIC("sabah-kosu-08", 1080, 1080), mins: 900, likes: 780,
      location: "Caddebostan",
      caption: "Bugün 14 km, ortalama 5:12 tempo. 🏃‍♂️\nYağmurda koşmak en güzeli.\n#koşu #antrenman #sabahkoşusu",
      comments: [C("u10", "Tempo çok iyi, tebrikler! 🚴‍♂️", 860, 3)]
    }),
    P({
      userId: "u15", src: PIC("drone-anadolu-09", 1080, 1350), mins: 1200, likes: 11200,
      location: "Kapadokya",
      caption: "Havadan Anadolu — 12. bölüm: Peri bacalarının gölgeleri. 🚁\nTam video profil bağlantısında.\n#drone #kapadokya #havadan",
      comments: [
        C("u7", "Bu açıyı çekmek kolay olmasa gerek 👏", 1100, 30),
        C("u1", "Kıskandım, çok iyi 🎯", 1000, 12)
      ]
    }),
    P({
      userId: "u14", src: PIC("kahve-cekirdek-10", 1080, 1080), mins: 1500, likes: 2040,
      location: "Hakan Demir Kavurma Atölyesi",
      caption: "Etiyopya Yirgacheffe, açık kavurma. Filtrede bergamot notaları çok belirgin. ☕️\nBu hafta sonu tadım etkinliği var, katılım ücretsiz.\n#kahve #üçüncünesildalga #specialtycoffee",
      comments: [
        C("u0", "Tadıma geliyorum! Saat kaçta? ☕️", 1400, 8, [["u14", "Cumartesi 14:00, yer ayırtalım 😊", 1380, 4]]),
        C("u9", "Kahve + tatlı kombinasyonu için sabırsızım.", 1300, 5)
      ]
    }),
    P({
      userId: "u5", src: PIC("yoga-nefes-11", 1080, 1350), mins: 1900, likes: 3410,
      location: "Bebek Sahili",
      caption: "Nefes egzersizi: 4 saniye al, 7 saniye tut, 8 saniye ver. 🧘‍♀️\nGünde 3 tur, stres seviyesinde gözle görülür fark.\n#yoga #nefes #sağlıklıyaşam",
      comments: [C("u13", "Bunu sabah rutinime ekledim, iyi geldi.", 1800, 9)]
    }),
    P({
      userId: "u8", src: PIC("basketbol-saha-12", 1080, 1080), mins: 2400, likes: 1120,
      location: "Spor Salonu",
      caption: "Gençlerle üç sayı yarışması. 🏀 Kazanan takıma dondurma benden.\n#basketbol #gençlik #saha",
      comments: []
    }),
    P({
      userId: "u13", src: PIC("kitap-masa-13", 1080, 1080), mins: 2900, likes: 1980,
      location: "Kitapçı",
      caption: "Bu ayın seçkisi: üç roman, bir deneme. 📚\nHangi kitabı birlikte okuyalım? Yorumlara yaz.\n#kitap #okumaönerisi #kitapkurdu",
      comments: [
        C("u12", "Deneme olanını çok merak ettim.", 2800, 4),
        C("u0", "Romanla başlayalım bence ✨", 2700, 6)
      ]
    }),
    P({
      userId: "u10", src: PIC("bisiklet-yol-14", 1080, 1350), mins: 3400, likes: 1420,
      location: "Sapanca",
      caption: "Sapanca turu tamamlandı, 112 km. 🚴\nBacaklar yorgun, manzara buna değdi.\n#bisiklet #tur #sapanca",
      comments: [C("u2", "Bu tempoya yetişemem 😅 Tebrikler!", 3300, 5)]
    }),
    /* ---------------- REELS ---------------- */
    P({
      userId: "u1", kind: "reel", src: PIC("reel-sokak-15", 1080, 1920), mins: 60, likes: 15800,
      location: "Galata",
      caption: "Galata'da 30 saniyede 3 kadraj 📷 #fotoğrafçılık #galata",
      audio: "Orijinal ses — elifkaman", comments: [C("u3", "Bu geçiş muhteşem 🔥", 45, 22)]
    }),
    P({
      userId: "u9", kind: "reel", src: PIC("reel-yemek-16", 1080, 1920), mins: 240, likes: 9600,
      location: "Mutfak",
      caption: "Tek tavada makarna: 12 dakika ⏱️ #pratiktarif #makarna",
      audio: "Mutfağın Sesi — Ayşe Özkan", comments: [C("u5", "Bu akşam deniyorum!", 200, 11)]
    }),
    P({
      userId: "u6", kind: "reel", src: PIC("reel-muzik-17", 1080, 1920), mins: 600, likes: 12300,
      location: "Kadıköy",
      caption: "Sokakta akustik: yeni şarkının ilk hali 🎸 #akustik #sokakmüziği",
      audio: "Yeni Şarkı (Demo) — Can Yılmaz", comments: []
    }),
    P({
      userId: "u7", kind: "reel", src: PIC("reel-tatil-18", 1080, 1920), mins: 1000, likes: 34100,
      location: "Likya Yolu",
      caption: "Likya Yolu'nda 4 gün 🥾 Çadır, deniz, yıldızlar. #kamp #likyayolu",
      audio: "Sabah Rüzgârı", comments: [C("u10", "Bu rotayı yürümek istiyorum!", 900, 40)]
    }),
    P({
      userId: "u15", kind: "reel", src: PIC("reel-drone-19", 1080, 1920), mins: 2200, likes: 21800,
      location: "Nemrut",
      caption: "Gün doğumunda Nemrut 🚁 #drone #nemrut #gündoğumu",
      audio: "Orijinal ses — tolgabay", comments: []
    }),
    P({
      userId: "u11", kind: "reel", src: PIC("reel-kedi-20", 1080, 1920), mins: 3000, likes: 45200,
      location: "Pati Bahçesi",
      caption: "Yavru kediler ilk kez çimende 🐾 #kedi #sevimlihayvanlar",
      audio: "Neşeli Melodi", comments: [C("u13", "Bu videoyu 20 kere izledim 😭", 2900, 80)]
    }),
    P({
      userId: "u2", kind: "reel", src: PIC("reel-kosu-21", 1080, 1920), mins: 3800, likes: 4300,
      location: "Sahil yolu",
      caption: "Yağmurda 10 km 🌧️ Tatlı bir yorgunluk. #koşu #sabah",
      audio: "Ritim 128", comments: []
    }),
    P({
      userId: "u3", kind: "reel", src: PIC("reel-moda-22", 1080, 1920), mins: 4600, likes: 18700,
      location: "Atölye",
      caption: "Kumaş nasıl doğar? 20 saniyede anlattım 🧵 #moda #üretim",
      audio: "Orijinal ses — zehra.demir", comments: []
    }),
    /* ---------------- ÖRNEK İÇERİK (senin profilin başlangıçta boştur) ----
       Bu üç gönderi demo hesaplara aittir; böylece akış canlı kalır.
       Kendi profilin (u0 · beyhan_günseli) 0 gönderiyle başlar. */
    P({
      userId: "u4", src: PIC("deniz-proje-23", 1080, 1080), mins: 7, likes: 214,
      location: "İstanbul",
      caption: "Küçük ama işe yarayan bir şeye başladım. 🚀\nİlerlemeyi buradan paylaşacağım, geri bildirime açığım.\n#yazılım #kişiselproje",
      comments: [
        C("u12", "Merakla bekliyorum! 👀", 5, 3),
        C("u1", "İlk yorum benden olsun 🙌", 3, 1)
      ]
    }),
    P({
      userId: "u14", src: PIC("deniz-kahve-24", 1080, 1350), mins: 430, likes: 342,
      location: "Hakan Demir Kavurma Atölyesi",
      caption: "Cumartesi ritüeli: filtre kahve ve defter. ☕️📓\nBu haftanın planı defterde hazır.\n#kahve #haftasonu",
      comments: [
        C("u5", "Afiyet olsun! Yeni çekirdek nasıl?", 400, 4, [["u14", "Bergamot notası çok net, bayıldım ☕️", 390, 2]]),
        C("u9", "Kahve ve defter ikilisi 🥰", 300, 6)
      ]
    }),
    P({
      userId: "u15", kind: "reel", src: PIC("deniz-reel-25", 1080, 1920), mins: 62, likes: 1840,
      location: "İstanbul",
      caption: "Şehirde 15 saniye 🌆 #istanbul #reels",
      audio: "Orijinal ses — tolgabay",
      comments: [C("u7", "Bu geçiş çok iyi 🔥", 44, 11)]
    })
  ];

  /* ------------------------------------------------------------------ */
  /* Profil ızgarası: 58 düğün temalı gönderi                            */
  /* Görseller tools/make-wedding-set.py ile üretildi (gerçek kişi       */
  /* fotoğrafı içermez: yüzük, kalp, çiçek, davetiye, konfeti motifleri).*/
  /* Profilin "58 gönderi" göstermesi ve ızgaranın dolu görünmesi için.  */
  /* Bunlar akışta ve keşfette görünmez; Ayarlar > "Örnek gönderileri    */
  /* temizle" ile kaldırılabilir. Açıklamaları gönderi menüsünden        */
  /* düzenleyebilir, kendi fotoğraflarınla değiştirebilirsin.            */
  /* ------------------------------------------------------------------ */
  var DUGUN_BASLIKLARI = {
    1: { c: "İşte o an… 🤍\n#düğün #nikâh", l: "", y: [["u1", "Bu kare muhteşem olmuş 🤍", 40, 24], ["u7", "Bayıldım! 😍", 30, 12]] },
    2: { c: "Düğün günümüzden 🤍\n#düğün", l: "", y: [["u3", "Işık harika, çok şık olmuşsunuz ✨", 60, 18]] },
    3: { c: "Bir ömür boyu 🤍\n#mutluluk", l: "", y: [["u9", "Mutluluğunuz daim olsun 🤍", 80, 26]] },
    4: { c: "Kahkahamız hiç bitmesin 😄\n#düğün", l: "", y: [["u5", "Bu kareye bayıldım 😄", 100, 15]] },
    5: { c: "Bu bakış her şeye değer 🥰\n#aşk", l: "", y: [["u7", "Bu bakış her şeyi anlatıyor 🥰", 140, 9]] },
    6: { c: "Nikâh yolunda, el ele 🤍\n#nikâh", l: "" },
    7: { c: "Gelin 🤍\n#gelin #düğün", l: "" },
    8: { c: "İlk adımımızı birlikte attık ✨\n#düğün", l: "" },
    9: { c: "Yolun sonunda birlikteyiz 🌅\n#balayı", l: "" },
    10: { c: "Yüzükler takıldı 💍\n#nişan", l: "", y: [["u3", "Hayırlı olsun, çok yakışmış 💍", 4000, 21]] },
    11: { c: "Nişan yüzüklerimiz 💍\n#nişan #aile", l: "İstanbul", y: [["u7", "Maşallah 🤍", 3800, 14]] },
    12: { c: "Nikâh salonumuz hazır 🤍\n#düğün", l: "" },
    13: { c: "Nişan çiçeklerimiz 🌸\n#nişan", l: "", y: [["u9", "Çiçekler çok taze 🌸", 3500, 8]] },
    14: { c: "Yüzükleri seçerken 💍", l: "" },
    15: { c: "Mekânı gezdik, ışıkları çok sevdim ✨", l: "" },
    16: { c: "Ablamın getirdiği çiçekler 🌹\n#aile", l: "", y: [["u11", "Ablanın zevki güzel 🤍", 3200, 11]] },
    17: { c: "Annemin elinden çiçekler 🤍\n#aile", l: "" },
    18: { c: "Nikâhımız burada olacak ⛪️", l: "" },
    19: { c: "Nişan pastamız 🎂\n#nişan", l: "Pastane", y: [["u9", "Pasta çok güzel, tadına bakmak lazım 🍰", 3000, 16]] },
    20: { c: "Ailece hazırlık telaşı 🤍\n#aile", l: "", y: [["u5", "Ne güzel bir telaş 🤍", 2800, 9]] },
    21: { c: "İçim çok huzurlu, burada evet diyeceğim 🤍", l: "" },
    22: { c: "Annem ve babamın elleri 🤍\n#aile", l: "", y: [["u3", "Çok duygulandım 🤍", 2600, 13]] },
    23: { c: "Annemin pastası her zaman en güzeli 🍫", l: "" },
    24: { c: "Aile sofrası 🍽️", l: "" },
    25: { c: "Kuzenimin düğününde 💐\n#aile", l: "" },
    26: { c: "Tadımlık pasta 🍰", l: "" },
    27: { c: "Nişan yüzüğüm 💎", l: "" },
    28: { c: "Düğün yerimizi son kez gezdik 🌿", l: "" },
    29: { c: "Gelin buketi denemeleri 💐", l: "" },
    30: { c: "Beyhan'ın sürprizi 💍", l: "", y: [["u7", "Sürprizleri hiç bitmiyor 😄", 2400, 7]] },
    31: { c: "Yüzük seçerken ailem de yanımdaydı 🤍\n#aile", l: "" },
    32: { c: "Çiçekçiyle son karar 🌿", l: "" },
    33: { c: "Pasta tadımı: aile oylaması 🍰", l: "Pastane", y: [["u9", "Oylama sonucunu merak ediyorum 🍰", 2200, 10]] },
    34: { c: "Yüzükler hazır 💍", l: "" },
    35: { c: "Sofra süslerimiz 🕯️", l: "" },
    36: { c: "Annemin bahçesinden 🤍\n#aile", l: "" },
    37: { c: "Ablamın seçtiği buket 🦋\n#aile", l: "", y: [["u11", "Bunu ilk ben gördüm 😄", 2000, 6]] },
    38: { c: "Misafir sofrası çiçekleri 🌸", l: "" },
    39: { c: "Bir gül, bir ömür 🌹", l: "" },
    40: { c: "Aile sofrası 🍽️\n#aile", l: "İstanbul", y: [["u5", "Sofranız çok güzel, afiyet olsun 🍽️", 1900, 12]] },
    41: { c: "Kuzenimin doğum günü pastası 🎂", l: "" },
    42: { c: "Yüzükleri birlikte taktık 🤍", l: "" },
    43: { c: "Halamın getirdiği çiçekler 🌸\n#aile", l: "" },
    44: { c: "Nişan gecesi pastası 🎂", l: "" },
    45: { c: "Sade ve zarif, tam annemin seveceği gibi 🤍", l: "" },
    46: { c: "Annem çayı demledi, misafirler gelecek ☕️\n#aile", l: "İstanbul" },
    47: { c: "Pazar pikniği, ailecek 🌿\n#aile", l: "", y: [["u11", "Bu pikniğe ben de gelirim 😄", 1500, 8]] },
    48: { c: "Süslemelerimiz hazır 🤍", l: "" },
    49: { c: "Papatyalar, annemin en sevdiği 🌼", l: "" },
    50: { c: "Ablamın kurabiyeleri, kahve yanına ☕️🍪\n#aile", l: "" },
    51: { c: "Salonun son hâli ✨", l: "" },
    52: { c: "Aile yemeği, herkes bir arada 🍽️\n#aile", l: "İstanbul", y: [["u15", "Ailece olmak çok güzel 🤍", 1300, 9]] },
    53: { c: "Doğum günü sürprizi 🎂", l: "" },
    54: { c: "Annemin doğum günü 🤍\n#aile", l: "", y: [["u3", "Nice mutlu senelere 🤍", 1200, 14]] },
    55: { c: "İstanbul akşamı 🌆", l: "İstanbul" },
    56: { c: "Hafta sonu gezintisi 🌿\n#aile", l: "" },
    57: { c: "Küçük bir hediye, büyük bir teşekkür 🤍", l: "" }
  };

  /* ------------------------------------------------------------------ */
  /* KENDİ FOTOĞRAFLARIN                                                 */
  /* Fotoğraflarını `fotograflar/` klasörüne koyup                        */
  /* `python tools/import-photos.py` çalıştırdığında bu liste otomatik    */
  /* dolar; ızgaradaki yer tutucuların yerini senin fotoğrafların alır.   */
  /* (Ayrıntı: PROFILINI-DOLDUR.md)                                       */
  /* ------------------------------------------------------------------ */
  var KENDI_FOTOGRAFLARIM = [
    "media/photo-01.jpg",
    "media/photo-02.jpg",
    "media/photo-03.jpg",
    "media/photo-04.jpg",
    "media/photo-05.jpg",
    "media/photo-06.jpg",
    "media/photo-07.jpg",
    "media/photo-08.jpg",
    "media/photo-09.jpg"
  ];

  /* Profilden kaldırılan gönderiler (kullanıcı isteğiyle).
     Listenin başına eklemek yeterli — diğer gönderilerin numaraları kaymaz. */
  var KALDIRILAN_GONDERILER = ["p35", "p36", "p37", "p38", "p39", "p40", "p41", "p42", "p43", "p44", "p45", "p46", "p47", "p48", "p49", "p50", "p51", "p52", "p53", "p54", "p55", "p56", "p57", "p58", "p59", "p60", "p61", "p62", "p63", "p64", "p65", "p66", "p67", "p68", "p69", "p70", "p73", "p74", "p76", "p78", "p83"];

  (function () {
    var ornek = [];
    for (var i = 1; i <= 58; i++) {
      var no = (i < 10 ? "0" : "") + i;
      var pid = "p" + (25 + i);
      if (KALDIRILAN_GONDERILER.indexOf(pid) !== -1) continue;
      var detay = DUGUN_BASLIKLARI[i] || {};
      var yorumlar = (detay.y || []).map(function (r) { return C(r[0], r[1], r[2], r[3]); });
      /* 8 aylık zaman çizelgesi:
         - ilk 9 gönderi (kendi düğün fotoğrafların) ~1 ay önce
         - kalanlar 46 → 240 gün öncesine yayılır (nişan, aile, hazırlık) */
      var gunOnce = i <= 9
        ? 30 + (i - 1) * 1.4
        : 46 + (i - 10) * ((240 - 46) / (57 - 10));
      ornek.push(P({
        id: pid,
        userId: "u0",
        src: KENDI_FOTOGRAFLARIM[i - 1] || ("media/wedding-" + no + ".jpg"),
        mins: Math.round(60 * 24 * gunOnce),
        likes: 32 + ((i * 47) % 420),
        caption: detay.c || "",
        location: detay.l || "",
        comments: yorumlar,
        alt: "düğün albümü " + no,
        placeholder: true
      }));
    }
    POSTS = POSTS.concat(ornek);
  })();

  /* ------------------------------------------------------------------ */
  /* Düğün temalı, başka hesaplardan gelen gönderiler                    */
  /* Bu üçünde sen etiketlisin: "Etiketlenenler" sekmesi ve akış düğün   */
  /* içeriğiyle dolu görünür. (p84 · p85 · p86)                          */
  /* ------------------------------------------------------------------ */
  POSTS = POSTS.concat([
    P({
      id: "p84",
      userId: "u1", src: "media/photo-09.jpg", mins: 200, likes: 3120,
      location: "Galata", atUsers: ["u0"],
      caption: "Günseli için hazırladığım albümden bir kare 🤍 Işık tam istediğim gibiydi.\n#düğünfotoğrafı #albüm",
      comments: [
        C("u0", "Ellerine sağlık, hepsi çok güzel olmuş 🤍", 150, 12),
        C("u3", "Kadraj harika 📷", 120, 6)
      ]
    }),
    P({
      id: "p85",
      userId: "u7", src: "media/wedding-03.jpg", mins: 620, likes: 2480,
      location: "Kına Gecesi", atUsers: ["u0"],
      caption: "Kına gecemizden bir kare 🎉 Bu geceyi hiç unutmayacağız.\n#kına #kınagecesi #aile",
      comments: [C("u0", "Hepinize teşekkürler, harikaydı ❤️", 500, 22)]
    }),
    P({
      id: "p86",
      userId: "u9", src: "media/wedding-11.jpg", mins: 1300, likes: 1870,
      location: "Pastane", atUsers: ["u0"],
      caption: "Düğün pastası denemesi: üç kat, üstü canlı şakayık 🌸\n#düğünpastası #tatlı",
      comments: [C("u0", "Sabırsızlanıyorum 🍰", 1200, 9)]
    })
  ]);

  /* ------------------------------------------------------------------ */
  /* Nişan, kına, düğün ve günlük kareler (gönderilen fotoğraflardan)    */
  /* ------------------------------------------------------------------ */
  POSTS = POSTS.concat([
    P({
      id: "p90",
      userId: "u0", src: "media/dugun-01.jpg",
      mins: 43920, likes: 180,
      caption: "Gelin 🤍\n#düğün #gelin",
      comments: [C("u3", "Maşallah, çok güzel bir gelin oldun 🤍", 30, 22), C("u7", "Gelinliğin muhteşem! 😍", 25, 18), C("u16", "Karım çok güzel 🤍", 20, 34)]
    }),
    P({
      id: "p91",
      userId: "u0", src: "media/dugun-12.jpg",
      mins: 45792, likes: 217,
      caption: "Havai fişeklerle çıkış ✨\n#düğün",
      comments: [C("u11", "Havai fişekli çıkış efsane ✨", 40, 12), C("u1", "Bu kare çok romantik 📷", 35, 15)]
    }),
    P({
      id: "p92",
      userId: "u0", src: "media/dugun-02.jpg",
      mins: 46368, likes: 254,
      caption: "Damat çok yakışıklı 😍\n#düğün #damat",
      comments: [C("u5", "Damat çok şık olmuş 👏", 60, 14), C("u9", "Beyhan bey çok yakışmış, Günseli şanslı 😄", 55, 20)]
    }),
    P({
      id: "p93",
      userId: "u0", src: "media/dugun-03.jpg",
      mins: 47520, likes: 291,
      caption: "Evet dediğimiz an 🤍\n#düğün #nikâh",
      comments: [C("u1", "Bu kare albüme kapak olmalı 📷", 70, 26), C("u13", "Ömür boyu mutlu olun 🤍", 65, 19), C("u16", "Hayatımın en güzel anı", 60, 41)]
    }),
    P({
      id: "p94",
      userId: "u0", src: "media/dugun-10.jpg",
      mins: 48960, likes: 328,
      caption: "İyi ki sen 🤍",
      comments: [C("u3", "Birbirinize bakışınız çok güzel 🤍", 50, 23), C("u13", "Aşkınız daim olsun", 45, 11), C("u16", "İyi ki sen 🤍", 40, 38)]
    }),
    P({
      id: "p95",
      userId: "u0", src: "media/dugun-04.jpg",
      mins: 50112, likes: 365,
      caption: "Sevdiklerimizle dolu bir salon 🥰\n#düğün",
      comments: [C("u11", "Salon çok kalabalıktı, harikaydı 🎉", 80, 16), C("u3", "Herkes çok eğlendi", 75, 9)]
    }),
    P({
      id: "p96",
      userId: "u0", src: "media/dugun-05.jpg",
      mins: 51120, likes: 402,
      caption: "Bir yüzük, bir ömür 💍",
      comments: [C("u9", "Yüzükler tam oturmuş 💍", 90, 13), C("u7", "Elleriniz hiç ayrılmasın 🤍", 85, 21)]
    }),
    P({
      id: "p97",
      userId: "u0", src: "media/dugun-06.jpg",
      mins: 52416, likes: 439,
      caption: "Buketi ben tuttum 😄\n#düğün",
      comments: [C("u5", "Buketi tutan şanslı gelin 😄", 55, 17), C("u13", "Ben de o anı bekliyordum 🙈", 50, 8)]
    }),
    P({
      id: "p98",
      userId: "u0", src: "media/dugun-07.jpg",
      mins: 53856, likes: 476,
      caption: "Karı koca ilk dans öncesi 🤍",
      comments: [C("u11", "İlk dans öncesi heyecan 😍", 65, 14), C("u16", "O an sana bakınca her şeyi unuttum", 60, 29)]
    }),
    P({
      id: "p99",
      userId: "u0", src: "media/dugun-08.jpg",
      mins: 55584, likes: 513,
      caption: "Hazırlanırken… 🖤\n#düğün",
      comments: [C("u3", "Detaylar çok şık 👌", 70, 11), C("u9", "Damat hazırlanırken bile yakışıklı 😄", 65, 15)]
    }),
    P({
      id: "p100",
      userId: "u0", src: "media/dugun-09.jpg",
      mins: 57024, likes: 550,
      caption: "O gece herkes oynadı 🎶\n#düğün",
      comments: [C("u7", "O gece dans pisti hiç boş kalmadı 💃", 80, 12), C("u1", "Müzikler harikaydı 🎶", 75, 10)]
    }),
    P({
      id: "p101",
      userId: "u0", src: "media/dugun-11.jpg",
      mins: 58752, likes: 587,
      caption: "Düğün pastamız 🎂\n#düğünpastası",
      comments: [C("u9", "Pasta harika görünüyor 🎂", 90, 18), C("u5", "Tadına bayıldım!", 85, 9)]
    }),
    P({
      id: "p102",
      userId: "u0", src: "media/kina-01.jpg",
      mins: 64800, likes: 624,
      location: "Kına Salonu",
      caption: "Kına gecem ❤️\n#kına #kınagecesi",
      comments: [C("u7", "Kına gecen çok güzeldi ❤️", 120, 24), C("u5", "O elbise muhteşem!", 115, 17), C("u3", "Kına gecesi unutulmaz olur 🌙", 110, 13), C("u13", "Çok güzel bir geceydi 🌙", 100, 8)]
    }),
    P({
      id: "p103",
      userId: "u0", src: "media/nisan-02.jpg",
      mins: 82800, likes: 661,
      caption: "Kurdele kesme anı 🎀\n#nişan",
      comments: [C("u11", "Çok heyecanlıydınız 😄", 200, 14), C("u7", "Maşallah size 🤍", 190, 18)]
    }),
    P({
      id: "p104",
      userId: "u0", src: "media/nisan-01.jpg",
      mins: 83520, likes: 698,
      caption: "Nişanımız 🤍\n#nişan",
      comments: [C("u9", "Nişanınız hayırlı olsun 🤍", 210, 21), C("u1", "Kurdele kesme anı çok tatlı 🎀", 200, 12)]
    }),
    P({
      id: "p105",
      userId: "u0", src: "media/nisan-03.jpg",
      mins: 89280, likes: 735,
      location: "Nişan",
      caption: "GÜNSELLİ ♥ BEYHAN 🤍\n#nişan #aile",
      comments: [C("u3", "Pasta çok güzel, adınız da çok yakışmış 🤍", 320, 28), C("u9", "Bu pastayı ben de istiyorum 😄", 300, 15), C("u5", "Maşallah, ne güzel bir gün 🤍", 290, 19), C("u16", "İyi ki evet dedin 🤍", 280, 33)]
    }),
    P({
      id: "p106",
      userId: "u0", src: "media/gunluk-01.jpg",
      mins: 169920, likes: 772,
      caption: "Kızlar gecesi 🌸",
      comments: [C("u5", "Çok tatlı olmuşsun 🌸", 500, 16), C("u7", "Saçların harika olmuş 💫", 480, 11), C("u13", "Ne güzel bir kare!", 460, 7)]
    }),
    P({
      id: "p107",
      userId: "u0", src: "media/gunluk-02.jpg",
      mins: 295200, likes: 809,
      caption: "Deniz, kum, gün batımı 🌅",
      comments: [C("u13", "Deniz sana çok yakışıyor 🌅", 800, 13), C("u11", "Ne güzel bir gün batımı", 780, 9)]
    })
  ]);

  /* ------------------------------------------------------------------ */
  /* Hikâyeler                                                           */
  /* ------------------------------------------------------------------ */
  function story(userId, items) {
    return {
      userId: userId,
      items: items.map(function (it, i) {
        return {
          id: "s-" + userId + "-" + i,
          src: it[0], at: Date.now() - it[1] * MIN,
          caption: it[2] || "", audio: it[3] || ""
        };
      })
    };
  }

  var STORIES = [
    /* u0 (beyhan_günseli) için başlangıçta hikâye yok: "Hikâyen" girişinden
       kendi hikâyeni ekleyebilirsin. */
    story("u1", [
      [PIC("story-elif-1", 1080, 1920), 45, "Yeni seri hazırlanıyor 📷", "Orijinal ses"],
      [PIC("story-elif-2", 1080, 1920), 35, "", ""],
      [PIC("story-elif-3", 1080, 1920), 20, "Baskı provası", "Piano Günlüğü"]
    ]),
    story("u7", [
      [PIC("story-selin-1", 1080, 1920), 120, "Yeni rota 🗺️", "Yol Sesleri"],
      [PIC("story-selin-2", 1080, 1920), 90, "", ""]
    ]),
    story("u9", [
      [PIC("story-ayse-1", 1080, 1920), 180, "Bugünkü tarif 🍳", "Mutfağın Sesi"],
      [PIC("story-ayse-2", 1080, 1920), 150, "Oylama: makarna mı pilav mı?", ""]
    ]),
    story("u14", [[PIC("story-hakan-1", 1080, 1920), 260, "Taze kavurma geldi ☕️", "Caz Sabahı"]]),
    story("u3", [
      [PIC("story-zehran-1", 1080, 1920), 400, "Kumaş seçimi", "Orijinal ses"],
      [PIC("story-zehran-2", 1080, 1920), 380, "", ""]
    ]),
    story("u15", [[PIC("story-tolga-1", 1080, 1920), 600, "Yeni uçuş noktası 🚁", "Yükseklerde"]]),
    story("u11", [
      [PIC("story-denizsu-1", 1080, 1920), 800, "Yeni yuva 🏠", "Neşeli Melodi"],
      [PIC("story-denizsu-2", 1080, 1920), 780, "", ""]
    ]),
    story("u6", [[PIC("story-can-1", 1080, 1920), 1100, "Provada 🎸", "Yeni Şarkı (Demo)"]])
  ];

  /* ------------------------------------------------------------------ */
  /* Bildirimler — düğün paylaşımlarına gelen tepkiler                   */
  /* ------------------------------------------------------------------ */
  var NOTIFICATIONS = [
    { id: "n1", type: "like", userId: "u1", postId: "p26", mins: 6, thumb: "media/wedding-01.jpg", text: "gönderini beğendi" },
    { id: "n2", type: "comment", userId: "u3", postId: "p27", mins: 22, thumb: "media/wedding-02.jpg", text: "yorum yaptı: “Gelinlik muhteşem olmuş, bayıldım 😍”" },
    { id: "n3", type: "follow", userId: "u9", mins: 45, text: "seni takip etmeye başladı" },
    { id: "n4", type: "tag", userId: "u7", postId: "p85", mins: 90, thumb: "media/wedding-03.jpg", text: "bir gönderide seni etiketledi" },
    { id: "n5", type: "like", userId: "u15", postId: "p32", mins: 150, thumb: "media/wedding-07.jpg", text: "ve 214 kişi daha gönderini beğendi" },
    { id: "n6", type: "comment", userId: "u14", postId: "p35", mins: 260, thumb: "media/wedding-10.jpg", text: "yorum yaptı: “Davetiye tasarımı çok zarif olmuş ✨”" },
    { id: "n7", type: "follow", userId: "u5", mins: 420, text: "seni takip etmeye başladı" },
    { id: "n8", type: "comment", userId: "u4", postId: "p40", mins: 700, thumb: "media/wedding-15.jpg", text: "yorum yaptı: “Bu kareyi albüme koymalısınız 🤍”" },
    { id: "n9", type: "like", userId: "u6", postId: "p44", mins: 1500, thumb: "media/wedding-19.jpg", text: "gönderini beğendi" }
  ];

  /* ------------------------------------------------------------------ */
  /* Sohbetler                                                           */
  /* ------------------------------------------------------------------ */
  var CHATS = [
    /* ---------------- Düğün yazışmaları ---------------- */
    {
      id: "d1", userId: "u1", unread: 2, pinned: true,
      messages: [
        { id: "m1", from: "u1", mins: 55, text: "Günseli Hanım merhaba! Cumartesi çekimi için 15:00'te hazır olur musunuz?" },
        { id: "m2", from: "u0", mins: 48, text: "Merhaba Elif Hanım, 15:00 uygun. Gelinlik provası 13:00'te bitiyor." },
        { id: "m3", from: "u1", mins: 40, text: "Süper. Altın saat 17:30 civarı, o ışığı kaçırmayalım. Gelinciklerin olduğu ara sokaktan başlayalım mı?" },
        { id: "m4", from: "u0", mins: 32, text: "Çok iyi olur, o sokağı ben de çok seviyorum 🤍" },
        { id: "m5", from: "u1", mins: 12, text: "Albüm için 40 kare ayırdım, akşam linki atacağım." },
        { id: "m6", from: "u1", mins: 10, text: "Aile fotoğraflarını da ayrı bir klasöre koydum 📷" }
      ]
    },
    {
      id: "d2", userId: "u7", unread: 0,
      messages: [
        { id: "m7", from: "u7", mins: 300, text: "Kına için salonu ayarladım, cuma 19:00 🎉" },
        { id: "m8", from: "u0", mins: 290, text: "Süpersin! Kaç kişilik oldu?" },
        { id: "m9", from: "u7", mins: 280, text: "120 kişilik. Menü tadımı çarşamba, beraber gidelim." },
        { id: "m10", from: "u0", mins: 265, text: "Kesin gelirim. Çalma listesini de kuralım mı?" },
        { id: "m11", from: "u7", mins: 240, text: "Liste hazır 😄 İlk şarkı sizin girişiniz." },
        { id: "m12", from: "u0", mins: 230, text: "Ay çok heyecanlıyım 🥰" }
      ]
    },
    {
      id: "d3", userId: "u3", unread: 1,
      messages: [
        { id: "m13", from: "u3", mins: 160, text: "Günseli, duvak için dantel örnekleri geldi 🤍" },
        { id: "m14", from: "u0", mins: 150, text: "Bayıldım! Provada görebilir miyim?" },
        { id: "m15", from: "u3", mins: 140, text: "Tabii, perşembe 11:00 uygun mu? Bel kısmını da 2 cm daraltıyorum." },
        { id: "m16", from: "u0", mins: 130, text: "Perşembe 11:00 tamam. Ayakkabıyı da getireyim mi?" },
        { id: "m17", from: "u3", mins: 25, text: "Getir, boy ayarını ona göre yapalım 💐" }
      ]
    },
    {
      id: "d4", userId: "u9", unread: 0,
      messages: [
        { id: "m18", from: "u9", mins: 700, text: "Pasta tadımı için cumartesi 12:00 diyebiliriz 🤍" },
        { id: "m19", from: "u0", mins: 690, text: "Olur! Fıstıklı ve frambuazlı denemek istiyorum." },
        { id: "m20", from: "u9", mins: 680, text: "İkisini de hazırlarım. Kaç kişilik olacak?" },
        { id: "m21", from: "u0", mins: 670, text: "180 kişi civarı." },
        { id: "m22", from: "u9", mins: 660, text: "Üç katlı yaparız. Üstü canlı çiçek olsun mu?" },
        { id: "m23", from: "u0", mins: 650, text: "Kesinlikle — şakayık olursa harika olur 🌸" }
      ]
    },
    {
      id: "d5", userId: "u14", unread: 0,
      messages: [
        { id: "m24", from: "u0", mins: 1500, text: "Hakan Bey, nikâh sonrası kokteyl için kahve istasyonu kuruyor musunuz?" },
        { id: "m25", from: "u14", mins: 1480, text: "Merhaba! Evet: üç barista, filtre ve Türk kahvesi. 150 kişilik hesap yaptım ☕️" },
        { id: "m26", from: "u0", mins: 1460, text: "Harika. Tatlılarla uyumlu bir çekirdek önerir misiniz?" },
        { id: "m27", from: "u14", mins: 1440, text: "Etiyopya doğal işlem öneririm; meyveli tatlılarla çok iyi gider." },
        { id: "m28", from: "u0", mins: 1430, text: "Tamam, onu seçiyoruz." }
      ]
    },
    {
      id: "d6", userId: "u15", unread: 0,
      messages: [
        { id: "m29", from: "u15", mins: 2900, text: "Merhaba, düğün alanı için drone izin başvurusu onaylandı 🚁" },
        { id: "m30", from: "u0", mins: 2880, text: "Muhteşem! Saat kaçta gelebilirsiniz?" },
        { id: "m31", from: "u15", mins: 2860, text: "Tören 16:00'da başlıyorsa 15:30'da konumda olurum." },
        { id: "m32", from: "u0", mins: 2840, text: "Tamam, girişte karşılarız. Havadan giriş çekimi de olsun mu?" },
        { id: "m33", from: "u15", mins: 2820, text: "Olur, o planı da not aldım 👍" }
      ]
    },
    {
      id: "d7", userId: "u16", unread: 1, pinned: true,
      messages: [
        { id: "m34", from: "u16", mins: 171360, text: "Günseli, bugün annemle konuştum. Artık resmî olarak istemeye gelmek istiyoruz 🤍" },
        { id: "m35", from: "u0", mins: 171345, text: "Beyhan… şu an kalbim çok hızlı atıyor 😊" },
        { id: "m36", from: "u16", mins: 171338, text: "Ben de heyecanlıyım. Seni istiyorum Günseli, çok istiyorum." },
        { id: "m37", from: "u0", mins: 171330, text: "Ben de seni çok istiyorum 🤍" },
        { id: "m38", from: "u16", mins: 171322, text: "Cumartesi konuşalım, hazırlıkları anlatayım. Uygun musun?" },
        { id: "m39", from: "u0", mins: 171315, text: "Uygunum. İyi geceler aşkım 🤍" },
        { id: "m40", from: "u16", mins: 171310, text: "İyi geceler nişanlım… şimdiden söylüyorum 🥰" },
        { id: "m41", from: "u16", mins: 161280, text: "Günaydın 🤍 Cumartesi 14:00'te geleceğiz: babam, annem ve ablam." },
        { id: "m42", from: "u0", mins: 161268, text: "Ben de annemle tatlı yapıyorum 😄" },
        { id: "m43", from: "u16", mins: 161256, text: "Çok güzel. Şu an ellerim titriyor, söylemem gereken bir şey var." },
        { id: "m44", from: "u0", mins: 161250, text: "Ne söyleyeceksin?" },
        { id: "m45", from: "u16", mins: 161244, text: "Seni seviyorum. Onların karşısında da söyleyeceğim 🤍" },
        { id: "m46", from: "u0", mins: 161238, text: "Ben de seni seviyorum 🥰" },
        { id: "m47", from: "u16", mins: 151200, text: "Bugün hayatımın en güzel günüydü." },
        { id: "m48", from: "u0", mins: 151190, text: "Benim de 🥰 Nişanlım oldun 🤍" },
        { id: "m49", from: "u16", mins: 151182, text: "Yüzüğü takarken ellerim titriyordu, fark ettin mi?" },
        { id: "m50", from: "u0", mins: 151174, text: "Ettim 😊 Çok tatlıydın." },
        { id: "m51", from: "u16", mins: 151166, text: "Seni seviyorum nişanlım. Çok şükür." },
        { id: "m52", from: "u0", mins: 151158, text: "Ben de seni çok seviyorum 🤍" },
        { id: "m53", from: "u16", mins: 141120, text: "Günaydın 🤍 Bugün seni düşünerek uyandım." },
        { id: "m54", from: "u0", mins: 141110, text: "Günaydın aşkım, nasıl uyudun?" },
        { id: "m55", from: "u16", mins: 141100, text: "Seni rüyamda gördüm, çok güzeldi." },
        { id: "m56", from: "u0", mins: 141092, text: "Ne gördün?" },
        { id: "m57", from: "u16", mins: 141084, text: "Bizi. Kendi evimizde kahve içiyorduk. Seni çok istiyorum Günseli." },
        { id: "m58", from: "u0", mins: 141075, text: "Ben de o evi düşünüyorum 🤍" },
        { id: "m59", from: "u16", mins: 126720, text: "Salon 18 Ekim için müsait. Tarihi netleştirelim mi?" },
        { id: "m60", from: "u0", mins: 126710, text: "Ailelere de soralım ama bana uygun 🤍" },
        { id: "m61", from: "u16", mins: 126700, text: "Tamam, ben konuşurum. Nişanlımla evleniyorum 😄" },
        { id: "m62", from: "u0", mins: 126690, text: "Çok heyecanlıyım 🥰" },
        { id: "m63", from: "u16", mins: 112320, text: "Bugün sesimi biraz yükselttim, kusura bakma. Özür dilerim." },
        { id: "m64", from: "u0", mins: 112310, text: "Biraz üzüldüm ama önemli değil." },
        { id: "m65", from: "u16", mins: 112300, text: "Seni üzmek istemem, bir daha olmayacak. Söz." },
        { id: "m66", from: "u0", mins: 112290, text: "Tamam aşkım, seni seviyorum 🤍" },
        { id: "m67", from: "u16", mins: 112280, text: "Ben de seni çok seviyorum. Akşam konuşalım mı?" },
        { id: "m68", from: "u0", mins: 112270, text: "Konuşalım 🤍" },
        { id: "m69", from: "u16", mins: 97920, text: "Takım elbise provası yarın 16:00. Sen de gelir misin?" },
        { id: "m70", from: "u0", mins: 97910, text: "Gelirim tabii, en çok ben beğenmeliyim 😄" },
        { id: "m71", from: "u16", mins: 97900, text: "Karar senin 🤍 Sana yakışanı seçerim." },
        { id: "m72", from: "u0", mins: 97890, text: "Önce sen bak, ben onaylarım 😊" },
        { id: "m73", from: "u16", mins: 83520, text: "Bugün iş çıkışı sana uğrasam olur mu?" },
        { id: "m74", from: "u0", mins: 83512, text: "Tabii, çay koyarım ☕️" },
        { id: "m75", from: "u16", mins: 83504, text: "Sadece yüzünü görmek istedim. Seni çok özledim." },
        { id: "m76", from: "u0", mins: 83496, text: "Ben de seni çok özledim 🤍" },
        { id: "m77", from: "u16", mins: 69120, text: "Davetiyeleri bugün kargoya veriyorum. Heyecanlıyım." },
        { id: "m78", from: "u0", mins: 69110, text: "Ben de 🥰 Kaç gün kaldı?" },
        { id: "m79", from: "u16", mins: 69095, text: "48 gün. Sabırsızım Günseli, seni karım olarak görmek istiyorum." },
        { id: "m80", from: "u0", mins: 69085, text: "Az kaldı aşkım 🤍" },
        { id: "m81", from: "u16", mins: 54720, text: "Balayı için iki yer var, bakalım mı?" },
        { id: "m82", from: "u0", mins: 54710, text: "Bakalım 😍" },
        { id: "m83", from: "u16", mins: 54700, text: "Deniz manzaralı olanı çok beğendim. Sana da sürprizim var." },
        { id: "m84", from: "u0", mins: 54690, text: "Sürprizi şimdi söyle 😄" },
        { id: "m85", from: "u16", mins: 54680, text: "Olmaz, sabret 🤍" },
        { id: "m86", from: "u16", mins: 40320, text: "Nikâh şahidim hazır, evraklar tamam 🤍" },
        { id: "m87", from: "u0", mins: 40310, text: "Bende de her şey tamam. Çok az kaldı!" },
        { id: "m88", from: "u16", mins: 40300, text: "Söz veriyorum: ömrüm boyunca seni mutlu edeceğim." },
        { id: "m89", from: "u0", mins: 40290, text: "Seni seviyorum Beyhan 🤍" },
        { id: "m90", from: "u16", mins: 34560, text: "Provada gelinliğini gördüm, nefesim kesildi." },
        { id: "m91", from: "u0", mins: 34550, text: "Gerçekten mi 🥰" },
        { id: "m92", from: "u16", mins: 34540, text: "Çok güzelsin. Seni seviyorum." },
        { id: "m93", from: "u0", mins: 34530, text: "Sen de çok yakışıklısın 😊" },
        { id: "m94", from: "u16", mins: 28900, text: "Günaydın aşkım. Bugün hayatımızın ilk günü olacak 🤍" },
        { id: "m95", from: "u0", mins: 28890, text: "Günaydın 🥰 Ellerim titriyor, kuafördeyim." },
        { id: "m96", from: "u16", mins: 28880, text: "Ben de hazırlanıyorum. Seni ilk gördüğüm an için sabırsızım." },
        { id: "m97", from: "u0", mins: 28870, text: "Ben de 🥰" },
        { id: "m98", from: "u16", mins: 28860, text: "Bugün evet diyeceksin, değil mi? 😄" },
        { id: "m99", from: "u0", mins: 28850, text: "Bin kere evet 🤍" },
        { id: "m100", from: "u16", mins: 28400, text: "Karım 🤍" },
        { id: "m101", from: "u0", mins: 28390, text: "Kocam 🤍" },
        { id: "m102", from: "u16", mins: 28380, text: "Bugün hayatımın en güzel günüydü. Seni seviyorum Günseli." },
        { id: "m103", from: "u0", mins: 28370, text: "Ben de seni seviyorum. Artık resmî olarak seninim 🤍" },
        { id: "m104", from: "u16", mins: 28360, text: "İyi ki varsın. İyi geceler karıcığım." },
        { id: "m105", from: "u16", mins: 17280, text: "Deniz çok sakin. Kahvaltıya gelir misin?" },
        { id: "m106", from: "u0", mins: 17270, text: "Geliyorum ☀️ Buradan hiç dönmek istemiyorum." },
        { id: "m107", from: "u16", mins: 17260, text: "Ben de. Ama döndüğümüzde kendi evimiz var 🏡" },
        { id: "m108", from: "u0", mins: 17250, text: "O yüzden dönelim 🤍" },
        { id: "m109", from: "u16", mins: 17240, text: "Seni seviyorum." },
        { id: "m110", from: "u16", mins: 7200, text: "Eve vardık, valizleri bıraktım. Ortalık çok sessiz." },
        { id: "m111", from: "u0", mins: 7190, text: "Akşam yemeği için alışveriş yapayım mı?" },
        { id: "m112", from: "u16", mins: 7180, text: "Ben yaparım. Sen dinlen, karım 🤍" },
        { id: "m113", from: "u0", mins: 7170, text: "Kocam çok tatlısın 😊" },
        { id: "m114", from: "u16", mins: 2880, text: "Bugün erken çıkıyorum, seni almaya geleyim mi?" },
        { id: "m115", from: "u0", mins: 2870, text: "Olur, 18:00'de çıkıyorum 🤍" },
        { id: "m116", from: "u16", mins: 2860, text: "Kapıda olacağım. Seni seviyorum." },
        { id: "m117", from: "u16", mins: 180, text: "Günaydın güzelim 🤍 Dün akşam sana bakarken düşündüm: iyi ki seninle evlenmişim." },
        { id: "m118", from: "u0", mins: 160, text: "Günaydın aşkım 🥰 Ben de iyi ki seninle evlenmişim." },
        { id: "m119", from: "u16", mins: 60, text: "Seni seviyorum. Çok seviyorum. Her gün daha çok istiyorum seni 🤍" },
        { id: "m120", from: "u16", mins: 18, text: "Akşam için planım var, hazır ol 😉🤍" }
      ]
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Öne çıkanlar (highlights)                                           */
  /* Kapağı olan, adlandırılabilen daireler. Bir hesabın kendi öne       */
  /* çıkanı yoksa uygulama gönderilerinden otomatik oluşturur.           */
  /* ------------------------------------------------------------------ */
  var HIGHLIGHTS = [
    {
      id: "h1", userId: "u0", title: "Anılar",
      cover: "media/gunseli-01.jpg", postIds: [], createdAt: Date.now()
    },
    {
      id: "h2", userId: "u0", title: "Düğün",
      cover: "media/photo-01.jpg", postIds: [], createdAt: Date.now() + 1
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Takip grafiği ve kaydedilenler                                      */
  /* ------------------------------------------------------------------ */
  var FOLLOWS = {
    u0: ["u16", "u1", "u3", "u4", "u7", "u9", "u11", "u13", "u14"],
    u1: ["u0", "u3", "u7", "u15"],
    u2: ["u0", "u8", "u10"],
    u3: ["u0", "u1", "u7", "u15"],
    u4: ["u0", "u12", "u13"],
    u5: ["u0", "u9", "u11"],
    u6: ["u0", "u12"],
    u7: ["u0", "u1", "u15"],
    u8: ["u2", "u10"],
    u9: ["u0", "u5", "u14"],
    u10: ["u0", "u2", "u8"],
    u11: ["u0", "u5", "u13"],
    u12: ["u0", "u4", "u6"],
    u13: ["u0", "u11", "u4"],
    u14: ["u0", "u9"],
    u15: ["u0", "u1", "u3", "u7"],
    u16: ["u0"]
  };

  /* Oluştur ekranındaki "galeri" ve kamera modu için hazır görseller */
  var GALLERY = [
    PIC("galeri-01", 1080, 1080), PIC("galeri-02", 1080, 1080), PIC("galeri-03", 1080, 1350),
    PIC("galeri-04", 1080, 1080), PIC("galeri-05", 1080, 1350), PIC("galeri-06", 1080, 1080),
    PIC("galeri-07", 1080, 1080), PIC("galeri-08", 1080, 1350), PIC("galeri-09", 1080, 1080),
    PIC("galeri-10", 1080, 1080), PIC("galeri-11", 1080, 1350), PIC("galeri-12", 1080, 1080)
  ];

  var HASHTAGS = [
    { tag: "istanbul", count: "12,4 Mn gönderi", seed: "etiket-istanbul" },
    { tag: "kahve", count: "8,1 Mn gönderi", seed: "etiket-kahve" },
    { tag: "sokakfotoğrafçılığı", count: "3,2 Mn gönderi", seed: "etiket-sokak" },
    { tag: "yemektarifi", count: "6,7 Mn gönderi", seed: "etiket-yemek" },
    { tag: "seyahat", count: "24,9 Mn gönderi", seed: "etiket-seyahat" },
    { tag: "yazılım", count: "1,8 Mn gönderi", seed: "etiket-yazilim" },
    { tag: "kedi", count: "31,5 Mn gönderi", seed: "etiket-kedi" },
    { tag: "moda", count: "18,3 Mn gönderi", seed: "etiket-moda" },
    { tag: "koşu", count: "4,4 Mn gönderi", seed: "etiket-kosu" },
    { tag: "kitap", count: "5,9 Mn gönderi", seed: "etiket-kitap" },
    { tag: "bisiklet", count: "2,7 Mn gönderi", seed: "etiket-bisiklet" },
    { tag: "drone", count: "1,1 Mn gönderi", seed: "etiket-drone" }
  ];

  IG.seed = {
    meId: "u0",
    /* İÇERİK SÜRÜMÜ: tohum içeriği her değiştiğinde bu değeri güncelle.
       Tarayıcıda eski kayıt varsa uygulama kendini otomatik yeniler. */
    rev: "2026-10-16-baslik-gunseli",
    /* Profilde gösterilecek istatistikler. Takipçi/takip sayıları birebir bu
       değerler olacak şekilde normalleştirilir (demo grafiği hesaba katılır). */
    stats: { followers: 214, following: 444, posts: 58 },
    users: USERS,
    posts: POSTS,
    stories: STORIES,
    notifications: NOTIFICATIONS,
    chats: CHATS,
    follows: FOLLOWS,
    highlights: HIGHLIGHTS,
    saved: ["p3", "p9"],
    gallery: GALLERY,
    hashtags: HASHTAGS,
    version: 1
  };
})(window.IG);
