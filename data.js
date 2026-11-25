// ========================================================
// بەشی دەستکاریکردنی خێرا (تەنها لێرە گۆڕانکاری بکە!)
// ========================================================

const KX_CONFIG = {
  fibNumber: "0770 000 0000", // ژمارەی FIB بۆ وەرگرتنی پارە
  initialBalance: 10000,      // باڵانسی سەرەتایی دیاری بۆ یاریزانی نوێ

  // ١. لیستی گۆرانییەکانی ڕادیۆی GTA VI (دەتوانیت لینکی MP3ی خۆت دابنێیت)
  tracks: [
    { title: "Blood In Your Eyes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "Love Is A Long Road", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { title: "Hot Together (Vice)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
  ],

  // ٢. لیستی ئیڤێنت و پاڵەوانێتییەکان (هەر خولێکی نوێ لێرە زیاد بکە)
  events: [
    {
      id: 1,
      title: "PUBG Mobile Squad Championship",
      game: "PUBG MOBILE",
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80",
      startDate: "2026/12/01 • 21:00",
      targetTime: Date.now() + (3 * 86400000) + (5 * 3600000),
      prize: "150,000 IQD",
      entry: 3000
    },
    {
      id: 2,
      title: "eFootball 2026 Pro Cup (1v1)",
      game: "EFOOTBALL",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
      startDate: "2026/11/28 • 20:30",
      targetTime: Date.now() + (1 * 86400000) + (14 * 3600000),
      prize: "50,000 IQD",
      entry: 2000
    }
  ],

  // ٣. هەواڵ و ڕاگەیاندنەکان
  news: [
    {
      tag: "ڕاگەیاندنی فەرمی",
      title: "وەشانی نوێی KX Arena Vice Edition بەردەستە!",
      body: "ئێستا دەتوانن لە ڕێگەی سێرڤەری کوردی، عێراقی و ئەوروپییەوە بەشداری خولەکانی PUBG و eFootball بکەن.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
    }
  ],

  // ٤. ژوورە دەنگییە سەرەتاییەکان
  voiceRooms: [
    { name: "ژووری گشتی یاریزانانی کورد", count: 18, tag: "PUBG & Chill" },
    { name: "ژووری سکوادەکانی Erangel", count: 9, tag: "Competitive" }
  ]
};

