import { PrismaClient, PostCategory, PostStatus, SchemaType } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  postSprzetContent,
  postPoradnikContent,
  postMiejscaContent,
} from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.postProduct.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.adminUser.deleteMany();

  const passwordHash = await bcrypt.hash("Admin123!", 12);
  await prisma.adminUser.create({
    data: {
      email: "admin@panrybka.pl",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const p1 = await prisma.product.create({
    data: {
      name: "Shimano Stradic FL 4000",
      slug: "shimano-stradic-fl-4000",
      brand: "Shimano",
      category: "Kołowrotki",
      description:
        "<p>Flagowa półka średnia Shimano z płynną pracą i solidnym hamulcem. Sprawdza się w karpiarstwie jako uniwersalny model na średnie i długie zasięgi.</p>",
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      affiliateUrl: "https://www.amazon.pl/dp/B082XRNCDY",
      affiliateNetwork: "Amazon",
      price: 649.99,
      priceUpdatedAt: new Date(),
      rating: 9.2,
      pros: [
        "Niezwykle płynna praca",
        "Świetny stosunek jakości do ceny",
        "Trwała konstrukcja",
      ],
      cons: ["Nieco cięższy od konkurencji", "Brak zapasowej szpuli"],
      specs: {
        Przełożenie: "6.0:1",
        "Pojemność szpuli": "150m / 0.30mm",
        Waga: "265g",
        Łożyska: "6+1",
        "Max drag": "11kg",
      },
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: "Daiwa Freams LT 4000-C",
      slug: "daiwa-freams-lt-4000-c",
      brand: "Daiwa",
      category: "Kołowrotki",
      description:
        "<p>Lekka konstrukcja LT z precyzyjnym hamulcem. Dobry wybór przy częstym przerzucaniu zestawów i łowieniu na lżejszych zestawach.</p>",
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      affiliateUrl: "https://www.amazon.pl/dp/B07W6HK7NK",
      affiliateNetwork: "Amazon",
      price: 449.99,
      priceUpdatedAt: new Date(),
      rating: 8.5,
      pros: ["Bardzo lekka konstrukcja", "Precyzyjny hamulec", "Dobra cena"],
      cons: ["Mniejsza trwałość przy intensywnym użytkowaniu", "Plastikowa rączka"],
      specs: {
        Przełożenie: "5.2:1",
        "Pojemność szpuli": "170m / 0.30mm",
        Waga: "235g",
        Łożyska: "5+1",
        "Max drag": "10kg",
      },
    },
  });

  const p3 = await prisma.product.create({
    data: {
      name: "Penn Battle III 4000",
      slug: "penn-battle-iii-4000",
      brand: "Penn",
      category: "Kołowrotki",
      description:
        "<p>Robustowa konstrukcja Penn — świetna na morze i trudne warunki. Mniej płynna niż japońskie klasyki, ale bardzo wytrzymała.</p>",
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      affiliateUrl: "https://www.amazon.pl/dp/B088FNZGP3",
      affiliateNetwork: "Amazon",
      price: 329.99,
      priceUpdatedAt: new Date(),
      rating: 8.0,
      pros: ["Bardzo solidna budowa", "Świetna do morza", "Tani w utrzymaniu"],
      cons: ["Cięższa od japońskich modeli", "Mniej płynna praca"],
      specs: {
        Przełożenie: "5.6:1",
        "Pojemność szpuli": "200m / 0.30mm",
        Waga: "312g",
        Łożyska: "5+1",
        "Max drag": "13kg",
      },
    },
  });

  const postSprzet = await prisma.post.create({
    data: {
      title: "Najlepsze kołowrotki karpiowe 2026 — Ranking i porównanie TOP 3",
      slug: "najlepsze-kolowrotki-karpiowe-2026-ranking",
      excerpt:
        "Szukasz idealnego kołowrotka karpiowego? Przetestowaliśmy ponad 15 modeli i wybraliśmy trzech absolutnych liderów. Sprawdź nasze rankingi, szczegółowe recenzje i tabelę porównawczą.",
      content: postSprzetContent,
      category: PostCategory.SPRZET,
      status: PostStatus.PUBLISHED,
      featuredImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
      author: "Redakcja PanRybka",
      metaTitle: "Najlepsze kołowrotki karpiowe 2026 — Ranking TOP 3 [Testy]",
      metaDescription:
        "Ranking najlepszych kołowrotków karpiowych 2026. Shimano Stradic, Daiwa Freams i Penn Battle — szczegółowe recenzje, tabela porównawcza i rekomendacje ekspertów.",
      metaKeywords: "kołowrotki karpiowe, ranking kołowrotków, Shimano Stradic, Daiwa, Penn",
      canonicalUrl: "https://panrybka.pl/sprzet-wedkarski/najlepsze-kolowrotki-karpiowe-2026-ranking",
      schemaType: SchemaType.Review,
      focusKeyword: "kołowrotki karpiowe",
      publishedAt: new Date(),
    },
  });

  await prisma.postProduct.createMany({
    data: [
      { postId: postSprzet.id, productId: p1.id, position: 0, isWinner: true },
      { postId: postSprzet.id, productId: p2.id, position: 1, isWinner: false },
      { postId: postSprzet.id, productId: p3.id, position: 2, isWinner: false },
    ],
  });

  await prisma.post.create({
    data: {
      title: "Jak łowić karpia metodą na boilie — Kompletny poradnik dla początkujących",
      slug: "lowienie-karpia-na-boilie-poradnik",
      excerpt:
        "Metoda na boilie to jedna z najpopularniejszych technik karpiowych. W tym poradniku znajdziesz wszystko — od doboru przynęty, przez montaż zestawu, aż po wybór łowiska.",
      content: postPoradnikContent,
      category: PostCategory.PORADNIK,
      status: PostStatus.PUBLISHED,
      featuredImage: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1200",
      author: "Redakcja PanRybka",
      metaTitle: "Łowienie karpia na boilie — Poradnik krok po kroku [2026]",
      metaDescription:
        "Kompletny poradnik łowienia karpia na boilie. Dobór przynęty, montaż zestawu karpiowego, wybór łowiska — wszystko co musisz wiedzieć jako początkujący karpiarz.",
      metaKeywords: "boilie, karp, karpiarstwo, montaż karpiowy",
      canonicalUrl: "https://panrybka.pl/poradniki/lowienie-karpia-na-boilie-poradnik",
      schemaType: SchemaType.HowTo,
      focusKeyword: "boilie karp",
      publishedAt: new Date(),
    },
  });

  await prisma.post.create({
    data: {
      title: "Najlepsze łowiska karpiowe w Mazowieckiem — TOP 5 jezior i zalewów",
      slug: "najlepsze-lowiska-karpiowe-mazowieckie",
      excerpt:
        "Mazowsze kryje wiele świetnych łowisk karpiowych. Zebraliśmy 5 najlepszych miejsc w regionie — z opisem, dojazdem, regulaminem i wskazówkami gdzie szukać karpi.",
      content: postMiejscaContent,
      category: PostCategory.MIEJSCA,
      status: PostStatus.PUBLISHED,
      featuredImage: "https://images.unsplash.com/photo-1467244216928-48b7ac20b94a?w=1200",
      author: "Redakcja PanRybka",
      metaTitle: "Łowiska karpiowe Mazowsze — TOP 5 jezior i zalewów [2026]",
      metaDescription:
        "Przegląd najlepszych łowisk karpiowych na Mazowszu: Zalew Zegrzyński, Zdworskie, Włocławski i inne — dojazd, parking, regulaminy i praktyczne wskazówki.",
      metaKeywords: "łowiska karpiowe, Mazowsze, Zegrze, jeziora",
      canonicalUrl: "https://panrybka.pl/miejsca/najlepsze-lowiska-karpiowe-mazowieckie",
      schemaType: SchemaType.Article,
      focusKeyword: "łowiska karpiowe mazowsze",
      publishedAt: new Date(),
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
