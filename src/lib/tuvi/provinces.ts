/** 63 Vietnamese provinces/cities (pre-2025 list) with the longitude of the provincial centre, for true solar time. */
export interface Province { id: string; name: string; lon: number }
const P = (id: string, name: string, lon: number): Province => ({ id, name, lon });
export const PROVINCES: Province[] = [
  P("ha-noi", "Hà Nội", 105.85), P("ho-chi-minh", "TP. Hồ Chí Minh", 106.7), P("hai-phong", "Hải Phòng", 106.68),
  P("da-nang", "Đà Nẵng", 108.2), P("can-tho", "Cần Thơ", 105.78), P("an-giang", "An Giang", 105.43),
  P("ba-ria-vung-tau", "Bà Rịa – Vũng Tàu", 107.17), P("bac-giang", "Bắc Giang", 106.2), P("bac-kan", "Bắc Kạn", 105.83),
  P("bac-lieu", "Bạc Liêu", 105.72), P("bac-ninh", "Bắc Ninh", 106.07), P("ben-tre", "Bến Tre", 106.37),
  P("binh-dinh", "Bình Định", 109.22), P("binh-duong", "Bình Dương", 106.65), P("binh-phuoc", "Bình Phước", 106.9),
  P("binh-thuan", "Bình Thuận", 108.1), P("ca-mau", "Cà Mau", 105.15), P("cao-bang", "Cao Bằng", 106.25),
  P("dak-lak", "Đắk Lắk", 108.05), P("dak-nong", "Đắk Nông", 107.69), P("dien-bien", "Điện Biên", 103.02),
  P("dong-nai", "Đồng Nai", 106.82), P("dong-thap", "Đồng Tháp", 105.63), P("gia-lai", "Gia Lai", 108.0),
  P("ha-giang", "Hà Giang", 104.98), P("ha-nam", "Hà Nam", 105.92), P("ha-tinh", "Hà Tĩnh", 105.9),
  P("hai-duong", "Hải Dương", 106.32), P("hau-giang", "Hậu Giang", 105.47), P("hoa-binh", "Hòa Bình", 105.33),
  P("hung-yen", "Hưng Yên", 106.05), P("khanh-hoa", "Khánh Hòa", 109.19), P("kien-giang", "Kiên Giang", 105.08),
  P("kon-tum", "Kon Tum", 108.0), P("lai-chau", "Lai Châu", 103.46), P("lam-dong", "Lâm Đồng", 108.44),
  P("lang-son", "Lạng Sơn", 106.76), P("lao-cai", "Lào Cai", 103.97), P("long-an", "Long An", 106.41),
  P("nam-dinh", "Nam Định", 106.17), P("nghe-an", "Nghệ An", 105.68), P("ninh-binh", "Ninh Bình", 105.97),
  P("ninh-thuan", "Ninh Thuận", 108.99), P("phu-tho", "Phú Thọ", 105.4), P("phu-yen", "Phú Yên", 109.32),
  P("quang-binh", "Quảng Bình", 106.6), P("quang-nam", "Quảng Nam", 108.47), P("quang-ngai", "Quảng Ngãi", 108.8),
  P("quang-ninh", "Quảng Ninh", 107.08), P("quang-tri", "Quảng Trị", 107.1), P("soc-trang", "Sóc Trăng", 105.97),
  P("son-la", "Sơn La", 103.9), P("tay-ninh", "Tây Ninh", 106.1), P("thai-binh", "Thái Bình", 106.34),
  P("thai-nguyen", "Thái Nguyên", 105.84), P("thanh-hoa", "Thanh Hóa", 105.78), P("thua-thien-hue", "Thừa Thiên Huế", 107.59),
  P("tien-giang", "Tiền Giang", 106.35), P("tra-vinh", "Trà Vinh", 106.34), P("tuyen-quang", "Tuyên Quang", 105.22),
  P("vinh-long", "Vĩnh Long", 105.97), P("vinh-phuc", "Vĩnh Phúc", 105.6), P("yen-bai", "Yên Bái", 104.87),
];

/** Equation of time in minutes (Spencer approximation). */
export function equationOfTime(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const n = (date.getTime() - start) / 86400000;
  const g = (2 * Math.PI / 365) * (n - 1);
  return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
}

/**
 * Converts Vietnam clock time (UTC+7, 105°E) to local true solar time, then to the
 * iztro hour index: 0 = early Tý (00–01), 1..11 = Sửu..Hợi, 12 = late Tý (23–24).
 */
export function trueSolar(dateISO: string, time: string, lon: number) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const clock = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const offset = (lon - 105) * 4 + equationOfTime(clock);
  const solar = new Date(clock.getTime() + Math.round(offset) * 60000);
  const minutes = solar.getUTCHours() * 60 + solar.getUTCMinutes();
  const hourIndex = minutes >= 23 * 60 ? 12 : Math.floor((minutes + 60) / 120);
  const iso = solar.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16), offset: Math.round(offset), hourIndex };
}
