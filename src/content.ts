/* =====================================================================
   Everything the site says lives in this file.

   Anything wrapped in draft(...) is a placeholder that still needs real
   information: replace  draft("[year]")  with  "2011"  and it stops being
   highlighted. Numbers use { value, draft: true } — delete `draft: true`
   once the number is real.

   Before launch: fill in every draft and set `draftMode` to false.
   ===================================================================== */

import type { PhotoName } from "./assets/photos";

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
  note: "Fatima tuz Zahra is a 501(c)(3) nonprofit. Donations are tax deductible to the extent allowed by law.",
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

/*
  Passes the donor's choices (amount, monthly or one time, and where it goes)
  on to your donation page, so they don't have to choose again. Every platform
  names these differently: once you've picked one, look up how it pre-fills a
  gift from the link and set them here. For example:
    url.searchParams.set("amount", String(gift.amount));
    url.searchParams.set("frequency", gift.frequency === "monthly" ? "monthly" : "once");
  Zakat must reach a separate fund, so make sure the designation gets through
  (a parameter, or a separate campaign link per designation).
*/
export function donateUrl(base: string, gift: { amount: number; frequency: "monthly" | "once"; designation: Designation }) {
  const url = new URL(base);
  void gift; // not passed on yet; see above
  return url.toString();
}

/*
  Use the public form address each service gives you. Never paste an API key,
  secret or password into this file: everything here ends up in the public
  page, where anyone can read it.
*/
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
  hours: draft("[for example, Monday to Saturday, 10am to 5pm]"),
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
  assurances: ["Zakat eligible", "Sadaqah and Lillah", "Monthly sponsorship"],
  cards: ["A safe home, every night", "School every morning"],
};

export const stats: { n: Num; suffix?: string; label: string }[] = [
  { n: { value: 40, draft: true }, label: "children in our care" },
  { n: { value: 10, draft: true }, label: "years serving our community" },
  { n: { value: 100, draft: true }, suffix: "%", label: "of school age children enrolled" },
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
      "Our name honors Sayyida Fatima al Zahra, daughter of the Prophet Muhammad ﷺ, remembered across generations for her generosity to the poor and the orphan. We raise our children in that same spirit, with dignity, warmth and faith.",
    ],
  ] as Rich[],
  values: [
    { title: "Safety", body: "A secure home with caring adults present day and night." },
    { title: "Education", body: "School, tutoring and books are the surest road to independence." },
    { title: "Faith and character", body: "Prayer, Quran and good manners woven into everyday life." },
    { title: "Belonging", body: "Brothers and sisters, celebrations and traditions. A real family." },
  ],
  badge: "A home for every child   Fatima tuz Zahra   ",
  photo: { name: "snack-time", alt: "A group of smiling children sitting together at snack time", focus: "45% 50%" } satisfies Omit<GalleryPhoto, "caption">,
};

/** Scroll-highlighted statement. Words in `accent` are painted gold. */
export const statement = {
  text: "Every child who walks through our door finds a bed, a warm meal, a school to go to, and people who stay.",
  accent: ["bed,", "meal,", "school", "stay."],
};

export const care = {
  eyebrow: "What we provide",
  title: "Everything a child needs to grow up well",
  lead: "Your support doesn't just keep the lights on. It covers the whole of a child's life with us.",
  items: [
    {
      icon: "home",
      title: "A safe home",
      body: "Clean rooms, warm bedding and caregivers on hand around the clock.",
      photo: { name: "care-home", alt: "Children sitting together on a rug at home", focus: "45% 50%" },
    },
    {
      icon: "school",
      title: "Education",
      body: "Every child goes to school, with homework help and tutoring each afternoon.",
      photo: { name: "care-education", alt: "A boy reading his textbook at a desk", focus: "26% 50%" },
    },
    {
      icon: "health",
      title: "Health and nutrition",
      body: "Three nourishing meals a day, regular checkups and medical care when needed.",
      photo: { name: "care-meals", alt: "Children eating a meal with fruit at a long table", focus: "35% 50%" },
    },
    {
      icon: "book",
      title: "Faith and character",
      body: "Quran lessons, daily prayer and the everyday manners that build good character.",
      photo: { name: "care-faith", alt: "Two boys in prayer caps reading the Quran", focus: "60% 50%" },
    },
    {
      icon: "ball",
      title: "Play and wellbeing",
      body: "Sports, games, art and outings. Time to simply be a child.",
      photo: { name: "care-play", alt: "Boys running and playing football on a grassy field", focus: "50% 50%" },
    },
    {
      icon: "tools",
      title: "Skills for life",
      body: "Vocational training and guidance so older children leave ready to stand on their own.",
      photo: { name: "care-skills", alt: "A boy working at a computer", focus: "79% 50%" },
    },
  ],
} as const;

export const day = {
  eyebrow: "Daily life",
  title: "A day at Fatima tuz Zahra",
  lead: "Routine gives children security. Scroll through an ordinary day.",
  steps: [
    { time: "Dawn", title: "Fajr and breakfast", body: "Morning prayer, breakfast together, and off to school in clean uniforms." },
    { time: "Midday", title: "School and lunch", body: "A full school day, then home for a hot lunch and a short rest." },
    { time: "Afternoon", title: "Homework and Quran", body: "Homework club with tutors, followed by Quran class." },
    { time: "Late afternoon", title: "Play", body: "Cricket, soccer, games and free time outdoors." },
    { time: "Evening", title: "Dinner as a family", body: "Maghrib, then dinner around one table and time to talk about the day." },
    { time: "Night", title: "Rest", body: "Isha, a bedtime story, and lights out, with a caregiver close by." },
  ],
};

/*
  Photos. The picture files are made by  ./dev.sh photos  from the originals in
  the photos/ folder; `name` is the original's file name without its extension.
  `alt` describes the picture for people who use screen readers. `caption` is the
  short line shown with it. `focus` (optional) is the part to keep in view when a
  photo is cropped to fit its tile, as "left% top%".
*/
export type GalleryPhoto = { name: PhotoName; alt: string; caption: string; focus?: string };

export const gallery = {
  eyebrow: "Gallery",
  title: "Moments from our home",
  lead: "School runs, mealtimes, prayer and play. Everyday life at Fatima tuz Zahra.",
  /** The first eight fill the grid on the page. "See all" opens every one of them, ending with our opening day. */
  photos: [
    { name: "laughing", caption: "Laughter is never far away", alt: "A boy laughing with his friends", focus: "35% 50%" },
    { name: "off-to-school", caption: "Off to school", alt: "A boy in school uniform heading out the door with his backpack", focus: "57% 50%" },
    { name: "mealtime-smile", caption: "Mealtimes together", alt: "A boy smiling at the table during a meal", focus: "85% 40%" },
    { name: "craft-class", caption: "Craft time", alt: "A teacher helping children with a craft project", focus: "50% 40%" },
    { name: "prayer", caption: "Prayer together", alt: "Boys in prayer caps standing side by side in prayer", focus: "57% 50%" },
    { name: "movie-time", caption: "Watching together", alt: "Children gathered around a laptop watching something together", focus: "70% 50%" },
    { name: "homework", caption: "Homework club", alt: "Boys doing their homework together at a table", focus: "45% 50%" },
    { name: "my-family", caption: "Made with love", alt: "A cardboard house and paper crafts the children made, with a sign reading My family", focus: "70% 50%" },
    { name: "chess", caption: "A game of chess", alt: "Children playing chess and other games on a play mat" },
    { name: "quran-class", caption: "Quran class", alt: "Children sitting on the carpet reading the Quran with their teacher" },
    { name: "lunch", caption: "Lunch is served", alt: "A caregiver serving lunch to the boys at a long table" },
    { name: "ready-for-school", caption: "Ready for school", alt: "Boys in school uniforms with backpacks walking in a line" },
    { name: "stairs", caption: "Down the stairs", alt: "Boys with backpacks heading down the stairs, seen from above" },
    { name: "study-room", caption: "Quiet study time", alt: "Boys studying at desks with a tutor" },
    { name: "drawing", caption: "Drawing", alt: "A boy drawing with a pink pen" },
    { name: "snack-time", caption: "Snack time", alt: "A group of children sitting together with snacks, smiling" },
    { name: "school-bags", caption: "Which bag is mine", alt: "A little boy reaching up for his school bag on the shelf" },
    { name: "all-smiles", caption: "All smiles", alt: "Boys sitting together, smiling" },
    { name: "open-field", caption: "Room to run", alt: "Children playing on a wide green field" },
    { name: "prayer-line", caption: "Lining up for prayer", alt: "Boys in prayer caps standing in a row" },
    { name: "little-ones", caption: "The little ones", alt: "Young children at a table with a caregiver" },
    { name: "activity-time", caption: "Activity time", alt: "Boys working on an activity together on the play mat" },
    { name: "listening", caption: "Listening closely", alt: "Boys sitting together listening, one of them smiling" },
    { name: "thinking", caption: "Deep in thought", alt: "A boy at a desk looking up from his work" },
    { name: "evening-table", caption: "Evening together", alt: "Boys in matching white shirts sitting around a long table in the evening sun" },
    { name: "ribbon-cutting", caption: "Cutting the ribbon", alt: "Two elders applauding as the ribbon is cut at the entrance", focus: "50% 20%" },
    { name: "talk-elder", caption: "A few words for our guests", alt: "An elder speaks to guests from the podium, beside the Fatima tuz Zahra banner", focus: "35% 40%" },
    { name: "meal-gift", caption: "A treat for every child", alt: "A guest hands a meal box to one of the children", focus: "60% 50%" },
    { name: "talk-podium", caption: "What sponsorship means", alt: "A speaker talks about orphan sponsorship, with our calligraphy logo projected behind him", focus: "60% 40%" },
    { name: "welcome-gate", caption: "Welcoming our guests", alt: "Guests shaking hands at the front gate in the evening light" },
    { name: "meal-boxes", caption: "Treats all round", alt: "Children sitting in a row, each holding a red meal box", focus: "50% 45%" },
    { name: "computer-class", caption: "Learning computer skills", alt: "Two boys sitting at the computers, with our logo on the screens", focus: "50% 40%" },
    { name: "computer-room", caption: "Our computer room", alt: "A row of computers in the computer room, each screen showing our logo" },
    { name: "three-boys", caption: "Front row seats", alt: "Three boys in matching white shirts sitting side by side" },
    { name: "meal-handout", caption: "Handing out treats", alt: "A young volunteer hands out meal boxes to the children" },
    { name: "guests-roses", caption: "A rose for every guest", alt: "Guests reading the event booklet, each holding a red rose" },
    { name: "guests-stairs", caption: "Families and friends", alt: "Families and friends gathered on the staircase" },
    { name: "standing-together", caption: "Standing together", alt: "Two boys in matching white shirts standing beside an elder" },
    { name: "guests-standing", caption: "Our guests", alt: "Guests standing together during the program" },
    { name: "talk-guest", caption: "Speaking to our guests", alt: "A woman speaks at the podium beside the Orphanage and Old House banner" },
    { name: "computer-screen", caption: "Ready for class", alt: "A computer screen showing our calligraphy logo" },
    { name: "guest-portrait", caption: "One of our guests", alt: "A guest at the event" },
  ] as GalleryPhoto[],
};

export const verse = {
  arabic: "وَيُطْعِمُونَ ٱلطَّعَامَ عَلَىٰ حُبِّهِۦ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا",
  translation: "They give food, though they love it themselves, to the poor, the orphan and the captive.",
  reference: "Surah Al Insan 76:8. A verse traditionally linked to the household of Fatima al Zahra.",
};

/** Portraits shown just before Sponsor a child. Names are never shown. */
export const children = {
  eyebrow: "Our children",
  title: "Every one of them deserves a childhood",
  lead: "Curious, funny and full of plans. These are some of the children who call Fatima tuz Zahra home.",
  note: "Shared with their guardians' permission. We never publish the children's names.",
  faces: [
    { name: "face-1", alt: "A smiling boy in a grey shirt" },
    { name: "face-2", alt: "A boy with a big grin in a grey shirt" },
    { name: "face-3", alt: "A smiling boy in a light grey shirt" },
    { name: "face-4", alt: "A smiling boy in a turquoise shirt" },
    { name: "face-5", alt: "A boy with a quiet smile in a white shirt" },
    { name: "face-6", alt: "A boy laughing in a white shirt" },
    { name: "face-7", alt: "A smiling boy in a white shirt" },
    { name: "face-8", alt: "A smiling boy in a red shirt" },
  ] as { name: PhotoName; alt: string }[],
};

export const sponsorship = {
  eyebrow: "Sponsor a child",
  title: "One child. One sponsor. Every month.",
  monthly: { value: 250, draft: true } as Num,
  steps: [
    { title: "Choose your monthly gift", body: "Sponsorship covers one child's food, schooling and care, month after month." },
    { title: "We match you with a child", body: "You'll be paired with a child in our care. To protect their privacy, profiles are never published online." },
    { title: "Watch them grow", body: "Receive updates through the year: school progress, milestones and notes from the home." },
  ],
};

export type Designation = "General" | "Zakat" | "Sadaqah" | "Lillah" | "Sponsorship";

export const give = {
  eyebrow: "Give",
  title: "Your gift becomes a childhood",
  lead: "Give once or every month. Choose where it goes and see what it makes possible.",
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
  ] as const,
};

export const involved = {
  eyebrow: "Get involved",
  title: "More ways to stand with our children",
  lead: "Every kind of help matters: your time, your skills, or simply telling a friend.",
  cards: [
    { key: "volunteer", title: "Volunteer", body: "Teach a class, coach a sport or share a skill. All volunteers go through a background check before working with children.", cta: "Offer your time", href: "#contact" },
    { key: "meal", title: "Sponsor a meal", body: "Mark a birthday, an Eid, or the memory of a loved one by providing a meal for all of our children.", cta: "Book a meal day", href: "#contact" },
    { key: "fundraise", title: "Start a fundraiser", body: "Turn a birthday, Ramadan challenge or a 5K into support for our children.", cta: "Start fundraising", href: "fundraiser" },
    // Employer matching programs only accept registered charities, so this card stays hidden until the EIN is set.
    { key: "match", title: "Double your gift", body: "Many US employers match charitable donations. Ask your HR team. It can double your impact at no cost to you.", cta: "Ask us for a match letter", href: "#contact", needsTaxExempt: true },
  ],
};

export const faq = [
  {
    q: "Is my donation tax deductible?",
    a: (isTaxExempt
      ? [taxExempt.note, " You'll receive an email receipt for your records. Our EIN is ", taxExempt.ein, "."]
      : [
          draft(
            "Our nonprofit registration isn't complete yet, so we can't confirm tax deductibility at the moment. We'll update this page as soon as it is. Every gift still gets an email receipt.",
          ),
        ]) as Rich,
  },
  {
    q: "Can I give my Zakat to Fatima tuz Zahra?",
    a: [
      "Yes. Orphaned and needy children are among those eligible to receive Zakat. Choose Zakat when you give so it goes to the right place. ",
      draft("[Describe how Zakat funds are handled, for example kept in a separate fund.]"),
    ] as Rich,
  },
  {
    q: "How much of my donation reaches the children?",
    a: ["All of it. 100% of your donation goes directly to the children, paying for their home, meals, schooling and health care."] as Rich,
  },
  {
    q: "Can I sponsor a specific child?",
    a: ["To protect our children's privacy, we don't publish profiles online. When you sponsor, we'll pair you with a child and send updates that never identify them publicly."] as Rich,
  },
  {
    q: "Can I visit the home?",
    a: ["Yes, visitors are welcome during visiting hours: ", contact.hours, ". Please call ahead so we can show you around."] as Rich,
  },
  {
    q: "How do you keep the children safe?",
    a: ["Every staff member and volunteer goes through a background check, and we never share children's full names, photos or locations without consent."] as Rich,
  },
];

/** Plain-language privacy notice (opens from the footer). Have it reviewed before launch. */
export const privacy = {
  updated: draft("[date]"),
  sections: [
    {
      title: "What we collect",
      body: [draft("When you contact us or join our newsletter, we collect what you give us: your name, email, phone number if you share it, and your message. We use it only to reply to you or send the updates you asked for.")] as Rich,
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
