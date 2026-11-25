const KX_CONFIG = {
  fibNumber: "0770 000 0000",
  initialBalance: 10000,

  // ١. گۆرانییەکانی ڕادیۆی GTA VI (دەتوانیت لینکی MP3 یان فایلی song1.mp3 دابنێیت)
  tracks: [
    { title: "Blood In Your Eyes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "Love Is A Long Road", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { title: "Hot Together (Vice)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
  ],

  // ٢. ئیڤێنت و پاڵەوانێتییەکان بە وێنە و کاتژمێری ژماردنی پێچەوانە
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

  // ٣. هەواڵەکان
  news: [
    {
      tag: "OFFICIAL",
      title: "KX Arena Vice Edition",
      body: "بەشداری خولەکانی PUBG و eFootball بکە لەسەر سێرڤەری کوردی، عێراقی و ئەوروپی.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
    }
  ],

  // ٤. ژوورە دەنگییەکان
  voiceRooms: [
    { id: 1, name: "ژووری گشتی یاریزانانی کورد", count: 18, tag: "PUBG & Chill", locked: false },
    { id: 2, name: "ژووری سکوادەکانی Erangel", count: 9, tag: "Competitive", locked: false }
  ]
};
