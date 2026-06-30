import type { Locale } from "@/lib/site";
import { MULTI_DAY_TOURS } from "@/content/multiDayTours";
import { TOUR_IMAGES } from "@/content/tourImages";

export { MULTI_DAY_TOURS };

export type Localized<T> = Record<Locale, T>;
export type TourSlug =
  | "kekova-classic"
  | "kekova-west"
  | "kekova-east"
  | "7day-mediterranean"
  | "coast-of-light"
  | "kekova-sound"
  | "lycian-comfort-escape"
  | "carian-shore"
  | "trak-signature";

export interface ItineraryStep {
  icon: string;
  title: string;
  body: string;
}

/** A single day in a multi-day tour. */
export interface DayPlan {
  /** 1-based day number. */
  day: number;
  title: string;
  body: string;
  /** Free-text distance, e.g. "15 km" or "8.5 miles". */
  distance?: string;
}

export type TourStatus = "final" | "draft" | "special";

export interface MultiDayMeta {
  durationDays: number;
  nights: number;
  /** Omitted => shown as "On request". */
  pricePerPersonEur?: number;
  singleSupplementEur?: number;
  /** Localized free text, e.g. "min 6, max 12". */
  groupSize?: Localized<string>;
  /** Language-agnostic departure dates, e.g. "22-29 May 2026". */
  dates?: string[];
  /** Omitted (e.g. Carian Shore) => detail page shows "itinerary coming soon". */
  dayByDay?: Localized<DayPlan[]>;
  notIncluded?: Localized<string[]>;
  status: TourStatus;
  /** When set, "View details" links here instead of the generated detail page (TRAK). */
  externalDetailPath?: string;
}

export interface Tour {
  slug: TourSlug;
  level: "beginner" | "intermediate-advanced";
  /** Per-person day-tour price. Optional for multi-day tours (use multiDay.pricePerPersonEur). */
  priceEur?: number;
  priceFromKalkanEur?: number;
  distanceKm?: number;
  hikingKm?: number;
  departure?: string;
  arrival?: string;
  /** Language-agnostic place names along the route. */
  routeStops?: string[];
  heroImage: string;
  gallery: string[];
  title: Localized<string>;
  tagline: Localized<string>;
  /** Long intro paragraph (multi-day tours). */
  description?: Localized<string>;
  highlights: Localized<string[]>;
  included?: Localized<string[]>;
  itinerary?: Localized<ItineraryStep[]>;
  whyChoose?: Localized<string[]>;
  /** Present only for multi-day expeditions / the TRAK session. */
  multiDay?: MultiDayMeta;
}

// Shared "included" lines reused across tours (content is identical in source).
const INCLUDED_RESTAURANT: Localized<string[]> = {
  tr: ["Kayak federasyonu lisanslı rehber", "Kayak ve tüm ekipman", "Maske ve şnorkel", "Kuru çanta (dry bag)", "Kaş'tan gidiş-dönüş transfer", "Restoranda öğle yemeği", "Atıştırmalıklar"],
  en: ["Kayak federation licensed guide", "Kayaks and full equipment", "Mask and snorkel", "Dry bags", "From/to Kaş transfers", "Lunch at restaurant", "Snacks"],
  fr: ["Guide agréé par la fédération de kayak", "Kayaks et équipement complet", "Masque et tuba", "Sacs étanches (dry bags)", "Transferts aller-retour depuis Kaş", "Déjeuner au restaurant", "Collations"],
  ru: ["Гид с лицензией федерации каякинга", "Каяки и всё снаряжение", "Маска и трубка", "Гермомешки (dry bags)", "Трансфер из/до Каша", "Обед в ресторане", "Закуски"],
};
const INCLUDED_LUNCHBOX: Localized<string[]> = {
  tr: ["Kayak federasyonu lisanslı rehber", "Kayak ve tüm ekipman", "Maske ve şnorkel", "Kuru çanta (dry bag)", "Kaş'tan gidiş-dönüş transfer", "Öğle yemeği kutusu", "Atıştırmalıklar"],
  en: ["Kayak federation licensed guide", "Kayaks and full equipment", "Mask and snorkel", "Dry bags", "From/to Kaş transfers", "Lunch box", "Snacks"],
  fr: ["Guide agréé par la fédération de kayak", "Kayaks et équipement complet", "Masque et tuba", "Sacs étanches (dry bags)", "Transferts aller-retour depuis Kaş", "Panier-repas", "Collations"],
  ru: ["Гид с лицензией федерации каякинга", "Каяки и всё снаряжение", "Маска и трубка", "Гермомешки (dry bags)", "Трансфер из/до Каша", "Ланч-бокс", "Закуски"],
};

export const TOURS: Tour[] = [
  {
    slug: "kekova-classic",
    level: "beginner",
    priceEur: 45,
    priceFromKalkanEur: 70,
    distanceKm: 8,
    departure: "07:30",
    arrival: "14:30 / 15:00",
    routeStops: ["Üçağız (Theimussa)", "Kekova Island", "Tersane Bay", "Sunken City", "Simena"],
    heroImage: "/images/tours/kekova-classic/tomb1-kekovaklasik-bunukullan.jpg",
    gallery: TOUR_IMAGES["kekova-classic"] ?? [],
    title: { tr: "Kekova Klasik", en: "Kekova Classic", fr: "Kekova Classic", ru: "Кекова Классик" },
    tagline: {
      tr: "Kekova'nın eşsiz güzelliğini bu unutulmaz deniz kayağı macerasında keşfedin!",
      en: "Discover the breathtaking beauty of Kekova on this unforgettable sea kayaking adventure!",
      fr: "Découvrez la beauté à couper le souffle de Kekova lors de cette aventure inoubliable en kayak de mer !",
      ru: "Откройте для себя захватывающую красоту Кековы в этом незабываемом приключении на морском каяке!",
    },
    highlights: {
      tr: ["Batık Şehir kıyısı", "Tersane Koyu'nda yüzme molası", "Simena köyü ve kale manzarası", "Başlangıç dostu rota"],
      en: ["Sunken City coastline", "Tersane Bay swimming break", "Simena village and castle views", "Beginner-friendly route"],
      fr: ["Côte de la Cité engloutie", "Pause baignade à la baie de Tersane", "Village de Simena et vue sur le château", "Itinéraire pour débutants"],
      ru: ["Побережье Затонувшего города", "Купание в бухте Терсане", "Деревня Симена и вид на крепость", "Маршрут для начинающих"],
    },
    included: {
      tr: ["Kayak federasyonu lisanslı rehber", "Kayak ve tüm ekipman", "Maske ve şnorkel", "Kuru çanta (dry bag)", "Kaş'tan gidiş-dönüş transfer", "Restoranda öğle yemeği (optional)", "Atıştırmalıklar"],
      en: ["Kayak federation licensed guide", "Kayaks and full equipment", "Mask and snorkel", "Dry bags", "From/to Kaş transfers", "Lunch at restaurant (optional)", "Snacks"],
      fr: ["Guide agréé par la fédération de kayak", "Kayaks et équipement complet", "Masque et tuba", "Sacs étanches (dry bags)", "Transferts aller-retour depuis Kaş", "Déjeuner au restaurant (optional)", "Collations"],
      ru: ["Гид с лицензией федерации каякинга", "Каяки и всё снаряжение", "Маска и трубка", "Гермомешки (dry bags)", "Трансфер из/до Каша", "Обед в ресторане (optional)", "Закуски"],
    },
    whyChoose: {
      tr: [
        "Antik tarihi keşfet — batık Likya şehri üzerinde kürek çek, kaleyi ziyaret et.",
        "Her seviyeye uygun — deneyim gerekmez, başlangıç dostu.",
        "Küçük grup deneyimi — İngilizce konuşan lisanslı rehberler.",
        "Nefes kesen manzara — berrak sular, saklı koylar.",
        "Macera ve kültürün mükemmel uyumu.",
        "Manzaralı öğle yemeği — Simena'da deniz kenarında lezzetli bir mola.",
      ],
      en: [
        "Explore ancient history — paddle over a sunken Lycian city and visit a castle.",
        "Perfect for all levels — no experience needed, beginner-friendly.",
        "Small-group experience with licensed English-speaking guides.",
        "Breathtaking scenery — crystal-clear waters and hidden coves.",
        "A perfect blend of adventure and culture.",
        "Lunch with a view — a delicious waterfront break in Simena.",
      ],
      fr: [
        "Explorez l'histoire ancienne — pagayez au-dessus d'une cité lycienne engloutie et visitez un château.",
        "Parfait pour tous les niveaux — aucune expérience requise.",
        "Expérience en petit groupe avec des guides diplômés anglophones.",
        "Paysages à couper le souffle — eaux cristallines et criques cachées.",
        "Un mélange parfait d'aventure et de culture.",
        "Déjeuner avec vue — une délicieuse pause en bord de mer à Simena.",
      ],
      ru: [
        "Исследуйте древнюю историю — гребите над затонувшим ликийским городом и посетите крепость.",
        "Подходит для всех уровней — опыт не требуется.",
        "Опыт в малой группе с лицензированными англоговорящими гидами.",
        "Захватывающие пейзажи — кристально чистая вода и скрытые бухты.",
        "Идеальное сочетание приключения и культуры.",
        "Обед с видом — вкусная остановка у воды в Симене.",
      ],
    },
    itinerary: {
      en: [
        { icon: "🚶", title: "Meeting Point: Kaş King's Tomb — 07:30", body: "Meet your expert guide and fellow adventurers. Pick-up can be arranged on the Kaş Peninsula." },
        { icon: "🚐", title: "Journey to Üçağız (40 min)", body: "A scenic drive through Mediterranean landscapes, with a stop for water or last-minute supplies, arriving at the charming fishing village of Üçağız." },
        { icon: "🛶", title: "Sea Kayaking Begins", body: "Get equipped with kayaks, life jackets, dry bags and paddles, plus a detailed paddling and safety briefing. Snorkeling gear provided." },
        { icon: "🏝", title: "Paddle to Tersane (Shipyard) Bay (30 min)", body: "Glide past small islands with Roman and Lycian ruins to Tersane Bay, home to an ancient shipyard. Short break with snacks." },
        { icon: "🏛", title: "Explore the Sunken City of Kekova", body: "Paddle single file along the famous Sunken City, observing half-submerged walls, staircases and the ancient harbor beneath crystal-clear water. Swimming is not allowed in this protected area." },
        { icon: "🏰", title: "Visit Simena — The Castle Village", body: "Cross the bay to Simena (Kaleköy), reachable only by boat or kayak, with its castle perched above offering panoramic views." },
        { icon: "🍽", title: "Lunch with a Stunning View", body: "A delicious meal at a waterfront restaurant — grilled fish, köfte, grilled chicken or a vegetarian/vegan option, with homemade fries and fresh salad." },
        { icon: "⏳", title: "Free Time in Simena (1 hour)", body: "Explore the castle ruins, wander flower-lined stone streets, try the famous homemade ice cream, or swim in the clear water." },
        { icon: "⛵", title: "Return Paddle to Üçağız", body: "Glide past ancient Lycian tombs hidden along the rocks on the way back to the starting point." },
        { icon: "🚐", title: "Return to Kaş", body: "A 40-minute scenic drive back to Kaş after a short wrap-up in Üçağız." },
      ],
      tr: [
        { icon: "🚶", title: "Buluşma: Kaş Kral Mezarı — 07:30", body: "Uzman rehberiniz ve diğer maceraperestlerle buluşun. Kaş Yarımadası'nda transfer ayarlanabilir." },
        { icon: "🚐", title: "Üçağız'a Yolculuk (40 dk)", body: "Akdeniz manzaraları arasında keyifli bir sürüş; su ve son dakika ihtiyaçları için bir mola, ardından şirin balıkçı köyü Üçağız'a varış." },
        { icon: "🛶", title: "Deniz Kayağı Başlıyor", body: "Kayak, can yeleği, su geçirmez çanta ve kürek ile donanın; detaylı kürek ve güvenlik brifingi. Şnorkel ekipmanı sağlanır." },
        { icon: "🏝", title: "Tersane Koyu'na Kürek (30 dk)", body: "Roma ve Likya kalıntılarıyla dolu küçük adaların yanından geçerek antik tersaneye ev sahipliği yapan Tersane Koyu'na ulaşın. Atıştırmalıklı kısa mola." },
        { icon: "🏛", title: "Kekova Batık Şehri", body: "Ünlü Batık Şehir boyunca tek sıra kürek çekin; berrak suyun altındaki yarı batık duvarları, merdivenleri ve antik limanı izleyin. Bu korunan alanda yüzmek yasaktır." },
        { icon: "🏰", title: "Simena — Kale Köyü", body: "Yalnızca tekne veya kayakla ulaşılan Simena'ya (Kaleköy) geçin; tepedeki kale panoramik manzara sunar." },
        { icon: "🍽", title: "Manzaralı Öğle Yemeği", body: "Deniz kenarı restoranda lezzetli bir yemek — ızgara balık, köfte, ızgara tavuk veya vejetaryen/vegan seçenek; ev yapımı patates ve taze salata ile." },
        { icon: "⏳", title: "Simena'da Serbest Zaman (1 saat)", body: "Kale kalıntılarını gezin, çiçekli taş sokaklarda dolaşın, meşhur ev yapımı dondurmayı tadın ya da berrak suda yüzün." },
        { icon: "⛵", title: "Üçağız'a Dönüş Küreği", body: "Başlangıç noktasına dönerken kayalıklar arasına gizlenmiş antik Likya mezarlarının yanından geçin." },
        { icon: "🚐", title: "Kaş'a Dönüş", body: "Üçağız'da kısa bir kapanışın ardından Kaş'a 40 dakikalık manzaralı sürüş." },
      ],
      fr: [
        { icon: "🚶", title: "Point de rendez-vous : tombeau du roi de Kaş — 07:30", body: "Rencontrez votre guide expert et les autres aventuriers. Une prise en charge peut être organisée sur la péninsule de Kaş." },
        { icon: "🚐", title: "Trajet vers Üçağız (40 min)", body: "Une route pittoresque à travers les paysages méditerranéens, avec un arrêt pour de l'eau ou des provisions, jusqu'au charmant village de pêcheurs d'Üçağız." },
        { icon: "🛶", title: "Début du kayak de mer", body: "Équipez-vous de kayaks, gilets, sacs étanches et pagaies, avec un briefing détaillé. Matériel de snorkeling fourni." },
        { icon: "🏝", title: "Pagaie vers la baie de Tersane (30 min)", body: "Longez de petites îles aux ruines romaines et lyciennes jusqu'à la baie de Tersane, ancien chantier naval. Courte pause avec collations." },
        { icon: "🏛", title: "La Cité engloutie de Kekova", body: "Pagayez en file le long de la célèbre Cité engloutie, observant murs, escaliers et port antique sous l'eau cristalline. La baignade est interdite dans cette zone protégée." },
        { icon: "🏰", title: "Simena — le village au château", body: "Traversez la baie vers Simena (Kaleköy), accessible uniquement par bateau ou kayak, avec son château offrant une vue panoramique." },
        { icon: "🍽", title: "Déjeuner avec vue", body: "Un délicieux repas en bord de mer — poisson grillé, köfte, poulet grillé ou option végétarienne/végétalienne, avec frites maison et salade fraîche." },
        { icon: "⏳", title: "Temps libre à Simena (1 h)", body: "Explorez les ruines du château, flânez dans les ruelles fleuries, goûtez la fameuse glace maison ou baignez-vous." },
        { icon: "⛵", title: "Retour en pagaie vers Üçağız", body: "Passez devant d'anciens tombeaux lyciens cachés dans les rochers sur le chemin du retour." },
        { icon: "🚐", title: "Retour à Kaş", body: "Une route panoramique de 40 minutes vers Kaş après une brève conclusion à Üçağız." },
      ],
      ru: [
        { icon: "🚶", title: "Место встречи: Царская гробница Каша — 07:30", body: "Встретьте опытного гида и других участников. На полуострове Каш возможен трансфер." },
        { icon: "🚐", title: "Поездка в Üçağız (40 мин)", body: "Живописная поездка по средиземноморским пейзажам с остановкой за водой и припасами, прибытие в очаровательную рыбацкую деревню Üçağız." },
        { icon: "🛶", title: "Начало морского каякинга", body: "Получите каяки, спасжилеты, гермомешки и вёсла, а также подробный инструктаж по гребле и безопасности. Снаряжение для снорклинга предоставляется." },
        { icon: "🏝", title: "Гребля к бухте Терсане (30 мин)", body: "Пройдите мимо небольших островов с римскими и ликийскими руинами к бухте Терсане с древней верфью. Короткий перерыв с закусками." },
        { icon: "🏛", title: "Затонувший город Кекова", body: "Гребите цепочкой вдоль знаменитого Затонувшего города, наблюдая под кристально чистой водой полузатопленные стены, лестницы и древнюю гавань. Купание в этой охраняемой зоне запрещено." },
        { icon: "🏰", title: "Симена — деревня с крепостью", body: "Переправьтесь через бухту в Симену (Калекёй), доступную только на лодке или каяке, с крепостью на вершине и панорамными видами." },
        { icon: "🍽", title: "Обед с потрясающим видом", body: "Вкусный обед в ресторане у воды — рыба на гриле, кёфте, курица на гриле или вегетарианский/веганский вариант, с домашним картофелем фри и свежим салатом." },
        { icon: "⏳", title: "Свободное время в Симене (1 час)", body: "Осмотрите руины крепости, прогуляйтесь по цветущим каменным улочкам, попробуйте знаменитое домашнее мороженое или искупайтесь." },
        { icon: "⛵", title: "Обратная гребля в Üçağız", body: "На обратном пути пройдите мимо древних ликийских гробниц, спрятанных среди скал." },
        { icon: "🚐", title: "Возвращение в Каш", body: "Живописная 40-минутная дорога в Каш после короткого завершения в Üçağız." },
      ],
    },
  },
  {
    slug: "kekova-west",
    level: "intermediate-advanced",
    priceEur: 80,
    distanceKm: 15,
    hikingKm: 1.5,
    departure: "07:30",
    arrival: "16:30 / 17:00",
    routeStops: ["Üçağız (Theimussa)", "Kekova Sound & Islands", "Polemos", "Sıcak", "Aperlai"],
    heroImage: "/images/tours/kekova-west/aperlai5-kekovawest-bunukullan.jpg",
    gallery: TOUR_IMAGES["kekova-west"] ?? [],
    title: { tr: "Kekova West", en: "Kekova West", fr: "Kekova West", ru: "Кекова Запад" },
    tagline: {
      tr: "Kekova & Aperlai tam gün deniz kayağı macerası!",
      en: "Kekova & Aperlai Full-Day Sea Kayaking Adventure!",
      fr: "Aventure en kayak de mer d'une journée complète à Kekova et Aperlai !",
      ru: "Морское каякинг-приключение на целый день в Кекове и Аперлаи!",
    },
    highlights: {
      tr: ["Kekova Boğazı ve adaları", "Aperlai antik kenti", "Deniz kayağı ve kısa yürüyüş", "Tam gün rota"],
      en: ["Kekova Sound and islands", "Aperlai ancient site", "Sea kayaking and short walk", "Full-day route"],
      fr: ["Détroit de Kekova et ses îles", "Site antique d'Aperlai", "Kayak de mer et courte marche", "Itinéraire d'une journée"],
      ru: ["Пролив Кекова и острова", "Древний город Аперлаи", "Каякинг и короткая прогулка", "Маршрут на целый день"],
    },
    included: INCLUDED_RESTAURANT,
    whyChoose: {
      tr: [
        "İki efsanevi batık şehir — Kekova ve Aperlai.",
        "Profesyonel rehberlerle küçük grup deneyimi.",
        "Tersane Koyu ve Aperlai kalıntıları üzerinde şnorkel.",
        "Ünlü Likya Yolu'nun kısa bir bölümünde yürüyüş.",
        "Hava uygunsa rüzgar destekli kayak yelkeni deneyimi.",
        "Balıkçı evinde otantik yerel öğle yemeği.",
      ],
      en: [
        "Paddle through two legendary sunken cities — Kekova & Aperlai.",
        "Small-group experience with professional guides.",
        "Snorkeling above ruins in Tersane Bay and the sunken ruins of Aperlai.",
        "Hike a short section of the famous Lycian Way.",
        "Kayak sailing option for a thrilling, wind-powered experience.",
        "Authentic local lunch at a fisherman's house.",
      ],
      fr: [
        "Pagayez à travers deux cités englouties légendaires — Kekova & Aperlai.",
        "Expérience en petit groupe avec des guides professionnels.",
        "Snorkeling au-dessus des ruines de la baie de Tersane et d'Aperlai.",
        "Randonnée sur une courte section de la célèbre Voie lycienne.",
        "Option voile en kayak pour une expérience grisante.",
        "Déjeuner local authentique dans une maison de pêcheur.",
      ],
      ru: [
        "Гребите через два легендарных затонувших города — Кекова и Аперлаи.",
        "Опыт в малой группе с профессиональными гидами.",
        "Снорклинг над руинами в бухте Терсане и затонувшими руинами Аперлаи.",
        "Поход по короткому участку знаменитой Ликийской тропы.",
        "Опция с парусом на каяке для захватывающего опыта под силой ветра.",
        "Аутентичный местный обед в доме рыбака.",
      ],
    },
    itinerary: {
      en: [
        { icon: "🚶", title: "Meeting Point: Kaş King's Tomb — 07:30", body: "Meet your guide and group. Pick-up available on the Kaş Peninsula; Kalkan transfer available for an additional €10." },
        { icon: "🚐", title: "Journey to Üçağız (40 min)", body: "A scenic drive with a supply stop, arriving at the gateway village of Üçağız." },
        { icon: "🛶", title: "Sea Kayaking Begins", body: "Full equipment and a detailed safety briefing before setting off." },
        { icon: "🏝", title: "Simena & the Sunken City of Kekova", body: "Paddle toward Simena, stop by the iconic half-submerged Lycian tomb, then glide over Kekova's sunken city before a swim break at Tersane Bay and on toward Aperlai." },
        { icon: "🍽", title: "Lunch at a Fisherman's House", body: "A home-cooked meal of grilled fish, the best fries in the region, and fresh Mediterranean salad." },
        { icon: "🥾", title: "Short Hike Along the Lycian Way", body: "Walk among ancient ruins for panoramic views of the coastline from Aperlai's city walls." },
        { icon: "🏛", title: "Discover Aperlai", body: "Snorkel above sunken harbors and structures, and learn about the ancient royal purple dye industry." },
        { icon: "⛵", title: "Kayak Sailing (weather dependent)", body: "Hoist small sails and let the wind carry you back — a unique, thrilling experience." },
        { icon: "🚐", title: "Return to Kaş", body: "Free time in Üçağız while equipment is cleaned, then a 40-minute drive back. Arrival 17:00–17:30." },
      ],
      tr: [
        { icon: "🚶", title: "Buluşma: Kaş Kral Mezarı — 07:30", body: "Rehberiniz ve grupla buluşun. Kaş Yarımadası'nda transfer mevcut; Kalkan transferi +€10." },
        { icon: "🚐", title: "Üçağız'a Yolculuk (40 dk)", body: "İhtiyaç molasıyla manzaralı bir sürüş; Kekova'nın kapısı Üçağız'a varış." },
        { icon: "🛶", title: "Deniz Kayağı Başlıyor", body: "Tam ekipman ve yola çıkmadan önce detaylı güvenlik brifingi." },
        { icon: "🏝", title: "Simena ve Kekova Batık Şehri", body: "Simena'ya doğru kürek çekin, ikonik yarı batık Likya mezarının yanında durun, Kekova batık şehrinin üzerinden geçin; Tersane Koyu'nda yüzme molası ve Aperlai'ye doğru devam." },
        { icon: "🍽", title: "Balıkçı Evinde Öğle Yemeği", body: "Izgara balık, bölgenin en iyi patatesi ve taze Akdeniz salatasından oluşan ev yemeği." },
        { icon: "🥾", title: "Likya Yolu'nda Kısa Yürüyüş", body: "Antik kalıntılar arasında yürüyerek Aperlai surlarından kıyının panoramik manzarasının tadını çıkarın." },
        { icon: "🏛", title: "Aperlai'yi Keşfet", body: "Batık limanlar ve yapılar üzerinde şnorkel yapın; antik mor boya endüstrisinin hikayesini öğrenin." },
        { icon: "⛵", title: "Kayak Yelkeni (havaya bağlı)", body: "Küçük yelkenleri açın ve rüzgarın sizi geri taşımasına izin verin — eşsiz, heyecanlı bir deneyim." },
        { icon: "🚐", title: "Kaş'a Dönüş", body: "Ekipman temizlenirken Üçağız'da serbest zaman, ardından 40 dakikalık dönüş. Varış 17:00–17:30." },
      ],
      fr: [
        { icon: "🚶", title: "Rendez-vous : tombeau du roi de Kaş — 07:30", body: "Rencontrez votre guide et le groupe. Prise en charge sur la péninsule de Kaş ; transfert de Kalkan pour 10 € supplémentaires." },
        { icon: "🚐", title: "Trajet vers Üçağız (40 min)", body: "Une route pittoresque avec un arrêt provisions, jusqu'au village d'Üçağız, porte de Kekova." },
        { icon: "🛶", title: "Début du kayak de mer", body: "Équipement complet et briefing de sécurité détaillé avant le départ." },
        { icon: "🏝", title: "Simena & la Cité engloutie de Kekova", body: "Pagayez vers Simena, arrêtez-vous près du célèbre tombeau lycien à demi immergé, puis glissez au-dessus de la cité engloutie avant une baignade à la baie de Tersane et vers Aperlai." },
        { icon: "🍽", title: "Déjeuner chez un pêcheur", body: "Un repas maison de poisson grillé, les meilleures frites de la région et une salade méditerranéenne fraîche." },
        { icon: "🥾", title: "Courte randonnée sur la Voie lycienne", body: "Marchez parmi les ruines antiques pour des vues panoramiques depuis les remparts d'Aperlai." },
        { icon: "🏛", title: "Découvrir Aperlai", body: "Faites du snorkeling au-dessus des ports engloutis et découvrez l'ancienne industrie de la pourpre royale." },
        { icon: "⛵", title: "Voile en kayak (selon météo)", body: "Hissez de petites voiles et laissez le vent vous ramener — une expérience unique et grisante." },
        { icon: "🚐", title: "Retour à Kaş", body: "Temps libre à Üçağız pendant le nettoyage de l'équipement, puis 40 min de route. Arrivée 17h00–17h30." },
      ],
      ru: [
        { icon: "🚶", title: "Место встречи: Царская гробница Каша — 07:30", body: "Встретьте гида и группу. Трансфер на полуострове Каш; трансфер из Калкана за доплату 10 €." },
        { icon: "🚐", title: "Поездка в Üçağız (40 мин)", body: "Живописная поездка с остановкой за припасами, прибытие в деревню Üçağız — ворота Кековы." },
        { icon: "🛶", title: "Начало морского каякинга", body: "Полное снаряжение и подробный инструктаж по безопасности перед стартом." },
        { icon: "🏝", title: "Симена и Затонувший город Кекова", body: "Гребите к Симене, остановитесь у культовой полузатопленной ликийской гробницы, затем пройдите над затонувшим городом перед купанием в бухте Терсане и далее к Аперлаи." },
        { icon: "🍽", title: "Обед в доме рыбака", body: "Домашняя еда: рыба на гриле, лучший картофель фри в регионе и свежий средиземноморский салат." },
        { icon: "🥾", title: "Короткий поход по Ликийской тропе", body: "Прогуляйтесь среди древних руин ради панорамных видов побережья со стен Аперлаи." },
        { icon: "🏛", title: "Откройте Аперлаи", body: "Снорклинг над затонувшими гаванями и постройками; узнайте о древнем производстве царского пурпура." },
        { icon: "⛵", title: "Парус на каяке (по погоде)", body: "Поднимите небольшие паруса и позвольте ветру унести вас обратно — уникальный, захватывающий опыт." },
        { icon: "🚐", title: "Возвращение в Каш", body: "Свободное время в Üçağız, пока чистят снаряжение, затем 40-минутная дорога. Прибытие 17:00–17:30." },
      ],
    },
  },
  {
    slug: "kekova-east",
    level: "intermediate-advanced",
    priceEur: 80,
    distanceKm: 17,
    departure: "07:30",
    arrival: "17:00 / 17:30",
    routeStops: ["Üçağız", "Simena", "Hamidiye Bay", "Aşırlı Island", "Çayağzı (Andriake)"],
    heroImage: "/images/tours/kekova-east/east2kilise-kekovaeast-bunukullan.jpg",
    gallery: TOUR_IMAGES["kekova-east"] ?? [],
    title: { tr: "Kekova East", en: "Kekova East", fr: "Kekova East", ru: "Кекова Восток" },
    tagline: {
      tr: "Kekova Çayağzı ve Demre tam gün deniz kayağı & şnorkel macerası!",
      en: "Kekova Çayağzı and Demre Full-Day Sea Kayaking & Snorkeling Adventure!",
      fr: "Aventure d'une journée complète en kayak de mer et snorkeling à Kekova Çayağzı et Demre !",
      ru: "Морское каякинг и снорклинг-приключение на целый день в Кекова Чаягзы и Демре!",
    },
    highlights: {
      tr: ["Theimussa ve Simena", "Hamidiye Koyu", "Aşırlı Adası korsan mağarası", "Andriake deresi", "Deniz kaplumbağası gözlemi", "Andriake limanında bitiş"],
      en: ["Theimussa and Simena", "Hamidiye Bay", "Aşırlı Island pirate cave", "Andriake stream", "Sea turtle spotting", "Finish at Andriake harbor"],
      fr: ["Theimussa et Simena", "Baie de Hamidiye", "Grotte des pirates de l'île d'Aşırlı", "Ruisseau d'Andriake", "Observation des tortues de mer", "Fin au port d'Andriake"],
      ru: ["Теймусса и Симена", "Бухта Хамидие", "Пиратская пещера острова Аширлы", "Ручей Андриаке", "Наблюдение за морскими черепахами", "Финиш в гавани Андриаке"],
    },
    included: INCLUDED_LUNCHBOX,
    whyChoose: {
      tr: [
        "Batık Likya şehri üzerinde kürek çek.",
        "Saklı koylarda yüzme ve şnorkel.",
        "Bir zamanlar Akdeniz fokuna ev sahipliği yapan deniz mağarasının yanından geçiş.",
        "Andriake deresinde deniz kaplumbağası gözlemi.",
        "Daha deneyimli kürekçilerle suda daha fazla kürek zamanı.",
        "Uzman rehberlerle küçük grup deneyimi.",
      ],
      en: [
        "Paddle over a sunken Lycian city.",
        "Swim and snorkel in hidden bays.",
        "Paddle past a sea cave once home to Mediterranean monk seals.",
        "Spot sea turtles along the Andriake stream.",
        "More paddling time on the water with experienced kayakers.",
        "Small-group experience with expert guides.",
      ],
      fr: [
        "Pagayez au-dessus d'une cité lycienne engloutie.",
        "Nagez et faites du snorkeling dans des criques cachées.",
        "Longez une grotte marine, ancien refuge du phoque moine de Méditerranée.",
        "Observez les tortues de mer le long du ruisseau d'Andriake.",
        "Plus de temps de pagaie avec des kayakistes expérimentés.",
        "Expérience en petit groupe avec des guides experts.",
      ],
      ru: [
        "Гребите над затонувшим ликийским городом.",
        "Плавайте и занимайтесь снорклингом в скрытых бухтах.",
        "Пройдите мимо морской пещеры, бывшего пристанища средиземноморского тюленя-монаха.",
        "Наблюдайте за морскими черепахами вдоль ручья Андриаке.",
        "Больше времени на гребле с опытными каякерами.",
        "Опыт в малой группе с опытными гидами.",
      ],
    },
    itinerary: {
      en: [
        { icon: "🚶", title: "Meeting Point: Kaş King's Tomb — 07:30", body: "Meet your guide. Pick-up can be arranged on the Kaş Peninsula; Kalkan transfer available for an additional €10." },
        { icon: "🚐", title: "Journey to Üçağız (40 min)", body: "A scenic drive with a supply stop, arriving at the fishing village of Üçağız." },
        { icon: "🛶", title: "Launch at Theimussa (Üçağız)", body: "Get equipped and briefed, then launch with views over Üçağız's necropolis." },
        { icon: "🏝", title: "Paddle Over the Sunken City", body: "Glide directly over the Sunken City of Kekova, observing submerged staircases, walls and harbor remains beneath crystal-clear water." },
        { icon: "🐠", title: "Swim & Snorkel in Hidden Bays", body: "Refreshing swim breaks in secluded bays with snorkeling gear; watch for wild goats on the surrounding cliffs." },
        { icon: "🥪", title: "Picnic Lunch with a View", body: "A shoreline picnic of fresh sandwiches, fruit and local snacks in tranquil Mediterranean scenery." },
        { icon: "🦭", title: "Paddle by a Sea Cave", body: "Pass a mysterious cave near Aşırlı Island, once home to Mediterranean monk seals — and perhaps spot loggerhead turtles." },
        { icon: "🐢", title: "Andriake Stream — Turtle Spotting", body: "Follow the Andriake stream, a protected sea-turtle nesting area, a true highlight of the tour." },
        { icon: "🚐", title: "Finish at Andriake & Return to Kaş", body: "Conclude in Demre (Myra) at Andriake harbor, then a 40-minute drive back to Kaş. Arrival around 17:00–17:30." },
      ],
      tr: [
        { icon: "🚶", title: "Buluşma: Kaş Kral Mezarı — 07:30", body: "Rehberinizle buluşun. Kaş Yarımadası'nda transfer ayarlanabilir; Kalkan transferi +€10." },
        { icon: "🚐", title: "Üçağız'a Yolculuk (40 dk)", body: "İhtiyaç molasıyla manzaralı bir sürüş; balıkçı köyü Üçağız'a varış." },
        { icon: "🛶", title: "Theimussa'da (Üçağız) Suya İniş", body: "Donanımınızı alıp brifing aldıktan sonra Üçağız nekropolü manzarasıyla suya inin." },
        { icon: "🏝", title: "Batık Şehir Üzerinde Kürek", body: "Doğrudan Kekova Batık Şehri'nin üzerinden geçin; berrak suyun altındaki merdivenleri, duvarları ve liman kalıntılarını izleyin." },
        { icon: "🐠", title: "Saklı Koylarda Yüzme ve Şnorkel", body: "Issız koylarda şnorkel ekipmanıyla ferahlatıcı yüzme molaları; kayalıklardaki yaban keçilerini gözleyin." },
        { icon: "🥪", title: "Manzaralı Piknik Öğle Yemeği", body: "Sahilde taze sandviç, meyve ve yerel atıştırmalıklardan oluşan sakin bir piknik." },
        { icon: "🦭", title: "Deniz Mağarasının Yanından Kürek", body: "Aşırlı Adası yakınında, bir zamanlar Akdeniz foklarına ev sahipliği yapan gizemli mağaranın yanından geçin — şanslıysanız caretta caretta görebilirsiniz." },
        { icon: "🐢", title: "Andriake Deresi — Kaplumbağa Gözlemi", body: "Korunan bir deniz kaplumbağası yuvalama alanı olan Andriake deresini takip edin; turun en güzel anlarından biri." },
        { icon: "🚐", title: "Andriake'de Bitiş & Kaş'a Dönüş", body: "Demre (Myra) Andriake limanında tamamlayın, ardından Kaş'a 40 dakikalık sürüş. Varış 17:00–17:30 civarı." },
      ],
      fr: [
        { icon: "🚶", title: "Rendez-vous : tombeau du roi de Kaş — 07:30", body: "Rencontrez votre guide. Prise en charge possible sur la péninsule de Kaş ; transfert de Kalkan pour 10 € supplémentaires." },
        { icon: "🚐", title: "Trajet vers Üçağız (40 min)", body: "Une route pittoresque avec un arrêt provisions, jusqu'au village de pêcheurs d'Üçağız." },
        { icon: "🛶", title: "Mise à l'eau à Theimussa (Üçağız)", body: "Équipez-vous et recevez le briefing, puis mettez-vous à l'eau avec vue sur la nécropole d'Üçağız." },
        { icon: "🏝", title: "Pagaie au-dessus de la Cité engloutie", body: "Glissez directement au-dessus de la Cité engloutie de Kekova, observant escaliers, murs et vestiges du port sous l'eau cristalline." },
        { icon: "🐠", title: "Baignade & snorkeling dans des criques cachées", body: "Pauses baignade rafraîchissantes dans des criques isolées avec matériel de snorkeling ; guettez les chèvres sauvages sur les falaises." },
        { icon: "🥪", title: "Pique-nique avec vue", body: "Un pique-nique sur le rivage avec sandwichs frais, fruits et collations locales dans un décor méditerranéen paisible." },
        { icon: "🦭", title: "Pagaie près d'une grotte marine", body: "Longez une grotte mystérieuse près de l'île d'Aşırlı, ancien refuge du phoque moine — et peut-être apercevez des tortues caouannes." },
        { icon: "🐢", title: "Ruisseau d'Andriake — observation des tortues", body: "Suivez le ruisseau d'Andriake, zone protégée de nidification des tortues de mer, un moment fort de l'excursion." },
        { icon: "🚐", title: "Fin à Andriake & retour à Kaş", body: "Terminez à Demre (Myra) au port d'Andriake, puis 40 min de route vers Kaş. Arrivée vers 17h00–17h30." },
      ],
      ru: [
        { icon: "🚶", title: "Место встречи: Царская гробница Каша — 07:30", body: "Встретьте гида. На полуострове Каш возможен трансфер; трансфер из Калкана за доплату 10 €." },
        { icon: "🚐", title: "Поездка в Üçağız (40 мин)", body: "Живописная поездка с остановкой за припасами, прибытие в рыбацкую деревню Üçağız." },
        { icon: "🛶", title: "Старт в Теймуссе (Üçağız)", body: "Получите снаряжение и инструктаж, затем спуск на воду с видом на некрополь Üçağız." },
        { icon: "🏝", title: "Гребля над Затонувшим городом", body: "Пройдите прямо над Затонувшим городом Кекова, наблюдая под кристально чистой водой затопленные лестницы, стены и остатки гавани." },
        { icon: "🐠", title: "Купание и снорклинг в скрытых бухтах", body: "Освежающие перерывы на купание в уединённых бухтах со снаряжением для снорклинга; высматривайте диких коз на скалах." },
        { icon: "🥪", title: "Пикник-обед с видом", body: "Пикник на берегу со свежими сэндвичами, фруктами и местными закусками в спокойном средиземноморском пейзаже." },
        { icon: "🦭", title: "Гребля у морской пещеры", body: "Пройдите мимо таинственной пещеры у острова Аширлы, бывшего пристанища тюленей-монахов — возможно, увидите черепах каретта." },
        { icon: "🐢", title: "Ручей Андриаке — наблюдение за черепахами", body: "Следуйте вдоль ручья Андриаке, охраняемой зоны гнездования морских черепах — настоящая изюминка тура." },
        { icon: "🚐", title: "Финиш в Андриаке и возвращение в Каш", body: "Завершите в Демре (Мира) в гавани Андриаке, затем 40-минутная дорога в Каш. Прибытие около 17:00–17:30." },
      ],
    },
  },
];

export function getTour(slug: string): Tour | undefined {
  return [...TOURS, ...MULTI_DAY_TOURS].find((t) => t.slug === slug);
}
