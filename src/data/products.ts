export interface Product {
  id: string;
  name: string;
  category: Category;
  categories?: Category[];
  price: number;
  originalPrice?: number;
  description: string;
  details: string[];
  images: string[];
  badge?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  stock?: number;
}

// Stock levels - update these when restocking
const stockLevels: Record<string, number> = {
  "1": 2,  // Kaveri
  "2": 1,  // Raahi
  "3": 2,  // Saanjh
  "4": 2,  // Adaa
  "5": 2,  // Ruhani
  "6": 2,  // Kanak
  "7": 2,  // Sunehri
  "8": 1,  // Virasat
  "9": 2,  // Antara
  "10": 2, // Chandni
  "11": 2, // Rajsi
  "12": 2, // Bella
  "13": 2, // Blossom
  "14": 2, // Ziya
  "15": 1, // Grace
  "16": 2, // Iris
  "17": 2, // Stella
  "18": 2, // Hope
  "19": 2, // Luna
  "20": 2, // Lily
  "21": 2, // Daisy
  "22": 2, // Zahara
};

export type Category =
  | "necklaces"
  | "earrings"
  | "rings"
  | "bracelets"
  | "bridal-sets"
  | "anti-tarnish"
  | "american-diamond";

export const categories: { slug: Category; name: string; description: string; image: string }[] = [
  {
    slug: "necklaces",
    name: "Necklaces",
    description: "Elegant necklaces crafted with precision, from chokers to long layered pieces",
    image: "/products/Kaveri/kaveri-1.png",
  },
  {
    slug: "bridal-sets",
    name: "Bridal Sets",
    description: "Complete bridal jewellery sets for your most special day",
    image: "/products/Saanjh/saanjh-1.png",
  },
  {
    slug: "anti-tarnish",
    name: "Anti Tarnish",
    description: "Long-lasting jewellery with anti-tarnish coating — stays beautiful wear after wear",
    image: "/products/Bella/bella-1.png",
  },
  {
    slug: "american-diamond",
    name: "American Diamond",
    description: "Sparkling AD stone jewellery that captures the brilliance of real diamonds",
    image: "/products/Ruhani/ruhani-1.png",
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    description: "Statement bracelets and bangles crafted with premium finishes for everyday luxury",
    image: "/products/Zahara/zahara-1.png",
  },
  {
    slug: "earrings",
    name: "Earrings",
    description: "Statement earrings that add the perfect finishing touch to every look",
    image: "/products/Ziya/ziya-1.png",
  },
  {
    slug: "rings",
    name: "Rings",
    description: "Exquisite rings from delicate bands to bold cocktail pieces",
    image: "/products/Virasat/virasat-1.png",
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Kaveri Necklace Set",
    category: "necklaces",
    categories: ["necklaces", "bridal-sets"],
    price: 1999,
    description:
      "Inspired by timeless Indian heritage and crafted with regal elegance, the Kaveri Necklace Set is a statement piece designed for women who love traditional artistry with a luxurious modern touch. Featuring intricate filigree detailing, floral circular motifs, and delicate handcrafted elements — this set beautifully captures the richness of ethnic Indian jewellery. Perfect for weddings, festive celebrations, and special occasions, Kaveri adds effortless grace to every look.",
    details: [
      "Design: Intricate filigree with floral circular motifs",
      "Finish: Luxurious gold-tone with handcrafted elements",
      "Includes: Necklace + matching earrings",
      "Occasion: Weddings, festive celebrations, special occasions",
      "Why You'll Love It: A celebration of elegance, femininity, and timeless Indian craftsmanship",
    ],
    images: [
      "/products/Kaveri/kaveri-1.png",
      "/products/Kaveri/kaveri-2.png",
      "/products/Kaveri/kaveri-3.png",
      "/products/Kaveri/kaveri-4.png",
    ],
    // badge removed,
    isBestseller: true,
  },
  {
    id: "2",
    name: "Raahi Necklace Set",
    category: "necklaces",
    categories: ["necklaces", "bridal-sets"],
    price: 4499,
    description:
      "A timeless blend of royal elegance and modern femininity, the Raahi Necklace Set is designed for women who love statement jewellery with a soft, luxurious touch. Featuring a beautifully structured Hasli-inspired silhouette adorned with shimmering Polki-style stones, delicate blush pink bead drops, and pearl accents that add grace to every movement. Crafted with intricate detailing and a rich gold-tone finish, Raahi captures the charm of traditional Indian jewellery while offering a contemporary designer aesthetic.",
    details: [
      "Design: Hasli-inspired silhouette with Polki-style stones",
      "Accents: Blush pink bead drops and pearl detailing",
      "Finish: Rich gold-tone with contemporary designer aesthetic",
      "Includes: Necklace + matching statement earrings",
      "Why You'll Love It: Grace, royalty, and timeless elegance — perfect for weddings and celebrations",
    ],
    images: [
      "/products/Raahi/raahi-1.png",
      "/products/Raahi/raahi-2.png",
      "/products/Raahi/raahi-3.png",
      "/products/Raahi/raahi-4.png",
    ],
    // badge removed,
  },
  {
    id: "3",
    name: "Saanjh Choker Set",
    category: "bridal-sets",
    categories: ["necklaces", "bridal-sets"],
    price: 5499,
    description:
      "A timeless blend of regal elegance and traditional craftsmanship, this exquisite choker set is designed to make every occasion unforgettable. Featuring intricate floral filigree detailing, premium kundan-style stones, delicate pearl accents, and rich emerald-green bead drops — this statement piece beautifully captures the essence of royal Indian jewellery. Crafted with a luxurious antique gold finish, the choker sits gracefully around the neck, offering a bold yet elegant look.",
    details: [
      "Design: Intricate floral filigree with kundan-style stones",
      "Accents: Pearl drops and emerald-green bead detailing",
      "Finish: Luxurious antique gold",
      "Includes: Choker necklace + matching statement earrings",
      "Why You'll Love It: Royal Indian artistry that brings effortless grandeur to every outfit",
    ],
    images: [
      "/products/Saanjh/saanjh-1.png",
      "/products/Saanjh/saanjh-2.png",
      "/products/Saanjh/saanjh-3.png",
      "/products/Saanjh/saanjh-4.png",
    ],
    // badge removed,
    isBestseller: true,
  },
  {
    id: "4",
    name: "Adaa Necklace Set",
    category: "necklaces",
    categories: ["necklaces", "american-diamond"],
    price: 3999,
    description:
      "A statement of timeless elegance, this exquisite necklace set is crafted to turn every moment into a celebration of grace and glamour. Featuring a beautifully detailed paisley-inspired pendant adorned with dazzling American Diamonds and rich ruby-toned stones — this masterpiece reflects royal charm with a modern luxury touch. The finely textured gold-finish chain adds refined richness, while the brilliant stone arrangement enhances the sparkle from every angle.",
    details: [
      "Design: Paisley-inspired pendant with AD and ruby-toned stones",
      "Finish: Finely textured gold-finish chain",
      "Includes: Necklace + matching statement earrings",
      "Occasion: Weddings, receptions, cocktail evenings, celebrations",
      "Why You'll Love It: Rich ruby tones, intricate AD craftsmanship, and regal paisley silhouette",
    ],
    images: [
      "/products/Adaa/adaa-1.png",
      "/products/Adaa/adaa-2.png",
      "/products/Adaa/adaa-3.png",
      "/products/Adaa/adaa-4.png",
    ],
    // badge removed,
    isBestseller: true,
  },
  {
    id: "5",
    name: "Ruhani Necklace Set",
    category: "necklaces",
    categories: ["necklaces", "american-diamond"],
    price: 3999,
    description:
      "Graceful, regal, and timeless — the Ruhani Necklace Set is crafted for women who love statement elegance with a touch of royalty. Featuring shimmering AD stones beautifully paired with rich emerald green bead strands, this luxurious set creates a perfect balance of sophistication and traditional charm. The intricately designed pendant and matching chandelier earrings are adorned with delicate detailing and emerald drop accents.",
    details: [
      "Design: Shimmering AD stones with emerald green bead strands",
      "Accents: Emerald drop accents and chandelier earrings",
      "Finish: Rich gold-tone with intricate detailing",
      "Includes: Necklace + matching chandelier earrings",
      "Why You'll Love It: Sparkling diamond-like brilliance paired with deep emerald tones for a rich luxurious appeal",
    ],
    images: [
      "/products/Ruhani/ruhani-1.png",
      "/products/Ruhani/ruhani-2.png",
      "/products/Ruhani/ruhani-3.png",
      "/products/Ruhani/ruhani-4.png",
    ],
    // badge removed,
  },
  {
    id: "6",
    name: "Kanak Necklace Set",
    category: "necklaces",
    categories: ["necklaces", "bridal-sets"],
    price: 1999,
    description:
      "Crafted with exquisite filigree-inspired detailing, this statement necklace set is designed for women who appreciate timeless Indian craftsmanship with a refined modern touch. The intricate openwork patterns, delicate bead edging, and soft reflective stones create a rich heritage aesthetic that instantly elevates every look. Its warm antique gold finish adds a royal charm.",
    details: [
      "Design: Filigree-inspired openwork with delicate bead edging",
      "Finish: Warm antique gold with reflective stone accents",
      "Includes: Necklace + matching statement earrings",
      "Occasion: Bridal festivities, weddings, festive celebrations",
      "Why You'll Love It: Timeless Indian craftsmanship that feels classic, sophisticated, and unforgettable",
    ],
    images: [
      "/products/Kanak/kanak-1.png",
      "/products/Kanak/kanak-2.png",
      "/products/Kanak/kanak-3.png",
      "/products/Kanak/kanak-4.png",
    ],
    // badge removed,
  },
  {
    id: "7",
    name: "Sunehri Ring",
    category: "rings",
    price: 999,
    description:
      "A regal blend of tradition and artistry, this handcrafted antique-finish statement ring is designed to instantly elevate your festive and ethnic looks. Featuring intricate textured detailing, dual evil-eye inspired motifs with ruby-toned stones, and a beautifully carved center adorned with kundan-style accents and an emerald-green centerpiece. The delicate hanging ghungroo charms add graceful movement.",
    details: [
      "Design: Evil-eye motifs with ruby-toned stones and emerald centerpiece",
      "Accents: Ghungroo charms and layered chains",
      "Finish: Antique gold with kundan-style accents",
      "Fit: Adjustable back design for comfortable wear",
      "Why You'll Love It: Heritage elegance with bold femininity — a true conversation piece",
    ],
    images: [
      "/products/Sunehri/sunehri-1.png",
      "/products/Sunehri/sunehri-2.png",
      "/products/Sunehri/sunehri-3.png",
      "/products/Sunehri/sunehri-4.png",
    ],
    // badge removed,
  },
  {
    id: "8",
    name: "Virasat Ring",
    category: "rings",
    price: 999,
    description:
      "A masterpiece inspired by timeless Indian artistry, Virasat is a regal statement ring crafted to capture attention instantly. Designed with intricate peacock detailing at the center, this oversized heritage ring beautifully blends traditional craftsmanship with luxurious elegance. The rich emerald green enamel accents, ruby-toned stones, and ghungroo danglings create a royal aesthetic.",
    details: [
      "Design: Intricate peacock detailing with emerald green enamel",
      "Accents: Ruby-toned stones, kundan elements, ghungroo danglings",
      "Finish: Antique gold with vintage royal aesthetic",
      "Fit: Adjustable — bold oversized silhouette",
      "Why You'll Love It: Culture, elegance, and timeless beauty — a statement of artistic tradition",
    ],
    images: [
      "/products/Virasat/virasat-1.png",
      "/products/Virasat/virasat-2.png",
      "/products/Virasat/virasat-3.png",
      "/products/Virasat/virasat-4.png",
    ],
    // badge removed,
  },
  {
    id: "9",
    name: "Antara Temple Necklace Set",
    category: "necklaces",
    categories: ["necklaces", "bridal-sets"],
    price: 3999,
    description:
      "This exquisite temple-inspired necklace set is a celebration of timeless Indian craftsmanship and regal elegance. Designed with intricate peacock motifs, delicate Lakshmi detailing, shimmering stone accents, and graceful pearl-green bead danglings — this piece beautifully captures the richness of traditional heritage jewellery. The luxurious antique gold finish adds a royal touch.",
    details: [
      "Design: Temple-inspired with peacock motifs and Lakshmi detailing",
      "Accents: Shimmering stones and pearl-green bead danglings",
      "Finish: Luxurious antique gold",
      "Includes: Necklace + matching statement earrings",
      "Why You'll Love It: Heritage artistry with regal elegance — perfect for weddings, poojas, and grand celebrations",
    ],
    images: [
      "/products/Antara/antara-1.png",
      "/products/Antara/antara-2.png",
      "/products/Antara/antara-3.png",
      "/products/Antara/antara-4.png",
    ],
    // badge removed,
    isBestseller: true,
  },
  {
    id: "10",
    name: "Chandni Necklace Set",
    category: "necklaces",
    categories: ["necklaces", "american-diamond"],
    price: 3999,
    description:
      "A statement of timeless sophistication, Chandni is designed for women who adore refined glamour with a modern royal touch. Featuring a dazzling circular pendant adorned with brilliant American Diamonds and a rich emerald-green centerpiece — this necklace set effortlessly blends elegance with luxury. Perfect for cocktail evenings, wedding celebrations, and elegant soirées.",
    details: [
      "Design: Circular pendant with AD stones and emerald-green centerpiece",
      "Finish: Intricate layered detailing with modern royal aesthetic",
      "Includes: Necklace + matching earrings",
      "Occasion: Cocktail evenings, weddings, festive occasions",
      "Why You'll Love It: Bold emerald contrast with shimmering AD — contemporary yet timeless",
    ],
    images: [
      "/products/Chandni/chandni-1.png",
      "/products/Chandni/chandni-2.png",
      "/products/Chandni/chandni-3.png",
      "/products/Chandni/chandni-4.png",
    ],
    // badge removed,
  },
  {
    id: "11",
    name: "Rajsi Necklace Set",
    category: "necklaces",
    categories: ["necklaces", "bridal-sets", "american-diamond"],
    price: 2999,
    description:
      "This exquisite peacock-inspired necklace set is a perfect blend of royal elegance and timeless craftsmanship. Adorned with shimmering AD stones, emerald green accents, and delicate pearl danglings — the intricate design beautifully captures the charm of traditional Indian jewellery with a luxurious modern finish.",
    details: [
      "Design: Peacock-inspired with swan motif and openwork detailing",
      "Accents: Shimmering AD stones, emerald green, pearl danglings",
      "Finish: Luxurious gold-tone with heritage charm",
      "Includes: Necklace + matching earrings with pearl drops",
      "Why You'll Love It: Royal peacock artistry with sophisticated sparkle — perfect for weddings and celebrations",
    ],
    images: [
      "/products/Rajsi/rajsi-1.png",
      "/products/Rajsi/rajsi-2.png",
      "/products/Rajsi/rajsi-3.png",
      "/products/Rajsi/rajsi-4.png",
    ],
    // badge removed,
  },
  {
    id: "12",
    name: "Bella Necklace",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 1999,
    description:
      "A bold anti-tarnish statement necklace designed for women who love luxurious yet long-lasting jewellery. Featuring a chunky gold-toned chain and an intricately detailed dual panther-inspired pendant with sparkling stone embellishments — this piece is crafted to retain its shine and elegance wear after wear. Perfect for elevating western, fusion, or party looks, it brings together glamour, durability, and effortless sophistication in one timeless design.",
    details: [
      "Design: Chunky gold-toned chain with dual panther-inspired pendant",
      "Accents: Sparkling stone embellishments with intricate detailing",
      "Finish: Premium anti-tarnish coating for long-lasting shine",
      "Occasion: Dinner dates, vacations, festive occasions, everyday glam",
      "Why You'll Love It: Striking statement design with premium anti-tarnish quality — lightweight, comfortable, and effortlessly stylish",
    ],
    images: [
      "/products/Bella/bella-1.png",
      "/products/Bella/bella-2.png",
      "/products/Bella/bella-3.png",
      "/products/Bella/bella-4.png",
    ],
    badge: "New Launch",
    isNew: true,
    isBestseller: true,
  },
  {
    id: "13",
    name: "Blossom Necklace",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 1499,
    description:
      "A timeless statement necklace crafted with a premium anti-tarnish finish, designed to retain its shine and elegance wear after wear. Featuring a beautifully sculpted floral pendant on a sleek gold-tone chain, this piece blends modern luxury with everyday durability — perfect for elevating both casual and occasion looks.",
    details: [
      "Design: Sculpted floral pendant on a sleek gold-tone chain",
      "Finish: Premium anti-tarnish coating for lasting brilliance",
      "Style: Modern luxury meets everyday durability",
      "Occasion: Casual outings, workwear, celebrations, layering",
      "Why You'll Love It: Bold yet graceful floral design with anti-tarnish quality — lightweight, minimal maintenance, and effortlessly elegant",
    ],
    images: [
      "/products/Blossom/blossom-1.png",
      "/products/Blossom/blossom-2.png",
      "/products/Blossom/blossom-3.png",
      "/products/Blossom/blossom-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "14",
    name: "Ziya Earrings",
    category: "earrings",
    categories: ["earrings", "anti-tarnish"],
    price: 1499,
    description:
      "Crafted with premium anti-tarnish finishing, these statement earrings are designed to retain their luxurious shine and elegance for a long time. A dreamy blend of pearls, soft blush crystals, and gold detailing — these earrings bring together elegance and charm in the most graceful way. The delicate pearl drops add movement and sophistication, while the unique floral-inspired silhouette makes them a standout accessory.",
    details: [
      "Design: Floral-inspired silhouette with pearl drops",
      "Accents: Soft blush crystals and gold detailing",
      "Finish: Premium anti-tarnish coating for lasting shine",
      "Occasion: Weddings, festive celebrations, brunches, elevated everyday styling",
      "Why You'll Love It: Dreamy pearl and crystal elegance with anti-tarnish durability — lightweight, feminine, and effortlessly luxe",
    ],
    images: [
      "/products/Ziya/ziya-1.png",
      "/products/Ziya/ziya-2.png",
      "/products/Ziya/ziya-3.png",
      "/products/Ziya/ziya-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "15",
    name: "Grace Earrings",
    category: "earrings",
    categories: ["earrings", "anti-tarnish"],
    price: 1499,
    description:
      "Crafted with premium anti-tarnish finishing, these statement floral earrings are designed to retain their luxurious shine and elegance for a long time. The sculpted gold floral detailing paired with sparkling crystal flowers and a delicate pearl drop creates a stunning statement look that instantly elevates any outfit. Lightweight yet glamorous — perfect for weddings, festive occasions, parties, and elevated evening looks.",
    details: [
      "Design: Sculpted gold floral detailing with crystal flowers",
      "Accents: Sparkling crystals and delicate pearl drop",
      "Finish: Premium anti-tarnish coating for long-lasting beauty",
      "Occasion: Weddings, festive occasions, parties, evening looks",
      "Why You'll Love It: Bold glamour meets feminine elegance — luxurious finish, graceful movement, and timeless floral charm",
    ],
    images: [
      "/products/Grace/grace-1.png",
      "/products/Grace/grace-2.png",
      "/products/Grace/grace-3.png",
      "/products/Grace/grace-4.png",
    ],
    badge: "New Launch",
    isNew: true,
    isBestseller: true,
  },
  {
    id: "16",
    name: "Iris Earrings",
    category: "earrings",
    categories: ["earrings", "anti-tarnish"],
    price: 1999,
    description:
      "Crafted with premium anti-tarnish polish, these statement earrings are designed to retain their shine and elegance for longer. Their bold evil-eye inspired silhouette paired with molten gold detailing creates a luxurious look that stands out effortlessly. The striking blue evil-eye centre, crystal detailing, and fluid dangling drops create a dramatic yet elegant vibe — wearable art for women who love artistic, unconventional jewellery.",
    details: [
      "Design: Evil-eye inspired silhouette with molten gold detailing",
      "Accents: Striking blue centre, crystal detailing, fluid dangling drops",
      "Finish: Premium anti-tarnish polish for lasting shine",
      "Occasion: Festive evenings, gowns, sarees, co-ord sets, date nights",
      "Why You'll Love It: Bold artistic design with high-fashion appeal — lightweight, dramatic, and a true conversation starter",
    ],
    images: [
      "/products/Iris/iris-1.png",
      "/products/Iris/iris-2.png",
      "/products/Iris/iris-3.png",
      "/products/Iris/iris-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "17",
    name: "Stella Necklace",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 2999,
    description:
      "Turn heads with this bold and luxurious statement necklace featuring dazzling crystal-studded layers paired with a unique sculpted pendant. Designed to make a striking fashion statement, this piece blends glamour and contemporary elegance — perfect for parties, special occasions, vacations, and evening events. The anti-tarnish finish ensures lasting shine and beauty with minimal maintenance.",
    details: [
      "Design: Crystal-studded multi-layered chain with sculpted pendant",
      "Finish: Premium anti-tarnish coating for lasting radiance",
      "Style: Bold contemporary glamour meets statement luxury",
      "Occasion: Parties, cocktail evenings, vacations, special events",
      "Why You'll Love It: Sparkling multi-layered design that catches light beautifully — durable, radiant, and impossible to ignore",
    ],
    images: [
      "/products/Stella/stella-1.png",
      "/products/Stella/stella-2.png",
      "/products/Stella/stella-3.png",
      "/products/Stella/stella-4.png",
    ],
    badge: "New Launch",
    isNew: true,
    isBestseller: true,
  },
  {
    id: "18",
    name: "Hope Necklace",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 2499,
    description:
      "Inspired by the beauty of nature, this elegant long necklace features an intricate branch-inspired pendant adorned with sparkling stones. Crafted with premium Korea-imported materials and finished with advanced anti-tarnish plating, it is designed to retain its luxurious shine and beauty for years to come. A true statement piece that blends artistry with elegance.",
    details: [
      "Design: Branch-inspired pendant with sparkling stone accents",
      "Material: Premium Korea-imported with anti-tarnish plating",
      "Style: Nature-inspired artistry meets modern elegance",
      "Occasion: Everyday styling, workwear, special occasions",
      "Why You'll Love It: Unique nature-inspired design with long silhouette — lightweight, eye-catching, and timeless season after season",
    ],
    images: [
      "/products/Hope/hope-1.png",
      "/products/Hope/hope-2.png",
      "/products/Hope/hope-3.png",
      "/products/Hope/hope-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "19",
    name: "Luna Necklace",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 1499,
    description:
      "Elevate your everyday style with this elegant Korea-imported anti-tarnish necklace, designed to add a touch of effortless sophistication to any look. Featuring a stunning geometric pendant with a sparkling crystal centerpiece, this piece combines modern luxury with timeless charm. Crafted from premium-quality materials and finished with advanced anti-tarnish technology, it retains its brilliant shine wear after wear.",
    details: [
      "Design: Geometric pendant with sparkling crystal centerpiece",
      "Material: Korea-imported with advanced anti-tarnish technology",
      "Style: Modern luxury meets timeless everyday elegance",
      "Occasion: Daily wear, office, dates, festive outings",
      "Why You'll Love It: Premium Korean craftsmanship with refined finish — lightweight, durable, and effortlessly radiant",
    ],
    images: [
      "/products/Luna/luna-1.png",
      "/products/Luna/luna-2.png",
      "/products/Luna/luna-3.png",
      "/products/Luna/luna-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "20",
    name: "Lily Necklace",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 1499,
    description:
      "A perfect blend of elegance and modern charm, this Korea-imported anti-tarnish necklace features a stunning floral-inspired pendant with delicate tassel detailing that adds graceful movement and shine. Crafted to retain its beautiful golden finish, it is designed for everyday sophistication without losing its brilliance over time.",
    details: [
      "Design: Floral-inspired pendant with delicate tassel detailing",
      "Material: Korea-imported with anti-tarnish golden finish",
      "Style: Elegant charm with graceful movement",
      "Occasion: Everyday wear, festive styling, casual to dressy",
      "Why You'll Love It: Effortless versatility with statement appeal — anti-tarnish finish means lasting shine with minimal maintenance",
    ],
    images: [
      "/products/Lily/lily-1.png",
      "/products/Lily/lily-2.png",
      "/products/Lily/lily-3.png",
      "/products/Lily/lily-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "21",
    name: "Daisy Bracelet",
    category: "bracelets",
    categories: ["bracelets", "anti-tarnish"],
    price: 1499,
    description:
      "A playful yet elegant piece inspired by the beauty of the ocean. Featuring charming dolphin accents on a bamboo-inspired bangle, this bracelet is crafted from durable Korea-imported stainless steel and finished with premium PVD coating for long-lasting shine. Anti-tarnish, water-resistant, and hypoallergenic — designed to stay beautiful through daily wear while adding a touch of coastal charm to your look.",
    details: [
      "Design: Bamboo-inspired bangle with dolphin charm accents",
      "Material: Korea-imported stainless steel with PVD coating",
      "Properties: Anti-tarnish, water-resistant, hypoallergenic",
      "Occasion: Everyday wear, beach outings, casual & dressy styling",
      "Why You'll Love It: Premium stainless steel durability with PVD coating — water-resistant, skin-friendly, and maintains its luxurious golden finish over time",
    ],
    images: [
      "/products/Daisy/daisy-1.png",
      "/products/Daisy/daisy-2.png",
      "/products/Daisy/daisy-3.png",
      "/products/Daisy/daisy-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "22",
    name: "Zahara Bracelet",
    category: "bracelets",
    categories: ["bracelets", "anti-tarnish"],
    price: 999,
    description:
      "Command attention with the timeless allure of the Zahara Bracelet. Inspired by the graceful elegance of a serpent, this Korea-imported anti-tarnish bracelet features a dazzling pavé-studded design accented with striking emerald-green stones. Crafted to blend luxury with durability, Zahara is designed to maintain its radiant shine, making it the perfect statement piece for every occasion.",
    details: [
      "Design: Serpent-inspired silhouette with pavé-studded detailing",
      "Accents: Striking emerald-green stones with intricate mesh texture",
      "Material: Korea-imported with anti-tarnish finish",
      "Fit: Flexible wrap design for comfortable wear",
      "Why You'll Love It: A symbol of confidence, power, and sophistication — long-lasting shine with an eye-catching silhouette that elevates any look",
    ],
    images: [
      "/products/Zahara/zahara-1.png",
      "/products/Zahara/zahara-2.png",
      "/products/Zahara/zahara-3.png",
      "/products/Zahara/zahara-4.png",
    ],
    badge: "New Launch",
    isNew: true,
    isBestseller: true,
  },
  {
    id: "23",
    name: "Dove Necklace Set",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 1499,
    description:
      "Delicate, timeless, and effortlessly elegant, the Dove Necklace Set features beautifully crafted dual rose motifs accented with luminous pearls and sparkling zircon stones. Made from premium stainless steel with durable PVD gold plating, it is water-resistant, hypoallergenic, and designed to retain its shine with minimal care. Lightweight and comfortable, Dove complements both everyday outfits and special-occasion looks.",
    details: [
      "Design: Dual rose motifs with pearl detailing and zircon accents",
      "Material: Premium stainless steel with PVD gold plating",
      "Properties: Anti-tarnish, water-resistant, hypoallergenic",
      "Includes: Necklace + matching earrings",
      "Why You'll Love It: An elegant coordinated set with long-lasting shine, lightweight comfort, and versatile styling",
    ],
    images: [
      "/products/Dove/dove-1.png",
      "/products/Dove/dove-2.png",
      "/products/Dove/dove-3.png",
      "/products/Dove/dove-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "24",
    name: "Halo Pendant",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 1199,
    description:
      "A timeless expression of elegance, the Halo Pendant features a graceful row of brilliant princess-cut stones set on a sleek gold-tone snake chain. Crafted from premium stainless steel with 18K gold PVD plating, this lightweight piece is water-resistant, anti-tarnish, hypoallergenic, and designed for comfortable everyday wear.",
    details: [
      "Design: Princess-cut cubic zirconia stones on a sleek snake chain",
      "Material: Premium stainless steel with 18K gold PVD plating",
      "Properties: Anti-tarnish, water-resistant, hypoallergenic, skin-friendly",
      "Occasion: Everyday wear, parties, weddings, and festive celebrations",
      "Why You'll Love It: A versatile, lightweight pendant with lasting shine and effortless sparkle",
    ],
    images: [
      "/products/Halo/Halo-1.png",
      "/products/Halo/Halo-2.png",
      "/products/Halo/Halo-3.png",
      "/products/Halo/Halo-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
  {
    id: "25",
    name: "Trinity Pendant",
    category: "anti-tarnish",
    categories: ["anti-tarnish", "necklaces"],
    price: 1199,
    description:
      "Gracefully designed with three beautifully aligned emerald-cut crystals, the Trinity Pendant brings together minimalism and sophistication. Its sleek vertical silhouette is crafted from stainless steel with 18K gold PVD coating for lasting shine. Water-resistant, anti-tarnish, hypoallergenic, and lightweight, it elevates everyday outfits and special-occasion looks with understated sparkle.",
    details: [
      "Design: Three emerald-cut crystals in a sleek vertical setting",
      "Material: Stainless steel with 18K gold PVD coating",
      "Properties: Anti-tarnish, water-resistant, hypoallergenic",
      "Fit: Adjustable chain for comfortable everyday wear",
      "Why You'll Love It: A refined, lightweight pendant with timeless sparkle and versatile styling",
    ],
    images: [
      "/products/Trinity/Trinity-1.png",
      "/products/Trinity/Trinity-2.png",
      "/products/Trinity/Trinity-3.png",
      "/products/Trinity/Trinity-4.png",
    ],
    badge: "New Launch",
    isNew: true,
  },
];

export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category || p.categories?.includes(category));
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getStock(productId: string): number {
  return stockLevels[productId] ?? 0;
}

export function isInStock(productId: string): boolean {
  return getStock(productId) > 0;
}

export function getFeaturedProducts(): Product[] {
  const featured = products.filter((p) => p.isBestseller || p.isNew);
  // Shuffle using Fisher-Yates
  for (let i = featured.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [featured[i], featured[j]] = [featured[j], featured[i]];
  }
  return featured.slice(0, 6);
}export function getNewArrivals(): Product[] {
  return products.filter((p) => p.isNew);
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.isBestseller);
}
