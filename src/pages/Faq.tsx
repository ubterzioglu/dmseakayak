import { useState } from "react";
import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { useLang } from "@/hooks/useLang";
import { ChevronDown } from "lucide-react";
import type { Locale } from "@/lib/site";

interface FaqItem {
  q: Record<Locale, string>;
  a: Record<Locale, string>;
}

const FAQS: FaqItem[] = [
  {
    q: {
      tr: "Deniz kayağı deneyimim olmasa da katılabilir miyim?",
      en: "Can I join if I have no sea kayaking experience?",
      fr: "Puis-je participer sans expérience en kayak de mer ?",
      ru: "Могу ли я участвовать без опыта морского каякинга?",
      de: "Kann ich mitmachen, wenn ich noch keine Erfahrung im Seekajakfahren habe?",
    },
    a: {
      tr: "Evet! Kekova Classic turu tamamen başlangıç dostudur. Suya girmeden önce kapsamlı bir kürek ve güvenlik brifingi yapıyoruz. Deneyimli rehberlerimiz tüm tur boyunca yanınızda.",
      en: "Yes! The Kekova Classic tour is fully beginner-friendly. We give a comprehensive paddling and safety briefing before you set off. Our experienced guides stay with you throughout the entire tour.",
      fr: "Oui ! L'excursion Kekova Classic est entièrement accessible aux débutants. Nous donnons un briefing complet sur la pagaie et la sécurité avant le départ. Nos guides expérimentés restent avec vous tout au long de l'excursion.",
      ru: "Да! Тур Кекова Классик полностью подходит для начинающих. Перед стартом мы проводим подробный инструктаж по гребле и безопасности. Наши опытные гиды сопровождают вас на протяжении всего тура.",
      de: "Ja! Die „Kekova Classic“-Tour ist absolut anfängerfreundlich. Bevor es losgeht, erhalten Sie von uns eine umfassende Einweisung in die Paddeltechnik und die Sicherheitsvorkehrungen. Unsere erfahrenen Guides begleiten Sie während der gesamten Tour.",
    },
  },
  {
    q: {
      tr: "Yüzme bilmek zorunlu mu?",
      en: "Do I need to know how to swim?",
      fr: "Est-il nécessaire de savoir nager ?",
      ru: "Нужно ли уметь плавать?",
      de: "Muss ich schwimmen können?",
    },
    a: {
      tr: "Yüzme bilmeniz gerekmez, ancak kendinizi suda rahat hissedebilmeniz önerilir. Tüm katılımcılara can yeleği verilir ve can yeleklerinizi tüm tur boyunca giymeniz zorunludur.",
      en: "You don't need to be a strong swimmer, but feeling comfortable in the water is recommended. All participants receive a life jacket and must wear it throughout the tour.",
      fr: "Vous n'avez pas besoin d'être un nageur confirmé, mais être à l'aise dans l'eau est recommandé. Tous les participants reçoivent un gilet de sauvetage et doivent le porter tout au long de l'excursion.",
      ru: "Быть уверенным пловцом не обязательно, но желательно чувствовать себя комфортно в воде. Все участники получают спасательный жилет и обязаны носить его на протяжении всего тура.",
      de: "Man muss kein guter Schwimmer sein, sollte sich aber im Wasser wohlfühlen. Alle Teilnehmer erhalten eine Schwimmweste und müssen diese während der gesamten Tour tragen.",
    },
  },
  {
    q: {
      tr: "Tura ne getirmeliyim?",
      en: "What should I bring on the tour?",
      fr: "Que dois-je apporter pour l'excursion ?",
      ru: "Что взять с собой на тур?",
      de: "Was sollte ich zur Tour mitbringen?",
    },
    a: {
      tr: "Güneş kremi, güneş gözlüğü, hafif uzun kollu giysi (güneş koruması için), şapka, spor sandalet veya su ayakkabısı, ıslak giysiler için yedek kıyafet ve su şişesi getirmenizi öneririz. Su geçirmez çantalar tarafımızca sağlanır.",
      en: "We recommend sunscreen, sunglasses, a light long-sleeved top for sun protection, a hat, sport sandals or water shoes, a change of clothes for after swimming, and a water bottle. Dry bags are provided by us.",
      fr: "Nous recommandons de la crème solaire, des lunettes de soleil, un haut léger à manches longues pour la protection solaire, un chapeau, des sandales de sport ou des chaussures aquatiques, des vêtements de rechange et une bouteille d'eau. Les sacs étanches sont fournis par nos soins.",
      ru: "Рекомендуем солнцезащитный крем, солнцезащитные очки, лёгкую кофту с длинным рукавом (защита от солнца), головной убор, спортивные сандалии или обувь для воды, сменную одежду после купания и бутылку воды. Гермомешки предоставляем мы.",
      de: "Wir empfehlen Sonnencreme, eine Sonnenbrille, ein leichtes, langärmeliges Oberteil zum Sonnenschutz, einen Hut, Sportsandalen oder Wasserschuhe, Wechselkleidung für nach dem Schwimmen sowie eine Trinkflasche. Wasserdichte Beutel stellen wir zur Verfügung.",
    },
  },
  {
    q: {
      tr: "Tura neler dahildir?",
      en: "What is included in the tour price?",
      fr: "Qu'est-ce qui est inclus dans le prix de l'excursion ?",
      ru: "Что входит в стоимость тура?",
      de: "Was ist im Reisepreis enthalten?",
    },
    a: {
      tr: "Tüm turlarda: lisanslı rehber, kayak ve tam ekipman (can yeleği, kask, su geçirmez çanta, kürek, şnorkel), Kaş'tan gidiş-dönüş transfer ve öğle yemeği (Classic & West'te restoran, East'te piknik kutusu) dahildir.",
      en: "All tours include: a licensed guide, kayak and full equipment (life jacket, helmet, dry bag, paddle, snorkel gear), return transfers from Kaş, and lunch (restaurant for Classic & West, picnic box for East).",
      fr: "Toutes les excursions comprennent : un guide agréé, le kayak et l'équipement complet (gilet de sauvetage, casque, sac étanche, pagaie, matériel de snorkeling), les transferts aller-retour depuis Kaş et le déjeuner (restaurant pour Classic & West, panier-repas pour East).",
      ru: "Все туры включают: лицензированного гида, каяк и полное снаряжение (спасжилет, шлем, гермомешок, весло, снаряжение для снорклинга), трансфер из Каша и обратно и обед (ресторан для Classic и West, ланч-бокс для East).",
      de: "Alle Touren beinhalten: einen staatlich geprüften Reiseleiter, ein Kajak und die komplette Ausrüstung (Schwimmweste, Helm, wasserdichter Rucksack, Paddel, Schnorchelausrüstung), den Hin- und Rücktransfer ab Kaş sowie ein Mittagessen (Restaurant bei den Touren „Classic“ und „West“, Picknickkorb bei der Tour „East“).",
    },
  },
  {
    q: {
      tr: "Buluşma noktası neresi?",
      en: "Where is the meeting point?",
      fr: "Quel est le point de rendez-vous ?",
      ru: "Где находится место встречи?",
      de: "Wo ist der Treffpunkt?",
    },
    a: {
      tr: "Buluşma noktası Kaş Kral Mezarı (Kaş merkezinde, otoparklara yakın). Sabah 07:30'da buluşuyoruz. Kaş Yarımadası'ndaki oteller için transfer ayarlanabilir; ek ücret yoktur. Kalkan'dan transfer de mevcut (+€10).",
      en: "The meeting point is the Kaş King's Tomb in the town centre (close to the car parks). We meet at 07:30. Transfers can be arranged from hotels on the Kaş Peninsula at no extra cost. Kalkan transfers are also available (+€10).",
      fr: "Le point de rendez-vous est le tombeau du roi de Kaş, au centre-ville (près des parkings). Nous nous retrouvons à 07h30. Des transferts peuvent être organisés depuis les hôtels de la péninsule de Kaş sans frais supplémentaires. Les transferts depuis Kalkan sont également disponibles (+10 €).",
      ru: "Место встречи — Царская гробница Каша в центре города (рядом с парковками). Встречаемся в 07:30. Для отелей на полуострове Каш возможен бесплатный трансфер. Трансфер из Калкана также доступен (+10 €).",
      de: "Treffpunkt ist das Königsgrab von Kaş im Stadtzentrum (in der Nähe der Parkplätze). Wir treffen uns um 07:30 Uhr. Ein Transfer von den Hotels auf der Halbinsel Kaş kann ohne Aufpreis organisiert werden. Ein Transfer von Kalkan ist ebenfalls möglich (+10 €).",
    },
  },
  {
    q: {
      tr: "Hava koşulları kötüyse tur iptal olur mu?",
      en: "What happens if the weather is bad?",
      fr: "Que se passe-t-il en cas de mauvais temps ?",
      ru: "Что будет, если погода испортится?",
      de: "Was passiert, wenn das Wetter schlecht ist?",
    },
    a: {
      tr: "Misafirlerimizin güvenliği her şeyden önce gelir. Deniz koşullarının tura uygun olmadığını düşündüğümüzde turu erteleriz veya iptal ederiz ve tam ücret iadesi yaparız. Kaş bölgesinde yıl boyunca güneşli hava hâkimdir; iptal oldukça nadirdir.",
      en: "Guest safety is our top priority. If we judge that sea conditions are unsuitable for the tour, we will reschedule or cancel and issue a full refund. The Kaş region enjoys excellent weather throughout the year — cancellations are very rare.",
      fr: "La sécurité de nos clients est notre priorité absolue. Si nous jugeons que les conditions en mer ne sont pas adaptées à l'excursion, nous la reprogrammons ou l'annulons avec un remboursement intégral. La région de Kaş bénéficie d'un temps excellent tout au long de l'année — les annulations sont très rares.",
      ru: "Безопасность гостей — наш главный приоритет. Если мы сочтём морские условия неподходящими для тура, мы перенесём или отменим его с полным возвратом средств. В регионе Каш отличная погода круглый год — отмены крайне редки.",
      de: "Die Sicherheit unserer Gäste hat für uns oberste Priorität. Sollten wir zu dem Schluss kommen, dass die Seebedingungen für die Tour ungeeignet sind, werden wir einen neuen Termin vereinbaren oder die Tour absagen und den gesamten Betrag zurückerstatten. Die Region Kaş erfreut sich das ganze Jahr über hervorragender Wetterbedingungen – Absagen sind daher sehr selten.",
    },
  },
  {
    q: {
      tr: "Çocuklar katılabilir mi? Yaş sınırı var mı?",
      en: "Can children join? Is there an age limit?",
      fr: "Les enfants peuvent-ils participer ? Y a-t-il une limite d'âge ?",
      ru: "Могут ли участвовать дети? Есть ли возрастное ограничение?",
      de: "Können Kinder mitmachen? Gibt es eine Altersgrenze?",
    },
    a: {
      tr: "Kekova Classic turuna 6 yaş ve üzeri çocuklar ebeveynleriyle birlikte katılabilir. Kekova West ve East turları orta/ileri seviye rotalar olduğu için 12 yaş ve üzeri önerilir. Tüm çocuklara uygun boyutta can yeleği sağlanır.",
      en: "Children aged 6 and above can join the Kekova Classic tour with their parents. The Kekova West and East tours are intermediate/advanced routes and are recommended for ages 12 and above. Correctly sized life jackets are provided for all children.",
      fr: "Les enfants de 6 ans et plus peuvent participer à l'excursion Kekova Classic avec leurs parents. Les excursions Kekova West et East sont des itinéraires intermédiaires/avancés et sont recommandées aux 12 ans et plus. Des gilets de sauvetage adaptés sont fournis pour tous les enfants.",
      ru: "Дети от 6 лет могут участвовать в туре Кекова Классик вместе с родителями. Туры Кекова West и East — маршруты среднего/продвинутого уровня и рекомендуются для детей от 12 лет. Всем детям предоставляются спасжилеты подходящего размера.",
      de: "Kinder ab 6 Jahren können gemeinsam mit ihren Eltern an der „Kekova Classic“-Tour teilnehmen. Die Touren „Kekova West“ und „Kekova East“ sind Routen für Fortgeschrittene und werden für Kinder ab 12 Jahren empfohlen. Für alle Kinder werden Schwimmwesten in der passenden Größe bereitgestellt.",
    },
  },
  {
    q: {
      tr: "Vejetaryen veya vegan seçeneğiniz var mı?",
      en: "Do you cater for vegetarians or vegans?",
      fr: "Proposez-vous des options végétariennes ou véganes ?",
      ru: "Есть ли у вас вегетарианские или веганские варианты?",
      de: "Bieten Sie Gerichte für Vegetarier oder Veganer an?",
    },
    a: {
      tr: "Evet. Rezervasyon sırasında diyet tercihlerinizi belirtmenizi rica ederiz. Classic ve West turlarında restoran öğle yemeğinde vejetaryen ve vegan seçenekler mevcuttur. East turunda piknik kutusunu da diyet tercihlerinize göre hazırlıyoruz.",
      en: "Yes. Please let us know your dietary requirements at the time of booking. Vegetarian and vegan options are available at the restaurant lunch on the Classic and West tours. For the East tour picnic box we can accommodate dietary preferences.",
      fr: "Oui. Veuillez nous communiquer vos préférences alimentaires au moment de la réservation. Des options végétariennes et véganes sont disponibles au déjeuner au restaurant pour les excursions Classic et West. Pour le panier-repas de l'excursion East, nous pouvons adapter selon vos préférences alimentaires.",
      ru: "Да. Пожалуйста, сообщите о ваших пищевых предпочтениях при бронировании. На турах Classic и West в ресторанном обеде доступны вегетарианские и веганские варианты. Для ланч-бокса тура East мы также учитываем диетические предпочтения.",
      de: "Ja. Bitte teilen Sie uns Ihre Ernährungswünsche bereits bei der Buchung mit. Bei den Classic- und West-Touren stehen im Restaurant zum Mittagessen vegetarische und vegane Gerichte zur Auswahl. Bei der Picknickbox der East-Tour können wir auf Ihre Ernährungswünsche eingehen.",
    },
  },
  {
    q: {
      tr: "İptal politikanız nedir?",
      en: "What is your cancellation policy?",
      fr: "Quelle est votre politique d'annulation ?",
      ru: "Какова ваша политика отмены?",
      de: "Wie lauten Ihre Stornierungsbedingungen?",
    },
    a: {
      tr: "Tur tarihinden en az 48 saat önce yapılan iptallerde tam iade yapılır. 48 saatten az süre kala yapılan iptallerde ücretin %50'si iade edilir. Hava koşullarından kaynaklanan iptallerde tam iade yapılır.",
      en: "Cancellations made at least 48 hours before the tour date receive a full refund. Cancellations within 48 hours receive a 50% refund. Cancellations due to weather conditions receive a full refund.",
      fr: "Les annulations effectuées au moins 48 heures avant la date de l'excursion donnent lieu à un remboursement intégral. Les annulations dans les 48 heures donnent lieu à un remboursement de 50 %. Les annulations dues aux conditions météorologiques donnent lieu à un remboursement intégral.",
      ru: "При отмене не менее чем за 48 часов до даты тура возвращается полная стоимость. При отмене менее чем за 48 часов возвращается 50%. При отмене из-за погодных условий возвращается полная стоимость.",
      de: "Bei Stornierungen, die mindestens 48 Stunden vor dem Tourtermin erfolgen, wird der gesamte Betrag zurückerstattet. Bei Stornierungen innerhalb von 48 Stunden vor dem Tourtermin werden 50 % des Betrags zurückerstattet. Bei Stornierungen aufgrund von Wetterbedingungen wird der gesamte Betrag zurückerstattet.",
    },
  },
  {
    q: {
      tr: "Otelden veya havalimanından transfer sağlıyor musunuz?",
      en: "Do you offer hotel or airport transfers?",
      fr: "Proposez-vous des transferts depuis l'hôtel ou l'aéroport ?",
      ru: "Предоставляете ли вы трансфер из отеля или аэропорта?",
      de: "Bieten Sie Hotel- oder Flughafentransfers an?",
    },
    a: {
      tr: "Kaş merkezindeki oteller ve Kaş Yarımadası'ndaki konaklama yerleri için ücretsiz transfer sunuyoruz. Kalkan'dan transfer +€10 karşılığında mevcuttur. Havalimanı transferleri için lütfen önceden iletişime geçin.",
      en: "We offer complimentary transfers from hotels in central Kaş and the Kaş Peninsula. Transfers from Kalkan are available for an additional €10. For airport transfers, please contact us in advance.",
      fr: "Nous proposons des transferts gratuits depuis les hôtels du centre de Kaş et de la péninsule de Kaş. Les transferts depuis Kalkan sont disponibles pour 10 € supplémentaires. Pour les transferts aéroport, veuillez nous contacter à l'avance.",
      ru: "Мы предоставляем бесплатный трансфер из отелей в центре Каша и на полуострове Каш. Трансфер из Калкана доступен за доплату 10 €. Для трансфера из аэропорта, пожалуйста, свяжитесь с нами заранее.",
      de: "Wir bieten einen kostenlosen Transfer von Hotels im Zentrum von Kaş und auf der Halbinsel Kaş an. Transfers von Kalkan sind gegen einen Aufpreis von 10 € möglich. Für Flughafentransfers kontaktieren Sie uns bitte im Voraus.",
    },
  },
];

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function AccordionItem({ question, answer, isOpen, onToggle, index }: AccordionItemProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-teal/10 bg-white shadow-[0_4px_16px_rgba(1,68,57,0.06)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-teal-deep transition-colors hover:bg-foam"
        aria-expanded={isOpen}
        id={`faq-btn-${index}`}
        aria-controls={`faq-panel-${index}`}
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-teal transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          id={`faq-panel-${index}`}
          role="region"
          aria-labelledby={`faq-btn-${index}`}
          className="px-6 pb-5 text-sm leading-relaxed text-teal/70"
        >
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  const { t, pick } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: pick(item.q),
      acceptedAnswer: {
        "@type": "Answer",
        text: pick(item.a),
      },
    })),
  };

  return (
    <>
      <Seo title={t("faq.title")} description={t("faq.subtitle")} jsonLd={jsonLd} />

      <Section>
        <SectionHeading
          eyebrow={t("faq.eyebrow")}
          title={t("faq.title")}
          subtitle={t("faq.subtitle")}
        />

        <div className="mt-2 max-w-3xl space-y-3">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              index={i}
              question={pick(item.q)}
              answer={pick(item.a)}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
