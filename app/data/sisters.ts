export interface Sister {
  id: number;
  slug: string;
  name: string;
  handle: string;
  photo: string;
  emoji: string;
  traits: string[];
  wish: string;
  appreciation: string;
  wishId?: number;
  createdAt?: string;
}

// Names and handles confirmed by the sender's screenshot. No assumed portraits or traits.
export const sisters: Sister[] = [
  {
    id: 1, slug: "huong-tra", name: "Hoàng Thị Hương Trà", handle: "@huong.tra.866522",
    photo: "/avatars/sister-1.png", emoji: "🌸", traits: [],
    wish: "",
    appreciation: "",
  },
  {
    id: 2, slug: "ngoc-anh", name: "Nguyễn Phương Ngọc Ánh", handle: "@NguyenPhuongNgocAnh4920",
    photo: "/avatars/sister-5.jpg", emoji: "✨", traits: [],
    wish: "",
    appreciation: "",
  },
  {
    id: 3, slug: "ngoc-anh-hoang", name: "Hoàng Ngọc Anh", handle: "@ngoc.anh.hoang.72661",
    photo: "/avatars/sister-2.jpg", emoji: "🌷", traits: [],
    wish: "",
    appreciation: "",
  },
  {
    id: 4, slug: "nguyen-chau", name: "Nguyễn Dương Bảo Châu", handle: "@nguyen.chau.931084",
    photo: "/avatars/sister-3.png", emoji: "🌼", traits: [],
    wish: "",
    appreciation: "",
  },
  {
    id: 5, slug: "nguyen-duong-huong-giang", name: "Nguyễn Dương Hương Giang", handle: "@huonggiang.nguyenduong.9",
    photo: "/avatars/sister-4.jpg", emoji: "🌺", traits: [],
    wish: "",
    appreciation: "",
  },
  {
    id: 6, slug: "nguyen-minh-phuong", name: "Nguyễn Minh Phương", handle: "@nguyen.minh.phuong.264640",
    photo: "/avatars/sister-6.png", emoji: "💐", traits: [],
    wish: "",
    appreciation: "",
  },
];

