/* =====================================================================
   Everything the site says lives in this file.

   Anything wrapped in draft(...) is a placeholder that still needs real
   information: replace  draft("[year]")  with  "2011"  and it stops being
   highlighted. Numbers use { value, draft: true } — delete `draft: true`
   once the number is real.

   Before launch: fill in every draft and set `draftMode` to false.
   ===================================================================== */

export type Draft = { readonly __draft: true; readonly value: string };
/** Marks a placeholder that still needs real information. */
export const draft = (value: string): Draft => ({ __draft: true, value });
export type Text = string | Draft;
/** A sentence assembled from plain text and placeholders. */
export type Rich = readonly Text[];
export type Num = { value: number; draft?: boolean };

export const site = {
  /** Highlights every placeholder and shows the draft counter. Set to false before launch. */
  draftMode: true,

  name: "Fatima tuz Zahra",
  nameArabic: "فاطمة الزهراء",
  kind: "Orphanage",
  tagline: "A home, a family and a future for children who have lost theirs.",
  founded: draft("[year]"),
};

/*
  Tax status — hidden until registration is complete.
  Leave `ein` empty for now. Once the IRS determination letter arrives, put the
  EIN here and the EIN plus the tax-deductible wording appear across the site
  (donate panel, footer, FAQ) automatically.
*/
export const taxExempt = {
  ein: "",
  note: "Fatima tuz Zahra is a 501(c)(3) nonprofit. Donations are tax-deductible to the extent allowed by law.",
};
export const isTaxExempt = taxExempt.ein.trim() !== "";

export const links = {
  /** Your online donation page (Givebutter, Donorbox, Zeffy, PayPal…). */
  donate: draft("https://"),
  /** Shown under the donate button, e.g. "Secure checkout by Givebutter". */
  donatePlatform: draft("Secure checkout by [platform]"),
  amazonWishlist: draft("https://"),
  fundraiser: draft("https://"),
  instagram: draft("https://instagram.com/"),
  facebook: draft("https://facebook.com/"),
  youtube: draft("https://youtube.com/"),
};

export const forms = {
  /** Formspree / Basin / Getform endpoint. Empty = open the visitor's email app instead. */
  contactEndpoint: "",
  /** Mailchimp / Buttondown / ConvertKit form endpoint. Empty = newsletter form is hidden. */
  newsletterEndpoint: "",
};

export const contact = {
  email: draft("info@example.org"),
  phone: draft("(000) 000-0000"),
  address: draft("[Street, city, state, ZIP]"),
  hours: draft("[e.g. Mon–Sat, 10am–5pm]"),
  /** Google Maps → Share → Embed a map → copy only the src="…" URL. */
  mapEmbed: "",
};

export const bank = {
  accountName: draft("Fatima tuz Zahra Inc."),
  bankName: draft("[Bank name]"),
  routing: draft("000000000"),
  account: draft("000000000000"),
  zelle: draft("donate@example.org"),
  checkPayableTo: "Fatima tuz Zahra",
};

export const nav = [
  { id: "about", label: "About" },
  { id: "day", label: "Daily life" },
  { id: "give", label: "Give" },
  { id: "involved", label: "Get involved" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

export const hero = {
  eyebrow: ["Caring for children since ", site.founded] as Rich,
  title: "A home, a family, and a future for",
  /** Painted with the animated gradient. */
  titleAccent: "every child.",
  lead: "We care for orphaned and vulnerable children with everything a family gives: a safe place to sleep, warm meals, school every morning, and adults who stay.",
  assurances: ["Zakat eligible", "Sadaqah & Lillah", "Monthly sponsorship"],
  cards: ["A safe home, every night", "School every morning"],
};

export const stats: { n: Num; suffix?: string; label: string }[] = [
  { n: { value: 40, draft: true }, label: "children in our care" },
  { n: { value: 10, draft: true }, label: "years serving our community" },
  { n: { value: 100, draft: true }, suffix: "%", label: "of school-age children enrolled" },
  { n: { value: 43800, draft: true }, label: "meals served each year" },
];

export const marquee = ["Safety", "Education", "Faith", "Belonging", "Hope", "Family", "Dignity", "Mercy"];

export const story = {
  eyebrow: "Our story",
  title: "Named for a woman remembered for her mercy",
  paragraphs: [
    [
      "Fatima tuz Zahra Orphanage opened its doors in ",
      site.founded,
      " in ",
      draft("[city]"),
      " with a simple promise: no child in our community should grow up without a home. ",
      draft("[One or two sentences on who founded it and why.]"),
    ],
    [
      "Our name honors Sayyida Fatima al-Zahra, daughter of the Prophet Muhammad ﷺ, remembered across generations for her generosity to the poor and the orphan. We raise our children in that same spirit — with dignity, warmth and faith.",
    ],
  ] as Rich[],
  values: [
    { title: "Safety", body: "A secure home with caring adults present day and night." },
    { title: "Education", body: "School, tutoring and books — the surest road to independence." },
    { title: "Faith & character", body: "Prayer, Quran and good manners woven into everyday life." },
    { title: "Belonging", body: "Brothers and sisters, celebrations and traditions — a real family." },
  ],
  badge: "A home for every child · Fatima tuz Zahra · ",
};

/** Scroll-highlighted statement. Words in `accent` are painted gold. */
export const statement = {
  text: "Every child who walks through our door finds a bed, a warm meal, a school to go to — and people who stay.",
  accent: ["bed,", "meal,", "school", "stay."],
};

export const care = {
  eyebrow: "What we provide",
  title: "Everything a child needs to grow up well",
  lead: "Your support doesn't just keep the lights on. It covers the whole of a child's life with us.",
  items: [
    { icon: "home", title: "A safe home", body: "Clean rooms, warm bedding and caregivers on hand around the clock." },
    { icon: "school", title: "Education", body: "Every child goes to school, with homework help and tutoring each afternoon." },
    { icon: "health", title: "Health & nutrition", body: "Three nourishing meals a day, regular check-ups and medical care when needed." },
    { icon: "book", title: "Faith & character", body: "Quran lessons, daily prayer and the everyday manners that build good character." },
    { icon: "ball", title: "Play & wellbeing", body: "Sports, games, art and outings — time to simply be a child." },
    { icon: "tools", title: "Skills for life", body: "Vocational training and guidance so older children leave ready to stand on their own." },
  ],
} as const;

export const day = {
  eyebrow: "Daily life",
  title: "A day at Fatima tuz Zahra",
  lead: "Routine gives children security. Scroll through an ordinary day.",
  steps: [
    { time: "Dawn", title: "Fajr & breakfast", body: "Morning prayer, breakfast together, and off to school in clean uniforms." },
    { time: "Midday", title: "School & lunch", body: "A full school day, then home for a hot lunch and a short rest." },
    { time: "Afternoon", title: "Homework & Quran", body: "Homework club with tutors, followed by Quran class." },
    { time: "Late afternoon", title: "Play", body: "Cricket, soccer, games and free time outdoors." },
    { time: "Evening", title: "Dinner as a family", body: "Maghrib, then dinner around one table and time to talk about the day." },
    { time: "Night", title: "Rest", body: "Isha, a bedtime story, and lights out — with a caregiver close by." },
  ],
};

export const verse = {
  arabic: "وَيُطْعِمُونَ ٱلطَّعَامَ عَلَىٰ حُبِّهِۦ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا",
  translation: "They give food, though they love it themselves, to the poor, the orphan and the captive.",
  reference: "Surah al-Insan 76:8 — a verse traditionally linked to the household of Fatima al-Zahra.",
};

export const sponsorship = {
  eyebrow: "Sponsor a child",
  title: "One child. One sponsor. Every month.",
  monthly: { value: 250, draft: true } as Num,
  steps: [
    { title: "Choose your monthly gift", body: "Sponsorship covers one child's food, schooling and care, month after month." },
    { title: "We match you with a child", body: "You'll be paired with a child in our care. To protect their privacy, profiles are never published online." },
    { title: "Watch them grow", body: "Receive updates through the year — school progress, milestones and notes from the home." },
  ],
};

export type Designation = "General" | "Zakat" | "Sadaqah" | "Lillah" | "Sponsorship";

export const give = {
  eyebrow: "Give",
  title: "Your gift becomes a childhood",
  lead: "Give once or every month. Choose where it goes — and see what it makes possible.",
  presets: [25, 100, 500],
  defaultAmount: 100,
  designations: ["General", "Zakat", "Sadaqah", "Lillah", "Sponsorship"] as Designation[],
  /** What a gift of at least `min` dollars provides. Replace with your real costs. */
  impact: [
    { min: 0, text: draft("helps cover the everyday costs of caring for our children") },
    { min: 25, text: draft("buys school supplies for one child for a term") },
    { min: 50, text: draft("provides a month of nutritious meals for one child") },
    { min: 100, text: draft("covers a child's school fees for a month") },
    { min: 250, text: draft("provides full monthly care for one child") },
    { min: 500, text: draft("buys winter clothing and bedding for ten children") },
  ],
  trust: [
    { icon: "lock", text: "Secure, encrypted checkout" },
    { icon: "receipt", text: "Instant email receipt" },
    { icon: "heart", text: "Zakat directed to eligible children" },
  ],
};

export const involved = {
  eyebrow: "Get involved",
  title: "More ways to stand with our children",
  lead: "Every kind of help matters — time, skills, supplies, or simply telling a friend.",
  wishlist: ["School bags & stationery", "Winter coats", "Shoes", "Rice, flour & lentils", "Books", "Bedding", "Hygiene kits"],
  cards: [
    { key: "volunteer", title: "Volunteer", body: "Teach a class, coach a sport or share a skill. All volunteers go through a background check before working with children.", cta: "Offer your time", href: "#contact" },
    { key: "meal", title: "Sponsor a meal", body: "Mark a birthday, an Eid, or the memory of a loved one by providing a meal for all of our children.", cta: "Book a meal day", href: "#contact" },
    { key: "fundraise", title: "Start a fundraiser", body: "Turn a birthday, Ramadan challenge or a 5K into support for our children.", cta: "Start fundraising", href: "fundraiser" },
    { key: "match", title: "Double your gift", body: "Many US employers match charitable donations. Ask your HR team — it can double your impact at no cost to you.", cta: "Ask us for a match letter", href: "#contact" },
  ],
};

export const faq = [
  {
    q: "Is my donation tax-deductible?",
    a: (isTaxExempt
      ? [taxExempt.note, " You'll receive an email receipt for your records. Our EIN is ", taxExempt.ein, "."]
      : [
          draft(
            "Our nonprofit registration isn't complete yet, so we can't confirm tax-deductibility at the moment. We'll update this page as soon as it is. Every gift still gets an email receipt.",
          ),
        ]) as Rich,
  },
  {
    q: "Can I give my Zakat to Fatima tuz Zahra?",
    a: [
      "Yes. Orphaned and needy children are among those eligible to receive Zakat. Choose “Zakat” when you give so it's directed accordingly. ",
      draft("[Describe how Zakat funds are handled, e.g. kept in a separate fund.]"),
    ] as Rich,
  },
  {
    q: "How much of my donation reaches the children?",
    a: [draft("[e.g. 90 cents of every dollar goes directly to the children's care, education and health.]")] as Rich,
  },
  {
    q: "Can I sponsor a specific child?",
    a: ["To protect our children's privacy, we don't publish profiles online. When you sponsor, we'll pair you with a child and send updates that never identify them publicly."] as Rich,
  },
  {
    q: "Can I visit the home?",
    a: ["Yes — visitors are welcome during visiting hours (", contact.hours, "). Please call ahead so we can show you around."] as Rich,
  },
  {
    q: "How do you keep the children safe?",
    a: ["Every staff member and volunteer goes through a background check, and we never share children's full names, photos or locations without consent."] as Rich,
  },
  {
    q: "Can I donate goods instead of money?",
    a: ["Absolutely. Our wish list shows what we need most right now, or contact us to arrange a drop-off."] as Rich,
  },
];

/** Plain-language privacy notice (opens from the footer). Have it reviewed before launch. */
export const privacy = {
  updated: draft("[date]"),
  sections: [
    {
      title: "What we collect",
      body: [draft("When you contact us or join our newsletter, we collect what you give us — your name, email, phone number (if provided) and your message — and use it only to reply to you or send the updates you asked for.")] as Rich,
    },
    {
      title: "Donations",
      body: [draft("Online donations are processed securely by our payment provider. We never see or store your full card details. We keep a record of each gift for receipts and our accounts.")] as Rich,
    },
    {
      title: "What we don't do",
      body: [draft("We don't sell, rent or trade your information. This website doesn't use advertising or tracking cookies.")] as Rich,
    },
    {
      title: "Children's privacy",
      body: ["We never publish the full names, faces, locations or personal stories of the children in our care without their guardian's consent."] as Rich,
    },
    {
      title: "Your choices",
      body: ["To see, correct or delete the information we hold about you, or to unsubscribe, email us at ", contact.email, "."] as Rich,
    },
  ],
};

export const footer = {
  privacy: "To protect our children's privacy, we never publish their full names, locations or personal stories without consent.",
};
