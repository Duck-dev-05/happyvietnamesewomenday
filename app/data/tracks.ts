export interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;
}

// Playlist with 4 real MP3 files in /public/music/
export const tracks: Track[] = [
  {
    id: 1,
    title: "Em Tôi",
    artist: "Thanh Lam",
    src: "/music/Em Tôi.mp3",
  },
  {
    id: 2,
    title: "Xinh Tươi Việt Nam",
    artist: "V.Music",
    src: "/music/Xinh Tươi Việt Nam.mp3",
  },
  {
    id: 3,
    title: "Là Con Gái Phải Xinh",
    artist: "Bảo Thy",
    src: "/music/Là Con Gái Phải Xinh.mp3",
  },
  {
    id: 4,
    title: "Em Trong Mắt Tôi",
    artist: "Nguyễn Đức Cường",
    src: "/music/Em Trong Mắt Tôi.mp3",
  },
  {
    id: 5,
    title: "Tình Bạn Diệu Kỳ",
    artist: "Amee, Ricky Star, Lăng LD",
    src: "/music/Tình Bạn Diệu Kỳ - AMee, Ricky Star, Lăng LD - VPop.mp3",
  },
];
