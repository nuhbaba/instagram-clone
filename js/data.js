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
      id: "u0", username: "gunseli_beyhan", name: "Günseli Beyhan", avatar: "media/gunseli-01.jpg",
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
      id: "p" + pseq,
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
      atUsers: ["u0"],
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
      atUsers: ["u0", "u5", "u13"],
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
       Kendi profilin (u0 · gunseli_beyhan) 0 gönderiyle başlar. */
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
  /* Profil ızgarası: 58 örnek (yer tutucu) gönderi                      */
  /* Profilin "58 gönderi" göstermesi ve ızgaranın dolu görünmesi için.  */
  /* Bunlar akışta ve keşfette görünmez; Ayarlar > "Örnek gönderileri    */
  /* temizle" ile tek dokunuşta kaldırılabilir. Kendi fotoğraflarını     */
  /* ekledikçe bunları silip yerine koyabilirsin.                        */
  /* ------------------------------------------------------------------ */
  (function () {
    var ornek = [];
    for (var i = 1; i <= 58; i++) {
      var no = (i < 10 ? "0" : "") + i;
      ornek.push(P({
        userId: "u0",
        src: PIC("gunseli-" + no, 1080, i % 3 === 0 ? 1350 : 1080),
        mins: 60 * 24 * (3 + i * 2),
        likes: 32 + ((i * 47) % 420),
        caption: "",
        alt: "profil " + no,
        placeholder: true
      }));
    }
    POSTS = POSTS.concat(ornek);
  })();

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
    /* u0 (gunseli_beyhan) için başlangıçta hikâye yok: "Hikâyen" girişinden
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
  /* Bildirimler                                                         */
  /* Henüz gönderi paylaşmadığın için bildirimler takip / etiketleme     */
  /* türündedir. Kendi gönderini paylaştığında beğeni ve yorum           */
  /* bildirimleri de akmaya başlar.                                      */
  /* ------------------------------------------------------------------ */
  var NOTIFICATIONS = [
    { id: "n1", type: "follow", userId: "u1", mins: 12, text: "seni takip etmeye başladı" },
    { id: "n2", type: "tag", userId: "u1", postId: "p1", mins: 35, thumb: PIC("istanbul-sokak-01", 200, 200), text: "bir gönderide seni etiketledi" },
    { id: "n3", type: "follow", userId: "u9", mins: 70, text: "seni takip etmeye başladı" },
    { id: "n4", type: "mention", userId: "u4", mins: 150, thumb: PIC("kod-ekran-04", 200, 200), text: "bir gönderide senden bahsetti" },
    { id: "n5", type: "follow", userId: "u7", mins: 260, text: "seni takip etmeye başladı" },
    { id: "n6", type: "tag", userId: "u11", postId: "p6", mins: 420, thumb: PIC("kedi-bahce-06", 200, 200), text: "bir gönderide seni etiketledi" },
    { id: "n7", type: "follow", userId: "u14", mins: 700, text: "seni takip etmeye başladı" },
    { id: "n8", type: "follow", userId: "u3", mins: 1500, text: "seni takip etmeye başladı" },
    { id: "n9", type: "follow", userId: "u15", mins: 2600, text: "seni takip etmeye başladı" }
  ];

  /* ------------------------------------------------------------------ */
  /* Sohbetler                                                           */
  /* ------------------------------------------------------------------ */
  var CHATS = [
    {
      id: "d1", userId: "u1", unread: 2, pinned: true,
      messages: [
        { id: "m1", from: "u1", mins: 180, text: "Selam! Cumartesi fotoğraf yürüyüşüne var mısın?" },
        { id: "m2", from: "u0", mins: 176, text: "Kesinlikle! Saat ve buluşma noktası?" },
        { id: "m3", from: "u1", mins: 60, text: "10:00, Balat'taki kahvecinin önü." },
        { id: "m4", from: "u1", mins: 58, text: "Tripodunu getir, uzun pozlama deneyeceğiz 📷" }
      ]
    },
    {
      id: "d2", userId: "u7", unread: 0,
      messages: [
        { id: "m5", from: "u7", mins: 1440, text: "Yeni rota haritasını hazırladım, göz atmak ister misin?" },
        { id: "m6", from: "u0", mins: 1430, text: "Tabii ki, özellikle Likya kısmı ilgimi çekti." },
        { id: "m7", from: "u7", mins: 1420, text: "O bölümü 4 güne yaydım, kamp alanları da işaretli 🥾" },
        { id: "m8", from: "u0", mins: 1400, text: "Harika, teşekkürler! Planı uygulamaya kaydettim." }
      ]
    },
    {
      id: "d3", userId: "u4", unread: 1,
      messages: [
        { id: "m9", from: "u4", mins: 300, text: "Açık kaynak projeye PR attım, gözden geçirir misin?" },
        { id: "m10", from: "u0", mins: 290, text: "Bakıyorum şimdi. Testler geçiyor mu?" },
        { id: "m11", from: "u4", mins: 40, text: "Hepsi yeşil ✅ Sadece kod yorumları kaldı." }
      ]
    },
    {
      id: "d4", userId: "u9", unread: 0,
      messages: [
        { id: "m12", from: "u0", mins: 2600, text: "Tarif için teşekkürler, akşam yaptım 👏" },
        { id: "m13", from: "u9", mins: 2580, text: "Ellerine sağlık! Bir sonraki tarifi de beğeneceğini düşünüyorum 🍽️" }
      ]
    },
    {
      id: "d5", userId: "u14", unread: 0,
      messages: [
        { id: "m14", from: "u14", mins: 4200, text: "Cumartesi tadım için yer ayırdım, 2 kişilik ☕️" },
        { id: "m15", from: "u0", mins: 4180, text: "Süper, kardeşimi de getiriyorum." },
        { id: "m16", from: "u14", mins: 4160, text: "Ne güzel, görüşürüz o zaman!" }
      ]
    },
    {
      id: "d6", userId: "u3", unread: 0,
      messages: [
        { id: "m17", from: "u3", mins: 7000, text: "Atölyeye bekliyorum, kumaş örneklerini gösteririm." },
        { id: "m18", from: "u0", mins: 6900, text: "Haftaya uğrarım mutlaka 🙌" }
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
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Takip grafiği ve kaydedilenler                                      */
  /* ------------------------------------------------------------------ */
  var FOLLOWS = {
    u0: ["u1", "u3", "u4", "u7", "u9", "u11", "u13", "u14"],
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
    u15: ["u0", "u1", "u3", "u7"]
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
    /* Profilde gösterilecek istatistikler. Takipçi/takip sayıları birebir bu
       değerler olacak şekilde normalleştirilir (demo grafiği hesaba katılır). */
    stats: { followers: 215, following: 444, posts: 58 },
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
