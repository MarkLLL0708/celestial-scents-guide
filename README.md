# Celestial Scents Guide

PROJECT BRIEF
Build the user interface for "Natal Notes": a small perfume store with one signature feature. A visitor enters their birth date, time and place, sees a short chart (sun, moon, rising and element balance), and gets a ranked list of perfumes that suit it, each with a reason. Everything is UI only for now: no backend, no real astrology maths, no AI. Use mock data behind a data layer (see PART B) so real services can be swapped in later without touching any screen.

Stack: React, TypeScript, Tailwind, shadcn/ui (as accessible base, restyled), React Router. Mobile first. Test at 390px and 1440px wide.
Look: editorial, quiet, warm paper and ink, thin black rules, sharp corners, no shadows, no gradients, no emojis, no stock photos. Original assets only: use simple inline SVG placeholders for bottles and a small chart-wheel line drawing.
Languages: English and Vietnamese with a visible EN / VI toggle in the header. All text comes from translation files (src/i18n/en.ts and vi.ts). Never hard-code copy in components.

===== PART A: DESIGN SYSTEM + /design PAGE =====

A1. Tokens. Create src/styles/tokens.css and import it globally:
:root {
 --bg:#fbf8f3; --surface:#f1ebe2; --border:#1a1614; --border-input:#1a1614;
 --text:#1a1614; --text-muted:#5e554e; --accent:#6e2a4a; --on-accent:#ffffff; --accent-invert:#e3a7c2;
 --bg-invert:#1a1614; --text-invert:#fbf8f3; --text-invert-muted:#bdb3a8; --danger:#a3261e; --success:#1f6e46;
 --font-sans: Inter, system-ui, sans-serif;
 --font-mono: "IBM Plex Mono", ui-monospace, monospace;
 --font-serif: "Cormorant Garamond", "Be Vietnam Pro", Georgia, serif;
 --radius:0px; --content-max:480px; --page-pad:24px; --section-gap:48px;
 --motion-fast:150ms; --motion-base:200ms;
}
Load from Google Fonts: Inter 400/500, IBM Plex Mono 500, Cormorant Garamond 500 (latin + vietnamese subsets), Be Vietnam Pro 400/500 (fallback for Vietnamese serif text).
Extend the Tailwind theme so these colours exist as: bg, surface, border, border-input, text, muted, accent, on-accent, accent-invert, invert, on-invert, on-invert-muted, danger, success. Set every borderRadius to 0 and every boxShadow to none. Components may only use these tokens, never raw hex or arbitrary pixel values. Override the shadcn theme variables to match, including the focus ring (2px accent, 2px offset).

A2. Type classes (Tailwind utilities or CSS classes):
.label = IBM Plex Mono 11px/16px weight 500, UPPERCASE, letter-spacing 0.12em.
.question = Cormorant Garamond 32px/38px weight 500.
.xl = Cormorant Garamond 48px/52px. .display = Cormorant Garamond 96px/92px (use clamp so it never overflows at 390px).
Body = Inter 16px/26px. Small = Inter 14px/22px. Headlines are lowercase as written in the copy. Only .label is uppercase.

A3. Layout rules: pages are a single column, max 480px and centered, for the chart flow; the shop and admin use a wider container (max 1100px). Sections are separated by a 1px solid var(--border) rule with 48px spacing. Side padding 24px on mobile. Data is shown as plain text rows with thin rules, not cards.

A4. Components (src/components/ui/ and src/components/scent/). Build each with every state listed:
- Button: primary (ink background, paper label), secondary (paper background, 1px ink border), text (underlined). 52px tall, full width. States: default, hover (colours invert, 150ms), active, focus-visible, disabled, loading (label stays, "..." types out; aria-busy).
- UnderlineInput: bare input, 1px bottom rule, 2px on focus; real <label> is the question; error text below linked with aria-describedby. States: empty, focus, filled, error, disabled.
- DatePicker: three bare numeric fields (day, month, year). Errors: missing, impossible date (31 Feb), future date.
- TimePicker: hour and minute fields plus a checkbox "i don't know". When checked the fields disable and a muted note appears.
- CitySearch: combobox with up to 5 results, arrow keys and Enter, results announced to screen readers. States: empty, typing, results, no results, selected (city, country).
- ProgressLabel: "02 / 06" in .label style, aria-label "step 2 of 6".
- LoadingLine: white .label text on an ink background that types out three messages in turn every 2 seconds; shows static text when prefers-reduced-motion is set; aria-live polite.
- PlacementBadge: small .label above a large serif sign name with a thin line glyph. PlacementRow: label left, value right, expandable with a short explanation (button with aria-expanded).
- ElementBar: four horizontal bars (fire, earth, air, water), 1px ink outline, solid ink fill, role=meter with numeric value shown.
- ReadingBlock: .label heading plus paragraph. States: default, loading (thin grey rules, no spinner), error (message and a TRY AGAIN text button).
- ProductCard with 3 variants: "signature" (full width, ink background, accent-invert match percentage), "grid" (two columns on mobile, four on desktop), "shadow" (outlined, labelled SHADOW SCENT). Product image sits on white with a 1px border; name in Inter 20px; brand as .label; notes as three rows TOP / HEART / BASE with .label headings; match percentage in large serif using accent (accent-invert on dark). States: default, hover, in cart, sold out (label SOLD OUT, button disabled). The name is the link; ADD TO CART is a button; image has alt text; match is read as "match 92 percent".
- SectionHeader: .label with a 1px rule above.
- Toast: error (role=alert) and info (role=status); auto-dismiss after 5 seconds with a close button.
- Header: store name wordmark "Natal Notes" in Cormorant Garamond at the left (with a small logo: a thin ring with one filled dot at the top right, own SVG), nav links, EN/VI toggle, cart icon with count (Lucide icons only). On mobile the nav collapses into a menu button that opens a full-screen paper overlay. Footer: disclaimer text and language toggle.

A5. Build a hidden route /design that lists every component above in a column no wider than 480px, one labelled row per state (default, hover, focus, disabled, loading, error, empty), plus an inverted (ink) section at the bottom. Add an EN/VI toggle to check that Vietnamese diacritics render properly in the serif font.

===== PART B: APP SHELL, ROUTES, MOCK DATA LAYER, STORE SCREENS =====

B1. Routes (React Router). Every route is real even when the content is mock:
/ (landing) · /chart/new (6-step form, step stored in the URL as ?step=1..6) · /chart/loading · /chart/result/:id · /saved · /shop · /shop/:id · /cart · /login · /admin/perfumes · /design · * (404)

B2. Mock data layer: src/data/api.ts. Every function returns a Promise that resolves after about 600ms so loading states are visible. Keep these exact signatures so a real backend can replace them later:
 getPerfumes(filters?: {family?: string, style?: string, maxPrice?: number}): Promise<Perfume[]>
 getPerfume(id: string): Promise<Perfume | null>
 computeChart(profile: BirthProfile): Promise<Chart>
 getRecommendations(chart: Chart, prefs: Prefs): Promise<{signature: Match, others: Match[], shadow: Match}>
 getReading(chart: Chart, recs: Recs, lang: "en"|"vi"): Promise<{profileText: string, reasons: Record<string,string>}>
 saveChart(result: ChartResult): Promise<{id: string}>
 listSavedCharts(): Promise<ChartResult[]>
 cart: getCart(), addToCart(id), updateQty(id, n), removeFromCart(id)
 login(email): Promise<{ok: boolean}>
 importPerfumesCsv(file): Promise<{imported: number, errors: {row: number, message: string}[]}>
Every data-driven screen must also accept a query parameter ?state=loading, ?state=empty or ?state=error that forces that state, so I can preview each one.

B3. Types:
 Perfume {id, name, brand, price, currency, size_ml, scent_family, style ("feminine"|"masculine"|"unisex"), intensity (1-5), top_notes[], heart_notes[], base_notes[], mood_tags[], sold_out}
 BirthProfile {name, day, month, year, hour|null, minute|null, city, country}
 Chart {sun, moon, rising|null, venus, mars, mercury (sign names), elements {fire, earth, air, water} summing to 100}
 Prefs {avoid: string[], style: string, budget: "any"|"low"|"mid"|"high"}
 Match {perfume, score (0-100), reason (string)}

B4. Seed data. Create 12 fictional perfumes (made-up names, made-up brand "Atelier Sample", price 40 to 220 USD, sizes 50 or 100 ml) covering the families Citrus, Floral, Woody, Oriental, Fresh, Gourmand, Aromatic, Musk, Leather, Green. Each has notes and mood tags. Mark one as sold out. Seed a demo chart: sun Aquarius, moon Cancer, rising Libra, venus Pisces, mars Gemini, mercury Capricorn, elements fire 15, earth 20, air 40, water 25. getRecommendations returns a signature (score 94), four others (scores 88, 84, 79, 73) and a shadow (score 61), each with a one-sentence reason that names a placement, for example: "your moon in cancer likes what smells like home. this one is warm and soft." Use these reasons only as mock text.
Generate the placeholder bottle as an inline SVG in a plain line style, with different simple shapes per family. Do not use photos or logos.

B5. Store screens (all UI, with every state):
- /shop: header "shop"; filters (scent family chips, style chips, price max slider) in a collapsible panel on mobile and a left column on desktop; product grid. States: loading (skeleton cards made of thin rules), empty after filtering, error with TRY AGAIN, filled.
- /shop/:id: large image, name, brand, price, size, three note rows, mood tags, ADD TO CART. States: loading, not found, sold out, in cart, long name (60 characters) wraps cleanly.
- /cart: line items with quantity stepper, remove, subtotal, CHECKOUT button that shows an info toast "checkout is not connected yet." States: empty ("your cart is empty."), filled, loading.
- /login: a single email field and a LOG IN button (mock). Success goes to /saved. Error state shows the field error.
- /admin/perfumes: table of perfumes (name, brand, family, price, intensity, status) with sortable headers, an UPLOAD CSV button that opens a dialog (file picker, then a list of import errors by row, then IMPORT), an edit row button. States: empty ("no perfumes yet. upload a csv."), filled, importing, import errors.
- 404: "nothing here. the planets are fine."

===== PART C: THE NATAL NOTES FLOW (the main feature) =====

C1. / (landing): a hero with the headline as .xl serif and a subline, a full-width READ MY CHART button, then a "how it works" section with 3 numbered rows, then a short strip of three perfume cards (grid variant, from mock data), then the footer disclaimer.

C2. /chart/new: six steps, one question per screen, with a 200ms fade between steps. Top: ProgressLabel. Bottom: NEXT button (disabled until valid) and a BACK text button. The step is kept in the URL and the answers are kept in state so BACK never loses anything.
 Step 1 name · Step 2 birth date · Step 3 birth time (with "i don't know") · Step 4 birth city (CitySearch with mock cities: Hanoi, Ho Chi Minh City, Da Nang, Singapore, Shanghai, Hong Kong, Tokyo, Bangkok, London, New York) · Step 5 preferences (a text field "anything we should keep away from you", chips for style: feminine / masculine / unisex / no preference, chips for budget: any / low / mid / high) · Step 6 a quick review screen listing the answers as plain rows with an EDIT text link on each, and the final button SEE MY MATCHES.
 Validation: name required; date must exist and not be in the future; city required. Errors appear under the field in danger colour and are read by screen readers.

C3. /chart/loading: ink background, full screen, LoadingLine cycling three messages. After about 3 seconds go to /chart/result/demo. Under reduced motion, show static text.

C4. /chart/result/:id (the results page), in this order, separated by rules:
 1) Header block: the user's name in .label, then three PlacementBadges (sun, moon, rising). If rising is null show "—" and a muted note.
 2) YOUR CHART: PlacementRows for venus, mars and mercury, each expandable with one mock sentence.
 3) WHAT THIS MEANS FOR YOUR NOSE: ElementBar x4, the dominant scent family as a serif word, three keyword tags, and a ReadingBlock with a mock paragraph (about 60 words).
 4) YOUR SIGNATURE SCENT: ProductCard "signature" on an ink background with the match percentage, the reason, the notes rows and ADD TO CART.
 5) ALSO WRITTEN IN YOUR STARS: four ProductCards (grid variant) with match percentage and a one-line reason.
 6) YOUR SHADOW SCENT: one ProductCard (shadow variant).
 7) Actions: SAVE MY CHART (guests see "log in to keep this chart." with a link to /login), SHARE MY CHART (opens the share card dialog, C6), TAKE IT AGAIN (back to /chart/new).
 8) The footer disclaimer.
 States: loading (skeletons), error on the reading block only (TRY AGAIN), unknown birth time (no rising, note shown), every perfume excluded (an empty state: "nothing fits those limits. loosen one and try again." with a button back to step 5).

C5. /saved: a list of saved charts as plain rows (name, date, sun / moon / rising, signature perfume) each linking to its result. States: loading, empty ("no charts saved yet. make one and it will wait here."), filled, and a guest state that shows "log in to keep this chart." with a LOG IN button.

C6. Share card: a dialog that renders a 1080x1920 ink-coloured card scaled down: the name in .label, sun / moon / rising in large serif, the signature perfume name, one line of the reading, the store name and URL at the bottom. Buttons: DOWNLOAD IMAGE (use html-to-image) and COPY LINK (info toast). States: generating, ready, failed with retry.

===== PART D: COPY (all strings, English then Vietnamese) =====
Put every string below into the translation files. Tone: dry, specific, brief. Lowercase headlines, no exclamation marks, no emojis. Write any string I did not list in the same voice, in both languages.

nav: shop / cửa hàng · my charts / bản đồ sao của tôi · cart / giỏ hàng · log in / đăng nhập
hero headline: your birth date already picked a perfume. / ngày sinh của bạn đã chọn sẵn một mùi hương.
hero subline: give us the date, time and place. we'll match you to something you can wear. / cho chúng tôi ngày, giờ và nơi bạn sinh ra. chúng tôi sẽ tìm mùi hương hợp với bạn.
main button: READ MY CHART / XEM BẢN ĐỒ SAO
how it works 1: tell us when and where you were born. / cho chúng tôi biết bạn sinh ra khi nào và ở đâu.
how it works 2: we read the sky from that moment. / chúng tôi đọc bầu trời vào khoảnh khắc đó.
how it works 3: you get perfumes that fit it, and why. / bạn nhận được những mùi hương hợp với nó, kèm lý do.
step 1: what should we call you. / chúng tôi nên gọi bạn là gì. (placeholder: first name / tên của bạn)
step 2: when were you born. / bạn sinh ngày nào. (labels: day / ngày, month / tháng, year / năm)
step 3: what time? a guess is fine. / giờ sinh? ước chừng cũng được. · checkbox: i don't know / tôi không biết · note: no problem. we'll skip your rising sign and your moon may be less exact. / không sao. chúng tôi sẽ bỏ qua cung mọc và cung mặt trăng có thể kém chính xác hơn.
step 4: where were you born. / bạn sinh ra ở đâu. (placeholder: city / thành phố) · no results: we can't find that place. try the nearest big city. / chúng tôi không tìm thấy nơi này. thử thành phố lớn gần đó.
step 5: anything we should keep away from you. / có gì chúng tôi nên tránh không. (placeholder: e.g. oud, powdery, too sweet / ví dụ: trầm, phấn, quá ngọt) · style chips: feminine / nữ tính, masculine / nam tính, unisex / unisex, no preference / không ưu tiên · budget chips: any / bất kỳ, low / thấp, mid / vừa, high / cao
step 6 button: SEE MY MATCHES / XEM KẾT QUẢ · edit link: EDIT / SỬA
buttons: NEXT / TIẾP · BACK / QUAY LẠI · TRY AGAIN / THỬ LẠI
errors: we need something to call you. / chúng tôi cần một cái tên để gọi bạn. · we need a date. you were born on one. / chúng tôi cần một ngày. bạn đã sinh ra vào một ngày nào đó. · that day doesn't exist. / ngày này không tồn tại. · that date hasn't happened yet. / ngày đó chưa đến. · pick a city to continue. / chọn một thành phố để tiếp tục.
loading messages: placing the planets / đang đặt các hành tinh vào vị trí · checking the sky on your day / đang xem bầu trời vào ngày bạn sinh · matching you to something you can wear / đang tìm mùi hương hợp với bạn
labels: YOUR CHART / BẢN ĐỒ SAO CỦA BẠN · SUN / MẶT TRỜI · MOON / MẶT TRĂNG · RISING / CUNG MỌC · VENUS / SAO KIM · MARS / SAO HỎA · MERCURY / SAO THỦY · WHAT THIS MEANS FOR YOUR NOSE / ĐIỀU NÀY NÓI GÌ VỀ KHỨU GIÁC CỦA BẠN · FIRE / LỬA · EARTH / ĐẤT · AIR / KHÍ · WATER / NƯỚC
signature: YOUR SIGNATURE SCENT / MÙI HƯƠNG ĐẶC TRƯNG CỦA BẠN · the closest match to your chart. / mùi hương gần với bản đồ sao của bạn nhất.
also: ALSO WRITTEN IN YOUR STARS / CŨNG ĐƯỢC VIẾT TRONG CÁC VÌ SAO CỦA BẠN
shadow: YOUR SHADOW SCENT / MÙI HƯƠNG ĐỐI LẬP CỦA BẠN · the opposite of what you'd pick. try it anyway. / ngược với những gì bạn thường chọn. thử xem sao.
product: MATCH / ĐỘ HỢP · TOP / HƯƠNG ĐẦU · HEART / HƯƠNG GIỮA · BASE / HƯƠNG CUỐI · ADD TO CART / THÊM VÀO GIỎ · SOLD OUT / HẾT HÀNG
actions: SAVE MY CHART / LƯU BẢN ĐỒ SAO · SHARE MY CHART / CHIA SẺ BẢN ĐỒ SAO · TAKE IT AGAIN / LÀM LẠI · log in to keep this chart. / đăng nhập để giữ bản đồ sao này.
saved: saved. your chart stays the same. / đã lưu. bản đồ sao của bạn sẽ không đổi. · no charts saved yet. make one and it will wait here. / chưa có bản đồ sao nào được lưu. tạo một cái, nó sẽ ở đây chờ bạn.
reading error: the reading didn't load. try again. / phần luận giải chưa tải được. thử lại.
no matches: nothing fits those limits. loosen one and try again. / không có mùi hương nào phù hợp với giới hạn đó. nới một điều kiện rồi thử lại.
shop empty: nothing matches. loosen a filter. / không có gì phù hợp. thử nới bộ lọc.
cart: your cart is empty. / giỏ hàng của bạn đang trống. · SUBTOTAL / TẠM TÍNH · CHECKOUT / THANH TOÁN · checkout is not connected yet. / thanh toán chưa được kết nối.
admin: no perfumes yet. upload a csv. / chưa có nước hoa nào. hãy tải lên tệp csv. · UPLOAD CSV / TẢI LÊN CSV
404: nothing here. the planets are fine. / không có gì ở đây. các hành tinh vẫn ổn.
footer disclaimer: for fun and fragrance inspiration, not advice. / mang tính giải trí và gợi ý mùi hương, không phải lời khuyên.

===== RULES FOR EVERYTHING =====
- Tokens only: no raw hex or pixel values in components.
- Semantic HTML, a visible label on every input, everything reachable and usable by keyboard, visible focus, alt text on images, respect prefers-reduced-motion.
- Every data screen has loading, empty, error and filled states, previewable with ?state=.
- Responsive at 390px and 1440px. No horizontal scrolling. A 60-character name must wrap cleanly.
- Do not copy any other app's code, images, logos or wording. Everything here is original.
- No console errors.

When you finish, list every route you built, which states each one supports, and anything you could not do. Do not add features I have not described.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://celestial-scents-guide.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/326cd8f4-38f3-48f9-85bc-34855df4124c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
