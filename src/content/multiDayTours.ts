import type { Tour, Localized, DayPlan } from "@/content/tours";

// ---------------------------------------------------------------------------
// Multi-day expeditions + the TRAK private session.
// Source content: multidaystours.md. Kept in its own file to keep tours.ts
// focused on the single-day Kekova tours.
// ---------------------------------------------------------------------------

const INCLUDED_LYCIAN: Localized<string[]> = {
  en: [
    "All group airport transfers",
    "Hotels (6 nights)",
    "All meals including snacks (except free-day lunch)",
    "All bus/minibus transportation",
    "Certified kayak guide and second guide",
    "Kayak, paddle, PFD, dry bags, spray deck, snorkeling equipment",
    "Support boats when needed",
    "Drinking water on kayaking days",
    "Parking fees",
    "External guide fees",
    "Entrance fees to museums and archaeological sites",
  ],
  tr: [
    "Tüm grup havalimanı transferleri",
    "Otel konaklaması (6 gece)",
    "Atıştırmalıklar dahil tüm öğünler (serbest gün öğle yemeği hariç)",
    "Tüm otobüs/minibüs ulaşımı",
    "Sertifikalı kayak rehberi ve ikinci rehber",
    "Kayak, kürek, can yeleği, su geçirmez çanta, etek, şnorkel ekipmanı",
    "Gerektiğinde destek tekneleri",
    "Kürek günlerinde içme suyu",
    "Otopark ücretleri",
    "Harici rehber ücretleri",
    "Müze ve ören yeri giriş ücretleri",
  ],
  fr: [
    "Tous les transferts de groupe depuis l'aéroport",
    "Hôtels (6 nuits)",
    "Tous les repas, collations comprises (sauf déjeuner des jours libres)",
    "Tout le transport en bus/minibus",
    "Guide de kayak certifié et second guide",
    "Kayak, pagaie, gilet, sacs étanches, jupe, matériel de snorkeling",
    "Bateaux de soutien si nécessaire",
    "Eau potable les jours de kayak",
    "Frais de stationnement",
    "Frais de guide externe",
    "Entrées des musées et sites archéologiques",
  ],
  ru: [
    "Все групповые трансферы из аэропорта",
    "Отели (6 ночей)",
    "Все приёмы пищи, включая закуски (кроме обеда в свободные дни)",
    "Весь транспорт (автобус/минибус)",
    "Сертифицированный гид-каякер и второй гид",
    "Каяк, весло, спасжилет, гермомешки, юбка, снаряжение для снорклинга",
    "Лодки сопровождения при необходимости",
    "Питьевая вода в дни каякинга",
    "Парковочные сборы",
    "Услуги внешнего гида",
    "Входные билеты в музеи и на археологические объекты",
  ],
};

const NOT_INCLUDED_LYCIAN: Localized<string[]> = {
  en: [
    "All airfares to/from and within Turkey",
    "Personal expenses such as drinks or souvenirs",
    "Gratuities to tour leader, kayak guide, driver, etc.",
    "Hotel accommodation before and after the tour dates",
    "Free-day optional excursions",
    "Travel insurance",
  ],
  tr: [
    "Türkiye'ye/Türkiye'den ve ülke içi tüm uçak biletleri",
    "İçecek veya hediyelik gibi kişisel harcamalar",
    "Tur lideri, kayak rehberi, sürücü vb. için bahşişler",
    "Tur tarihlerinden önce ve sonra otel konaklaması",
    "Serbest gün opsiyonel turları",
    "Seyahat sigortası",
  ],
  fr: [
    "Tous les vols vers/depuis et à l'intérieur de la Turquie",
    "Dépenses personnelles comme boissons ou souvenirs",
    "Pourboires au chef de tour, guide de kayak, chauffeur, etc.",
    "Hébergement avant et après les dates du tour",
    "Excursions optionnelles des jours libres",
    "Assurance voyage",
  ],
  ru: [
    "Все авиабилеты в/из и внутри Турции",
    "Личные расходы, такие как напитки или сувениры",
    "Чаевые руководителю тура, гиду-каякеру, водителю и т. д.",
    "Проживание в отеле до и после дат тура",
    "Опциональные экскурсии в свободные дни",
    "Туристическая страховка",
  ],
};

// --- 7-Day Mediterranean Kayaking Adventure --------------------------------

const SEVEN_DAY_DAYS: Localized<DayPlan[]> = {
  en: [
    { day: 1, title: "Arrival in Kaş", body: "Welcome to Kaş — a laid-back coastal town with turquoise waters and mountain views. Settle into the campsite, wander the narrow streets and grab a sunset drink before the adventure begins." },
    { day: 2, title: "Kaş to Üzümlü Beach", body: "Paddle west along the Kaş coastline past rocky cliffs, hidden coves and crystal-clear swimming spots to the peaceful, uncrowded bay of Üzümlü Beach.", distance: "15 km" },
    { day: 3, title: "Kalkan to Patara", body: "Transfer to the postcard harbor town of Kalkan, then paddle rugged coastline to Patara — famous for its vast sandy beach and ancient ruins. Visit the ancient city with its parliament building and theater before transferring to Üçağız for the evening.", distance: "14 km" },
    { day: 4, title: "Kekova Classic Route", body: "A laid-back, beginner-friendly day packed with history. Glide over the Sunken City of Kekova, stop at the castle village of Simena, and maybe try the homemade ice cream before paddling back to Üçağız.", distance: "8 km" },
    { day: 5, title: "Kekova West Route", body: "A full day of paddling from Üçağız toward the wild western side of Kekova, reaching the lesser-known ancient city of Aperlai. A short hike on the Lycian Way, snorkeling over sunken ruins, and — wind permitting — kayak sailing.", distance: "14 km" },
    { day: 6, title: "Kekova East Route", body: "Glide over ruins in the shallows, paddle past islands toward Andriake (the ancient port of Myra), and follow the freshwater stream to spot sea turtles. Overnight at the Andriake campsite on the sandy beach.", distance: "15 km" },
    { day: 7, title: "Andriake to Taşdibi Beach", body: "The final leg — cruise along the coast, enjoy your last swims and wrap up at the wide pebbly bay of Taşdibi Beach, a chilled-out finish to an epic week.", distance: "14 km" },
  ],
  tr: [
    { day: 1, title: "Kaş'a Varış", body: "Kaş'a hoş geldiniz — turkuaz suları ve dağ manzaralı, sakin bir sahil kasabası. Kamp alanına yerleşin, dar sokaklarda dolaşın ve macera başlamadan gün batımında bir şeyler için." },
    { day: 2, title: "Kaş'tan Üzümlü Plajı'na", body: "Kaş kıyısı boyunca batıya; kayalık falezler, saklı koylar ve berrak yüzme noktaları arasından sakin ve tenha Üzümlü Plajı'na kürek çekin.", distance: "15 km" },
    { day: 3, title: "Kalkan'dan Patara'ya", body: "Kartpostal gibi Kalkan limanına transfer, ardından engebeli kıyı boyunca Patara'ya kürek. Geniş kumsalı ve antik kalıntılarıyla ünlü Patara'da meclis binası ve tiyatroyu gezin, akşam için Üçağız'a transfer olun.", distance: "14 km" },
    { day: 4, title: "Kekova Classic Rotası", body: "Tarihle dolu, sakin ve başlangıç dostu bir gün. Kekova Batık Şehri üzerinde kürek çekin, kale köyü Simena'da durun, ev yapımı dondurmayı tadıp Üçağız'a geri dönün.", distance: "8 km" },
    { day: 5, title: "Kekova West Rotası", body: "Üçağız'dan Kekova'nın vahşi batı yakasına, az bilinen antik Aperlai kentine kadar tam gün kürek. Likya Yolu'nda kısa yürüyüş, batık kalıntılar üzerinde şnorkel ve rüzgar uygunsa kayak yelkeni.", distance: "14 km" },
    { day: 6, title: "Kekova East Rotası", body: "Sığ sulardaki kalıntıların üzerinden geçin, adalar boyunca Andriake'ye (Myra'nın antik limanı) kürek çekin ve tatlı su deresini izleyerek deniz kaplumbağalarını görün. Geceyi Andriake kamp alanında, kumsalda geçirin.", distance: "15 km" },
    { day: 7, title: "Andriake'den Taşdibi Plajı'na", body: "Son etap — kıyı boyunca ilerleyin, son yüzmelerinizin tadını çıkarın ve geniş çakıllı Taşdibi koyunda turu tamamlayın; muhteşem bir haftaya keyifli bir final.", distance: "14 km" },
  ],
  fr: [
    { day: 1, title: "Arrivée à Kaş", body: "Bienvenue à Kaş — une ville côtière paisible aux eaux turquoise et aux vues sur les montagnes. Installez-vous au campement, flânez dans les ruelles et prenez un verre au coucher du soleil avant le départ." },
    { day: 2, title: "Kaş à la plage d'Üzümlü", body: "Pagayez vers l'ouest le long de la côte de Kaş, entre falaises rocheuses, criques cachées et eaux cristallines, jusqu'à la baie paisible d'Üzümlü.", distance: "15 km" },
    { day: 3, title: "Kalkan à Patara", body: "Transfert vers le port pittoresque de Kalkan, puis pagaie le long d'une côte sauvage jusqu'à Patara, célèbre pour son immense plage de sable et ses ruines antiques. Visite de la cité antique (parlement et théâtre) avant le transfert à Üçağız.", distance: "14 km" },
    { day: 4, title: "Route Kekova Classic", body: "Une journée détendue, accessible aux débutants et riche en histoire. Glissez au-dessus de la Cité engloutie de Kekova, arrêtez-vous au village-château de Simena et goûtez la glace maison avant le retour à Üçağız.", distance: "8 km" },
    { day: 5, title: "Route Kekova Ouest", body: "Une journée complète de pagaie d'Üçağız vers la côte ouest sauvage de Kekova jusqu'à l'antique Aperlai. Courte randonnée sur la Voie lycienne, snorkeling au-dessus des ruines englouties et, si le vent le permet, voile en kayak.", distance: "14 km" },
    { day: 6, title: "Route Kekova Est", body: "Glissez au-dessus des ruines dans les hauts-fonds, pagayez entre les îles vers Andriake (l'ancien port de Myra) et suivez le ruisseau d'eau douce pour observer les tortues de mer. Nuit au campement d'Andriake sur la plage.", distance: "15 km" },
    { day: 7, title: "Andriake à la plage de Taşdibi", body: "Dernière étape — longez la côte, profitez de vos dernières baignades et terminez dans la large baie de galets de Taşdibi, une fin tout en douceur d'une semaine épique.", distance: "14 km" },
  ],
  ru: [
    { day: 1, title: "Прибытие в Каш", body: "Добро пожаловать в Каш — спокойный прибрежный городок с бирюзовой водой и видами на горы. Разместитесь в кемпинге, прогуляйтесь по узким улочкам и встретите закат за бокалом перед началом приключения." },
    { day: 2, title: "Каш — пляж Üzümlü", body: "Гребите на запад вдоль побережья Каша мимо скалистых утёсов, скрытых бухт и кристально чистых мест для купания к тихой, безлюдной бухте Üzümlü.", distance: "15 км" },
    { day: 3, title: "Калкан — Патара", body: "Трансфер в живописный портовый Калкан, затем гребля вдоль сурового побережья к Патаре, знаменитой огромным песчаным пляжем и древними руинами. Осмотр античного города с зданием парламента и театром, затем трансфер в Üçağız.", distance: "14 км" },
    { day: 4, title: "Маршрут Kekova Classic", body: "Спокойный день для начинающих, насыщенный историей. Пройдите над Затонувшим городом Кекова, остановитесь в деревне-крепости Симена, попробуйте домашнее мороженое и вернитесь в Üçağız.", distance: "8 км" },
    { day: 5, title: "Маршрут Kekova West", body: "Полный день гребли от Üçağız к дикой западной стороне Кековы и малоизвестному древнему городу Аперлаи. Короткий поход по Ликийской тропе, снорклинг над затонувшими руинами и, если позволит ветер, парус на каяке.", distance: "14 км" },
    { day: 6, title: "Маршрут Kekova East", body: "Пройдите над руинами на мелководье, гребите мимо островов к Андриаке (древний порт Миры) и вдоль пресноводного ручья, чтобы увидеть морских черепах. Ночёвка в кемпинге Андриаке на песчаном пляже.", distance: "15 км" },
    { day: 7, title: "Андриаке — пляж Taşdibi", body: "Финальный этап — пройдите вдоль побережья, насладитесь последними купаниями и завершите путь в широкой галечной бухте Taşdibi — спокойный финал эпической недели.", distance: "14 км" },
  ],
};

// --- Coast of Light (4 Days, draft) ----------------------------------------

const COAST_OF_LIGHT_DAYS: Localized<DayPlan[]> = {
  en: [
    { day: 1, title: "Kaş to Üzümlü", body: "Meet in Kaş and start the tour at Büyükçakıl, then paddle to Üzümlü for camping. Lunch and dinner at the campsite, with breakfast the next morning." },
    { day: 2, title: "Üzümlü to Aperlai", body: "Paddle from Üzümlü to the ancient city of Aperlai. Camping at Aperlai with lunch, dinner and breakfast." },
    { day: 3, title: "Aperlai to Simena", body: "Continue to Simena, stopping for lunch at Nomad Ramazan's fisherman house along the way. Dinner and overnight in the castle village of Simena." },
    { day: 4, title: "Sunken City & East Route to Andriake", body: "After breakfast, paddle over the Sunken City, enjoy a picnic lunch, then follow the eastern route to finish at Andriake." },
  ],
  tr: [
    { day: 1, title: "Kaş'tan Üzümlü'ye", body: "Kaş'ta buluşun ve tura Büyükçakıl'dan başlayıp Üzümlü'ye kürek çekin; kamp burada. Kamp alanında öğle ve akşam yemeği, ertesi sabah kahvaltı." },
    { day: 2, title: "Üzümlü'den Aperlai'ye", body: "Üzümlü'den antik Aperlai kentine kürek çekin. Aperlai'de kamp; öğle, akşam yemeği ve kahvaltı." },
    { day: 3, title: "Aperlai'den Simena'ya", body: "Yol üzerinde Nomad Ramazan'ın balıkçı evinde öğle yemeği molasıyla Simena'ya devam edin. Kale köyü Simena'da akşam yemeği ve konaklama." },
    { day: 4, title: "Batık Şehir ve Doğu Rotası ile Andriake", body: "Kahvaltıdan sonra Batık Şehir üzerinde kürek çekin, piknik öğle yemeğinin tadını çıkarın, ardından doğu rotasını izleyerek Andriake'de tamamlayın." },
  ],
  fr: [
    { day: 1, title: "Kaş à Üzümlü", body: "Rendez-vous à Kaş et départ à Büyükçakıl, puis pagaie jusqu'à Üzümlü pour le campement. Déjeuner et dîner au camp, petit-déjeuner le lendemain matin." },
    { day: 2, title: "Üzümlü à Aperlai", body: "Pagayez d'Üzümlü vers la cité antique d'Aperlai. Campement à Aperlai avec déjeuner, dîner et petit-déjeuner." },
    { day: 3, title: "Aperlai à Simena", body: "Continuez vers Simena, avec une pause déjeuner chez le pêcheur Nomad Ramazan en chemin. Dîner et nuit au village-château de Simena." },
    { day: 4, title: "Cité engloutie & route est vers Andriake", body: "Après le petit-déjeuner, pagayez au-dessus de la Cité engloutie, savourez un pique-nique, puis suivez la route est pour terminer à Andriake." },
  ],
  ru: [
    { day: 1, title: "Каш — Üzümlü", body: "Встреча в Каше, старт у Büyükçakıl, затем гребля к Üzümlü на ночёвку в кемпинге. Обед и ужин в лагере, завтрак на следующее утро." },
    { day: 2, title: "Üzümlü — Аперлаи", body: "Гребите от Üzümlü к древнему городу Аперлаи. Кемпинг в Аперлаи: обед, ужин и завтрак." },
    { day: 3, title: "Аперлаи — Симена", body: "Продолжайте к Симене с остановкой на обед в доме рыбака Nomad Ramazan по пути. Ужин и ночёвка в деревне-крепости Симена." },
    { day: 4, title: "Затонувший город и восточный маршрут к Андриаке", body: "После завтрака пройдите над Затонувшим городом, устройте пикник-обед, затем по восточному маршруту завершите путь в Андриаке." },
  ],
};

// --- Kekova Sound (2 Days, draft) ------------------------------------------

const KEKOVA_SOUND_DAYS: Localized<DayPlan[]> = {
  en: [
    { day: 1, title: "Kekova West", body: "Meet at Kaş King's Tomb at 07:30, transfer to Üçağız, then paddle to Simena and over the Sunken City of Kekova. Swim break at Tersane Bay, then on to Aperlai for a home-cooked lunch at a fisherman's house and a short hike on the Lycian Way. Dinner and overnight at the hotel." },
    { day: 2, title: "Kekova East", body: "After breakfast, paddle directly over the Sunken City, swim and snorkel in hidden bays, and enjoy a picnic lunch. Pass a sea cave once home to monk seals, follow the Andriake stream to spot sea turtles, and finish with a final swim before showering at a nearby campsite." },
  ],
  tr: [
    { day: 1, title: "Kekova Batı", body: "07:30'da Kaş Kral Mezarı'nda buluşun, Üçağız'a transfer olun, ardından Simena'ya ve Kekova Batık Şehri üzerine kürek çekin. Tersane Koyu'nda yüzme molası, sonra Aperlai'de balıkçı evinde ev yemeği ve Likya Yolu'nda kısa yürüyüş. Otelde akşam yemeği ve konaklama." },
    { day: 2, title: "Kekova Doğu", body: "Kahvaltıdan sonra doğrudan Batık Şehir üzerinde kürek çekin, saklı koylarda yüzüp şnorkel yapın ve piknik öğle yemeğinin tadını çıkarın. Bir zamanlar fokların yaşadığı deniz mağarasının yanından geçin, Andriake deresini izleyerek deniz kaplumbağalarını görün ve yakındaki kamp alanında duş almadan önce son bir yüzmeyle bitirin." },
  ],
  fr: [
    { day: 1, title: "Kekova Ouest", body: "Rendez-vous au tombeau du roi de Kaş à 07h30, transfert à Üçağız, puis pagaie vers Simena et au-dessus de la Cité engloutie de Kekova. Baignade à la baie de Tersane, puis Aperlai pour un déjeuner maison chez un pêcheur et une courte randonnée sur la Voie lycienne. Dîner et nuit à l'hôtel." },
    { day: 2, title: "Kekova Est", body: "Après le petit-déjeuner, pagayez directement au-dessus de la Cité engloutie, baignez-vous et faites du snorkeling dans des criques cachées, puis profitez d'un pique-nique. Longez une grotte marine, ancien refuge de phoques moines, suivez le ruisseau d'Andriake pour observer les tortues, et terminez par une dernière baignade avant la douche au campement voisin." },
  ],
  ru: [
    { day: 1, title: "Кекова Запад", body: "Встреча у Царской гробницы Каша в 07:30, трансфер в Üçağız, затем гребля к Симене и над Затонувшим городом Кекова. Купание в бухте Терсане, далее Аперлаи: домашний обед в доме рыбака и короткий поход по Ликийской тропе. Ужин и ночёвка в отеле." },
    { day: 2, title: "Кекова Восток", body: "После завтрака пройдите прямо над Затонувшим городом, купайтесь и занимайтесь снорклингом в скрытых бухтах, устройте пикник-обед. Пройдите мимо морской пещеры, бывшего пристанища тюленей-монахов, вдоль ручья Андриаке понаблюдайте за черепахами и завершите финальным купанием перед душем в соседнем кемпинге." },
  ],
};

// --- Lycian Kayak & Comfort Escape (7 Days, FINAL) -------------------------

const LYCIAN_DAYS: Localized<DayPlan[]> = {
  en: [
    { day: 1, title: "Arrival & Introduction to Kekova", body: "Greeted at the airport and transferred to Üçağız with a first Turkish lunch en route. After settling into your hotel in Üçağız/Simena, paddle over the Sunken City of Kekova and explore the castle island of Kaleköy, then a traditional Turkish dinner.", distance: "3 miles" },
    { day: 2, title: "Aperlai & Snorkeling Adventure", body: "Paddle the western route to ancient Aperlai via Tersane Bay. A short hike to the ruins and the story of the royal purple dye, then snorkel above the sunken city. Seafood lunch at Nomad Ramazan's fisherman house, with optional kayak sailing on the way back.", distance: "8.5 miles · 1.5 mi hike" },
    { day: 3, title: "Kekova East & Andriake Lycian Museum", body: "The eastern route through hidden bays, a protected monk-seal cave, and turtle spotting in the Andriake stream. Visit the Andriake Lycian Museum and ancient cistern, then transfer to Kaş for dinner.", distance: "9 miles" },
    { day: 4, title: "Free Day (your choice)", body: "Relax in Kaş or choose an optional excursion: a boat ride to the Greek island of Kastellorizo, a visit to Myra and the Church of Saint Nicholas, or diving in Kaş's world-renowned waters. Dinner with Mediterranean flavors." },
    { day: 5, title: "Kayaking in the Kaş Archipelago", body: "A full day of kayaking around Kaş — hidden coves, serene Mediterranean water and views over Kaş and Kastellorizo, with a leisurely seaside lunch. Traditional Turkish dinner in the evening.", distance: "7.5 miles" },
    { day: 6, title: "Patara Adventure", body: "Transfer to Kalkan and paddle to Patara Beach — Turkey's longest stretch of sand and one of the world's earliest parliament buildings. Beach picnic and time to explore the ancient ruins, then a farewell dinner at your Patara hotel.", distance: "9 miles" },
    { day: 7, title: "Departure", body: "A leisurely breakfast before checking out. Our team transfers you to the airport with memories of an unforgettable journey along the Lycian Coast." },
  ],
  tr: [
    { day: 1, title: "Varış ve Kekova'ya Giriş", body: "Havalimanında karşılanıp yol üzerinde ilk Türk öğle yemeğiyle Üçağız'a transfer. Üçağız/Simena'daki otelinize yerleştikten sonra Kekova Batık Şehri üzerinde kürek çekip kale adası Kaleköy'ü keşfedin; ardından geleneksel Türk akşam yemeği.", distance: "3 mil" },
    { day: 2, title: "Aperlai ve Şnorkel Macerası", body: "Tersane Koyu üzerinden batı rotasıyla antik Aperlai'ye kürek. Kalıntılara kısa yürüyüş ve kraliyet moru boyasının hikayesi, sonra batık şehrin üzerinde şnorkel. Nomad Ramazan'ın balıkçı evinde deniz ürünleri öğle yemeği, dönüşte opsiyonel kayak yelkeni.", distance: "8,5 mil · 1,5 mil yürüyüş" },
    { day: 3, title: "Kekova Doğu ve Andriake Likya Müzesi", body: "Saklı koylar, korunan fok mağarası ve Andriake deresinde kaplumbağa gözlemiyle doğu rotası. Andriake Likya Müzesi ve antik sarnıcı ziyaret edip akşam yemeği için Kaş'a transfer.", distance: "9 mil" },
    { day: 4, title: "Serbest Gün (sizin seçiminiz)", body: "Kaş'ta dinlenin veya opsiyonel bir tur seçin: Yunan adası Meis'e tekne turu, Myra ve Aziz Nikolaos Kilisesi ziyareti ya da dünyaca ünlü Kaş sularında dalış. Akdeniz lezzetleriyle akşam yemeği." },
    { day: 5, title: "Kaş Takımadalarında Kürek", body: "Kaş çevresinde tam gün kürek — saklı koylar, sakin Akdeniz suları, Kaş ve Meis manzaraları ve deniz kenarında keyifli bir öğle yemeği. Akşam geleneksel Türk yemeği.", distance: "7,5 mil" },
    { day: 6, title: "Patara Macerası", body: "Kalkan'a transfer ve Patara Plajı'na kürek — Türkiye'nin en uzun kumsalı ve dünyanın en eski meclis binalarından biri. Plaj pikniği ve antik kalıntıları gezme zamanı, ardından Patara otelinizde veda yemeği.", distance: "9 mil" },
    { day: 7, title: "Ayrılış", body: "Çıkıştan önce keyifli bir kahvaltı. Ekibimiz sizi, Likya Kıyısı boyunca unutulmaz bir yolculuğun anılarıyla havalimanına transfer eder." },
  ],
  fr: [
    { day: 1, title: "Arrivée & introduction à Kekova", body: "Accueil à l'aéroport et transfert à Üçağız avec un premier déjeuner turc en chemin. Après installation à l'hôtel d'Üçağız/Simena, pagaie au-dessus de la Cité engloutie de Kekova et visite de l'île-château de Kaleköy, puis dîner turc traditionnel.", distance: "3 miles" },
    { day: 2, title: "Aperlai & aventure snorkeling", body: "Route ouest vers l'antique Aperlai via la baie de Tersane. Courte randonnée jusqu'aux ruines et l'histoire de la pourpre royale, puis snorkeling au-dessus de la cité engloutie. Déjeuner de fruits de mer chez le pêcheur Nomad Ramazan, voile en kayak en option au retour.", distance: "8,5 miles · 1,5 mi de marche" },
    { day: 3, title: "Kekova Est & musée lycien d'Andriake", body: "Route est à travers criques cachées, grotte protégée de phoques moines et observation des tortues dans le ruisseau d'Andriake. Visite du musée lycien d'Andriake et de l'ancienne citerne, puis transfert à Kaş pour le dîner.", distance: "9 miles" },
    { day: 4, title: "Journée libre (au choix)", body: "Détente à Kaş ou excursion en option : bateau vers l'île grecque de Kastellorizo, visite de Myra et de l'église Saint-Nicolas, ou plongée dans les eaux réputées de Kaş. Dîner aux saveurs méditerranéennes." },
    { day: 5, title: "Kayak dans l'archipel de Kaş", body: "Journée complète de kayak autour de Kaş — criques cachées, eaux méditerranéennes sereines et vues sur Kaş et Kastellorizo, avec un déjeuner tranquille en bord de mer. Dîner turc traditionnel le soir.", distance: "7,5 miles" },
    { day: 6, title: "Aventure à Patara", body: "Transfert à Kalkan et pagaie vers la plage de Patara — la plus longue de Turquie et l'un des plus anciens parlements du monde. Pique-nique sur la plage et exploration des ruines antiques, puis dîner d'adieu à votre hôtel de Patara.", distance: "9 miles" },
    { day: 7, title: "Départ", body: "Un petit-déjeuner tranquille avant le départ. Notre équipe vous transfère à l'aéroport avec les souvenirs d'un voyage inoubliable le long de la côte lycienne." },
  ],
  ru: [
    { day: 1, title: "Прибытие и знакомство с Кековой", body: "Встреча в аэропорту и трансфер в Üçağız с первым турецким обедом по пути. После размещения в отеле в Üçağız/Симена — гребля над Затонувшим городом Кекова и осмотр острова-крепости Калекёй, затем традиционный турецкий ужин.", distance: "3 мили" },
    { day: 2, title: "Аперлаи и снорклинг", body: "Западный маршрут к древнему Аперлаи через бухту Терсане. Короткий поход к руинам и история царского пурпура, затем снорклинг над затонувшим городом. Обед из морепродуктов в доме рыбака Nomad Ramazan, на обратном пути — парус на каяке по желанию.", distance: "8,5 мили · 1,5 мили пешком" },
    { day: 3, title: "Кекова Восток и Ликийский музей Андриаке", body: "Восточный маршрут через скрытые бухты, охраняемую пещеру тюленей-монахов и наблюдение за черепахами в ручье Андриаке. Посещение Ликийского музея Андриаке и древней цистерны, затем трансфер в Каш на ужин.", distance: "9 миль" },
    { day: 4, title: "Свободный день (на выбор)", body: "Отдых в Каше или экскурсия по желанию: лодка на греческий остров Кастелоризо, поездка в Миру и церковь Святого Николая или дайвинг в знаменитых водах Каша. Ужин со средиземноморскими вкусами." },
    { day: 5, title: "Каякинг в архипелаге Каша", body: "Полный день каякинга вокруг Каша — скрытые бухты, спокойная средиземноморская вода и виды на Каш и Кастелоризо, неспешный обед у моря. Вечером традиционный турецкий ужин.", distance: "7,5 мили" },
    { day: 6, title: "Приключение в Патаре", body: "Трансфер в Калкан и гребля к пляжу Патара — самому длинному в Турции и одному из древнейших зданий парламента в мире. Пикник на пляже и время на осмотр античных руин, затем прощальный ужин в отеле Патары.", distance: "9 миль" },
    { day: 7, title: "Отъезд", body: "Неспешный завтрак перед выездом. Наша команда доставит вас в аэропорт с воспоминаниями о незабываемом путешествии вдоль Ликийского побережья." },
  ],
};

// --- TRAK Signature Experience ---------------------------------------------

const TRAK_HIGHLIGHTS: Localized<string[]> = {
  en: [
    "Assemble a real expedition-level folding kayak",
    "Learn performance tuning for the TRAK 2.0",
    "Paddle the crystal-clear Mediterranean and pass Kekova's sunken city",
    "Bonus lunch in the Simena castle village",
    "One-on-one coaching for all levels",
  ],
  tr: [
    "Gerçek bir expedisyon seviyesi katlanır kayak kurun",
    "TRAK 2.0 için performans ayarını öğrenin",
    "Berrak Akdeniz'de kürek çekip Kekova batık şehrinin yanından geçin",
    "Bonus: Simena kale köyünde öğle yemeği",
    "Her seviyeye birebir koçluk",
  ],
  fr: [
    "Assemblez un véritable kayak pliant de niveau expédition",
    "Apprenez le réglage de performance du TRAK 2.0",
    "Pagayez en Méditerranée cristalline et longez la cité engloutie de Kekova",
    "Déjeuner bonus au village-château de Simena",
    "Coaching individuel pour tous les niveaux",
  ],
  ru: [
    "Соберите настоящий складной каяк экспедиционного уровня",
    "Освойте настройку производительности TRAK 2.0",
    "Гребите по кристальному Средиземному морю мимо затонувшего города Кекова",
    "Бонус: обед в деревне-крепости Симена",
    "Индивидуальный коучинг для всех уровней",
  ],
};

const TRAK_INCLUDED: Localized<string[]> = {
  en: ["TRAK kayak & paddle", "Safety gear", "Mask and snorkel", "Instruction & coaching", "Photos & short videos", "Snacks & lunch", "Transportation"],
  tr: ["TRAK kayak ve kürek", "Güvenlik ekipmanı", "Maske ve şnorkel", "Eğitim ve koçluk", "Fotoğraf ve kısa videolar", "Atıştırmalık ve öğle yemeği", "Ulaşım"],
  fr: ["Kayak & pagaie TRAK", "Équipement de sécurité", "Masque et tuba", "Instruction & coaching", "Photos & courtes vidéos", "Collations & déjeuner", "Transport"],
  ru: ["Каяк и весло TRAK", "Снаряжение безопасности", "Маска и трубка", "Инструктаж и коучинг", "Фото и короткие видео", "Закуски и обед", "Транспорт"],
};

export const MULTI_DAY_TOURS: Tour[] = [
  {
    slug: "lycian-comfort-escape",
    level: "intermediate-advanced",
    heroImage: "/images/tours/lycian-comfort-escape.jpg",
    gallery: [],
    title: {
      tr: "Likya Kayak & Konfor Kaçamağı",
      en: "Lycian Kayak & Comfort Escape",
      fr: "Escapade Confort & Kayak en Lycie",
      ru: "Ликийский каякинг и комфорт-эскейп",
    },
    tagline: {
      tr: "Tarih ve doğa arasında her şey dahil 7 günlük paddling deneyimi.",
      en: "An all-inclusive 7-day paddling experience through history and nature.",
      fr: "Une expérience de pagaie tout compris de 7 jours, entre histoire et nature.",
      ru: "Всё включено: 7-дневное паддл-путешествие сквозь историю и природу.",
    },
    description: {
      tr: "Türkiye'nin muhteşem Likya Kıyısı boyunca haftalık deniz kayağı turumuzla zaman ve doğa içinde bir yolculuğa çıkın. Berrak sularda kürek çekerken antik kentleri, saklı koyları ve binlerce yıllık kalıntıları keşfedin. Maceracılar, tarih meraklıları ve otantik bir deneyim arayanlar için ideal.",
      en: "Embark on a journey through time and nature with our weekly sea kayaking tour along Turkey's stunning Lycian Coast. Paddle through crystal-clear waters while discovering ancient cities, hidden coves and ruins that date back millennia. Perfect for adventurers, history enthusiasts and those seeking a truly authentic experience.",
      fr: "Partez pour un voyage à travers le temps et la nature avec notre tour hebdomadaire de kayak de mer le long de la superbe côte lycienne de Turquie. Pagayez en eaux cristallines à la découverte de cités antiques, de criques cachées et de ruines millénaires. Idéal pour les aventuriers et les passionnés d'histoire.",
      ru: "Отправьтесь в путешествие сквозь время и природу в нашем недельном туре по морскому каякингу вдоль великолепного Ликийского побережья Турции. Гребите по кристально чистой воде, открывая древние города, скрытые бухты и тысячелетние руины. Идеально для искателей приключений и любителей истории.",
    },
    highlights: {
      tr: ["İki batık antik kent: Kekova ve Aperlai", "Kaş takımadalarında tam gün kürek", "Patara — Türkiye'nin en uzun kumsalı", "Andriake Likya Müzesi", "Serbest gün opsiyonel turları", "Her şey dahil konfor konaklama"],
      en: ["Two sunken ancient cities: Kekova & Aperlai", "Full-day paddling in the Kaş archipelago", "Patara — Turkey's longest beach", "Andriake Lycian Museum", "Optional free-day excursions", "All-inclusive comfort accommodation"],
      fr: ["Deux cités antiques englouties : Kekova & Aperlai", "Journée complète de pagaie dans l'archipel de Kaş", "Patara — la plus longue plage de Turquie", "Musée lycien d'Andriake", "Excursions optionnelles le jour libre", "Hébergement confort tout compris"],
      ru: ["Два затонувших древних города: Кекова и Аперлаи", "Полный день каякинга в архипелаге Каша", "Патара — самый длинный пляж Турции", "Ликийский музей Андриаке", "Опциональные экскурсии в свободный день", "Комфортное проживание «всё включено»"],
    },
    included: INCLUDED_LYCIAN,
    multiDay: {
      durationDays: 7,
      nights: 6,
      status: "final",
      groupSize: { tr: "min 6, max 12 kişi", en: "min 6, max 12 people", fr: "min 6, max 12 personnes", ru: "мин 6, макс 12 человек" },
      dates: [
        "22-29 May 2026",
        "14-21 June 2026",
        "13-20 July 2026",
        "04-11 August 2026",
        "07-14 September 2026",
        "20-26 September 2026",
        "05-12 October 2026",
        "22-29 October 2026",
        "03-10 November 2026",
      ],
      dayByDay: LYCIAN_DAYS,
      notIncluded: NOT_INCLUDED_LYCIAN,
    },
  },
  {
    slug: "7day-mediterranean",
    level: "intermediate-advanced",
    heroImage: "/images/tours/7day-mediterranean.jpg",
    gallery: [],
    title: {
      tr: "7 Günlük Akdeniz Kayak Macerası",
      en: "7-Day Mediterranean Kayaking Adventure",
      fr: "Aventure Kayak Méditerranée 7 Jours",
      ru: "7-дневное средиземноморское каякинг-приключение",
    },
    tagline: {
      tr: "Deniz, güneş, antik kalıntılar ve saklı plajlar — hepsi kayakla!",
      en: "A mix of sea, sunshine, ancient ruins and hidden beaches — all by kayak!",
      fr: "Mer, soleil, ruines antiques et plages cachées — le tout en kayak !",
      ru: "Море, солнце, древние руины и скрытые пляжи — всё на каяке!",
    },
    description: {
      tr: "Kaş'tan Andriake'ye kadar Likya kıyısı boyunca yedi gün boyunca kürek çekin: kayalık koylar, batık şehirler, antik kentler ve kamp geceleri. Bol yüzme molası ve yaban hayatı gözlemiyle küçük grup, rehber eşliğinde bir macera.",
      en: "Paddle the Lycian coast from Kaş to Andriake over seven days: rocky coves, sunken cities, ancient sites and nights under canvas. A small-group, guide-led adventure with plenty of swim breaks and wildlife spotting.",
      fr: "Pagayez la côte lycienne de Kaş à Andriake en sept jours : criques rocheuses, cités englouties, sites antiques et nuits sous tente. Une aventure en petit groupe encadrée, avec de nombreuses pauses baignade et observation de la faune.",
      ru: "Семь дней гребли по Ликийскому побережью от Каша до Андриаке: скалистые бухты, затонувшие города, древние памятники и ночёвки в палатках. Приключение в малой группе с гидом, с множеством купаний и наблюдением за дикой природой.",
    },
    highlights: {
      tr: ["Saklı koylar, plajlar ve antik kalıntılar", "Batık şehirler üzerinde şnorkel", "Likya Yolu'nda yürüyüş", "Yaban hayatı: kaplumbağa, yaban keçisi, belki fok", "Kale köyü molaları ve taze yerel öğle yemekleri", "Bol yüzme molalı küçük grup macerası"],
      en: ["Hidden bays, beaches & ancient ruins", "Snorkel over sunken cities", "Hike along the Lycian Way", "Wildlife: sea turtles, wild goats, maybe monk seals", "Castle-village stops & fresh local lunches", "Small-group adventure with plenty of swim breaks"],
      fr: ["Baies cachées, plages & ruines antiques", "Snorkeling au-dessus des cités englouties", "Randonnée sur la Voie lycienne", "Faune : tortues, chèvres sauvages, peut-être phoques moines", "Arrêts dans des villages-châteaux & déjeuners locaux frais", "Aventure en petit groupe avec de nombreuses baignades"],
      ru: ["Скрытые бухты, пляжи и древние руины", "Снорклинг над затонувшими городами", "Поход по Ликийской тропе", "Дикая природа: черепахи, дикие козы, возможно тюлени-монахи", "Остановки в деревнях-крепостях и свежие местные обеды", "Приключение в малой группе с множеством купаний"],
    },
    multiDay: {
      durationDays: 7,
      nights: 6,
      status: "draft",
      dayByDay: SEVEN_DAY_DAYS,
    },
  },
  {
    slug: "coast-of-light",
    level: "intermediate-advanced",
    heroImage: "/images/tours/coast-of-light.jpg",
    gallery: [],
    title: {
      tr: "Işık Kıyısı — Kano & Kamp Turu (4 Gün)",
      en: "Camping & Kayaking Tour - Coast of Light 4 Days",
      fr: "Camping & Kayaking Tour - Côte de Lumière 4 Jours",
      ru: "Camping & Kayaking Tour - Берег Света 4 дня",
    },
    tagline: {
      tr: "Antik Likya boyunca kayak ve şnorkel macerası.",
      en: "A sea kayaking & snorkeling adventure along ancient Lycia.",
      fr: "Une aventure kayak & snorkeling le long de l'antique Lycie.",
      ru: "Каякинг и снорклинг вдоль древней Ликии.",
    },
    description: {
      tr: "Likya kıyısı boyunca unutulmaz bir deniz kayağı yolculuğu: Kaş'tan Myra'nın (Andriake) tarihi limanına kürek çekerek iki batık şehri, muhteşem Akdeniz manzaralarını ve saklı koyları keşfedin. Simena ve Limanağzı'nda kamp geceleri. (Bu rota taslak aşamasındadır.)",
      en: "An unforgettable sea kayaking journey along the Lycian coast: paddle from Kaş to the historic harbor of Myra (Andriake), revealing two sunken cities, stunning Mediterranean landscapes and hidden bays. Camping nights at Simena and Limanağzı. (This route is in draft.)",
      fr: "Un voyage inoubliable en kayak de mer le long de la côte lycienne : de Kaş au port historique de Myra (Andriake), révélant deux cités englouties, des paysages méditerranéens superbes et des baies cachées. Nuits en camping à Simena et Limanağzı. (Itinéraire en cours de finalisation.)",
      ru: "Незабываемое путешествие на морском каяке вдоль ликийского побережья: от Каша до исторической гавани Миры (Андриаке), открывая два затонувших города, великолепные средиземноморские пейзажи и скрытые бухты. Ночёвки в кемпинге в Симене и Limanağzı. (Маршрут в стадии черновика.)",
    },
    highlights: {
      tr: ["İki batık şehir: Kekova ve Aperlai", "Sahil ve kamp konaklaması", "Likya Yolu manzaraları", "Batık limanlar üzerinde şnorkel", "Kale köyü Simena"],
      en: ["Two sunken cities: Kekova & Aperlai", "Beach & camping accommodation", "Lycian Way scenery", "Snorkel over sunken harbors", "Castle village of Simena"],
      fr: ["Deux cités englouties : Kekova & Aperlai", "Hébergement plage & camping", "Paysages de la Voie lycienne", "Snorkeling au-dessus des ports engloutis", "Village-château de Simena"],
      ru: ["Два затонувших города: Кекова и Аперлаи", "Размещение на пляже и в кемпинге", "Пейзажи Ликийской тропы", "Снорклинг над затонувшими гаванями", "Деревня-крепость Симена"],
    },
    multiDay: {
      durationDays: 4,
      nights: 3,
      status: "draft",
      dayByDay: COAST_OF_LIGHT_DAYS,
    },
  },
  {
    slug: "kekova-sound",
    level: "intermediate-advanced",
    heroImage: "/images/tours/kekova-sound.jpg",
    gallery: [],
    title: {
      tr: "Kekova Körfezi — 2 Gün",
      en: "Kekova Sound — 2 Days",
      fr: "Détroit de Kekova — 2 Jours",
      ru: "Пролив Кекова — 2 дня",
    },
    tagline: {
      tr: "Büyüleyici Simena Köyü'nde konaklamalı, Kekova ve Aperlai boyunca iki günlük kayak yolculuğu.",
      en: "A two-day kayaking journey through Kekova & Aperlai with an overnight stay at stunning Simena Village.",
      fr: "Un voyage de kayak de deux jours à travers Kekova & Aperlai, avec une nuit au superbe village de Simena.",
      ru: "Двухдневное каякинг-путешествие по Кекове и Аперлаи с ночёвкой в очаровательной деревне Симена.",
    },
    description: {
      tr: "Kekova ve Aperlai bölgelerinde unutulmaz iki günlük bir deniz kayağı yolculuğu. Batık kalıntılar üzerinde kürek çekin, berrak sularda şnorkel yapın, hava uygunsa kayakla yelken açın, doğal ortamında yaban hayatını gözlemleyin. Sahil köyünde bir gece konaklamayla, orta-ileri seviye kürekçiler için tasarlandı. (Bu rota taslak aşamasındadır.)",
      en: "An unforgettable two-day sea kayaking journey through the Kekova and Aperlai regions. Paddle over sunken ruins, snorkel in crystal-clear waters, sail with your kayak (weather permitting) and spot wildlife in its natural habitat. Designed for intermediate-to-advanced paddlers, with one overnight in a charming coastal village. (This route is in draft.)",
      fr: "Un voyage inoubliable de deux jours en kayak de mer à travers les régions de Kekova et Aperlai. Pagayez au-dessus des ruines englouties, faites du snorkeling en eaux cristallines, naviguez à la voile (selon météo) et observez la faune. Conçu pour pagayeurs intermédiaires à avancés, avec une nuit dans un charmant village côtier. (Itinéraire en cours de finalisation.)",
      ru: "Незабываемое двухдневное путешествие на морском каяке по регионам Кекова и Аперлаи. Гребите над затонувшими руинами, занимайтесь снорклингом в кристальной воде, идите под парусом (по погоде) и наблюдайте за дикой природой. Для гребцов среднего и продвинутого уровня, с одной ночёвкой в очаровательной прибрежной деревне. (Маршрут в стадии черновика.)",
    },
    highlights: {
      tr: ["Kekova Batık Şehri üzerinde kürek", "Tersane Koyu'nda yüzme ve şnorkel", "Aperlai antik kenti ve Likya Yolu", "Balıkçı evinde ev yemeği", "Andriake deresinde kaplumbağa gözlemi"],
      en: ["Paddle over the Sunken City of Kekova", "Swim & snorkel at Tersane Bay", "Aperlai ancient city & the Lycian Way", "Home-cooked meal at a fisherman's house", "Turtle spotting in the Andriake stream"],
      fr: ["Pagaie au-dessus de la Cité engloutie de Kekova", "Baignade & snorkeling à la baie de Tersane", "Cité antique d'Aperlai & la Voie lycienne", "Repas maison chez un pêcheur", "Observation des tortues dans le ruisseau d'Andriake"],
      ru: ["Гребля над Затонувшим городом Кекова", "Купание и снорклинг в бухте Терсане", "Древний город Аперлаи и Ликийская тропа", "Домашняя еда в доме рыбака", "Наблюдение за черепахами в ручье Андриаке"],
    },
    multiDay: {
      durationDays: 2,
      nights: 1,
      status: "draft",
      dayByDay: KEKOVA_SOUND_DAYS,
    },
  },
  {
    slug: "carian-shore",
    level: "intermediate-advanced",
    heroImage: "/images/tours/carian-shore.jpg",
    gallery: [],
    title: {
      tr: "Karia Kıyısı — 1 Hafta",
      en: "Carian Shore — 1 Week",
      fr: "Côte Carienne — 1 Semaine",
      ru: "Карийский берег — 1 неделя",
    },
    tagline: {
      tr: "Antik Karia'nın en etkileyici kıyılarında bir hafta süren kayak keşfi.",
      en: "A week-long kayaking expedition along the most charismatic shores of ancient Caria.",
      fr: "Une expédition kayak d'une semaine le long des rives les plus charismatiques de l'antique Carie.",
      ru: "Недельная каякинг-экспедиция вдоль самых выразительных берегов древней Карии.",
    },
    description: {
      tr: "Tarih, doğa ve maceranın buluştuğu antik Karia kıyılarında nefes kesen bir deniz kayağı yolculuğu. Akdeniz ve Ege'nin el değmemiş sularında saklı koyları, doğal limanları ve Knidos antik kenti gibi tarihi yerleri keşfedin. Datça ve Bozburun'un şirin Ege kasabalarında konaklayın ve geleneksel Ege mutfağının tadını çıkarın. (Bu rota taslak aşamasındadır — ayrıntılı günlük program yakında eklenecektir.)",
      en: "A breathtaking sea kayaking journey through the most charismatic shores of ancient Caria, where history, nature and adventure converge. Explore hidden coves, natural harbors and historical sites such as the ancient city of Knidos across the pristine waters of the Mediterranean and Aegean. Unwind in the picturesque Aegean towns of Datça and Bozburun and enjoy traditional Aegean cuisine. (This route is in draft — a detailed day-by-day itinerary is coming soon.)",
      fr: "Un voyage à couper le souffle en kayak de mer le long des rives les plus charismatiques de l'antique Carie, où histoire, nature et aventure se rejoignent. Explorez criques cachées, ports naturels et sites historiques comme l'antique Cnide, sur les eaux préservées de la Méditerranée et de l'Égée. Détendez-vous dans les villes pittoresques de Datça et Bozburun et savourez la cuisine égéenne. (Itinéraire en cours — programme détaillé bientôt disponible.)",
      ru: "Захватывающее путешествие на морском каяке вдоль самых выразительных берегов древней Карии, где сходятся история, природа и приключение. Исследуйте скрытые бухты, природные гавани и исторические места, такие как древний город Книд, в нетронутых водах Средиземного и Эгейского морей. Отдохните в живописных эгейских городках Датча и Бозбурун и насладитесь традиционной эгейской кухней. (Маршрут в стадии черновика — подробная программа по дням скоро появится.)",
    },
    highlights: {
      tr: ["Antik Knidos kenti", "Akdeniz ve Ege'nin el değmemiş suları", "Saklı koylar ve doğal limanlar", "Osmanlı kaleleri", "Datça ve Bozburun'da konaklama", "Geleneksel Ege mutfağı"],
      en: ["The ancient city of Knidos", "Pristine Mediterranean & Aegean waters", "Hidden coves and natural harbors", "Well-preserved Ottoman castles", "Stays in Datça and Bozburun", "Traditional Aegean cuisine"],
      fr: ["La cité antique de Cnide", "Eaux préservées de la Méditerranée & de l'Égée", "Criques cachées et ports naturels", "Châteaux ottomans bien conservés", "Séjours à Datça et Bozburun", "Cuisine égéenne traditionnelle"],
      ru: ["Древний город Книд", "Нетронутые воды Средиземного и Эгейского морей", "Скрытые бухты и природные гавани", "Хорошо сохранившиеся османские крепости", "Проживание в Датче и Бозбуруне", "Традиционная эгейская кухня"],
    },
    multiDay: {
      durationDays: 7,
      nights: 6,
      status: "draft",
      // No dayByDay yet — detail page shows "itinerary coming soon".
    },
  },
  {
    slug: "trak-signature",
    level: "beginner",
    heroImage: "/images/tours/trak-signature.jpg",
    gallery: [],
    title: {
      tr: "TRAK Signature Deneyimi",
      en: "TRAK Signature Experience",
      fr: "Expérience TRAK Signature",
      ru: "TRAK Signature Experience",
    },
    tagline: {
      tr: "Birebir özel seans — TRAK katlanır kayağı derinlemesine öğrenin.",
      en: "A private one-on-one session to learn the TRAK folding kayak in depth.",
      fr: "Une session privée en tête-à-tête pour découvrir en profondeur le kayak pliant TRAK.",
      ru: "Частная индивидуальная сессия для глубокого знакомства со складным каяком TRAK.",
    },
    description: {
      tr: "Bu bir tur değil — öğretmek, ilham vermek ve berrak Akdeniz sularını keşfetmek için tasarlanmış premium taşınabilir kayak deneyimi. Bu benzersiz iskelet-üzeri-deri kayak sistemini derinlemesine anlamanız için oluşturulmuş, birebir özel bir seans. Rehberimiz Osi, TRAK Kayaks pilotu olarak bu deneyimi yönetir.",
      en: "This is not a tour — it's a premium portable-kayak experience designed to teach, inspire and explore the crystal-clear Mediterranean. A private one-on-one session created to give you a deep understanding of this unique skin-on-frame kayak system. Led by our guide Osi as a TRAK Kayaks pilot.",
      fr: "Ce n'est pas un tour — c'est une expérience premium de kayak portable conçue pour enseigner, inspirer et explorer la Méditerranée cristalline. Une session privée en tête-à-tête pour comprendre en profondeur ce système unique de kayak peau-sur-cadre. Animée par notre guide Osi, pilote TRAK Kayaks.",
      ru: "Это не тур — это премиальный опыт с портативным каяком, созданный чтобы учить, вдохновлять и исследовать кристальное Средиземное море. Частная индивидуальная сессия для глубокого понимания уникальной системы каяка «кожа на каркасе». Проводит наш гид Оси, пилот TRAK Kayaks.",
    },
    highlights: TRAK_HIGHLIGHTS,
    included: TRAK_INCLUDED,
    multiDay: {
      durationDays: 1,
      nights: 0,
      status: "special",
      externalDetailPath: "trak",
    },
  },
];
