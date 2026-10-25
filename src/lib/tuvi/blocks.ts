/**
 * Vietnamese reading blocks for Tử Vi. Written from meaning in a casual spoken voice, never translated.
 * Every block has a stable key so a reading can list exactly which blocks it used.
 */
export type Bucket = "fire" | "earth" | "air" | "water";

export const STAR_VI: Record<string, string> = {
  紫微: "Tử Vi", 天机: "Thiên Cơ", 太阳: "Thái Dương", 武曲: "Vũ Khúc", 天同: "Thiên Đồng", 廉贞: "Liêm Trinh",
  天府: "Thiên Phủ", 太阴: "Thái Âm", 贪狼: "Tham Lang", 巨门: "Cự Môn", 天相: "Thiên Tướng", 天梁: "Thiên Lương",
  七杀: "Thất Sát", 破军: "Phá Quân", 左辅: "Tả Phụ", 右弼: "Hữu Bật", 文昌: "Văn Xương", 文曲: "Văn Khúc",
  天魁: "Thiên Khôi", 天钺: "Thiên Việt", 禄存: "Lộc Tồn", 天马: "Thiên Mã", 擎羊: "Kình Dương", 陀罗: "Đà La",
  火星: "Hỏa Tinh", 铃星: "Linh Tinh", 地空: "Địa Không", 地劫: "Địa Kiếp",
};
export const BRIGHT_VI: Record<string, string> = { 庙: "Miếu", 旺: "Vượng", 得: "Đắc", 利: "Lợi", 平: "Bình", 不: "Bất", 陷: "Hãm" };
export const MUTAGEN_VI: Record<string, string> = { 禄: "Hóa Lộc", 权: "Hóa Quyền", 科: "Hóa Khoa", 忌: "Hóa Kỵ" };
export const BRANCH_VI: Record<string, string> = { 子: "Tý", 丑: "Sửu", 寅: "Dần", 卯: "Mão", 辰: "Thìn", 巳: "Tỵ", 午: "Ngọ", 未: "Mùi", 申: "Thân", 酉: "Dậu", 戌: "Tuất", 亥: "Hợi" };
export const STEM_VI: Record<string, string> = { 甲: "Giáp", 乙: "Ất", 丙: "Bính", 丁: "Đinh", 戊: "Mậu", 己: "Kỷ", 庚: "Canh", 辛: "Tân", 壬: "Nhâm", 癸: "Quý" };
export const BUREAU_VI: Record<string, string> = { 水二局: "Thủy Nhị Cục", 木三局: "Mộc Tam Cục", 金四局: "Kim Tứ Cục", 土五局: "Thổ Ngũ Cục", 火六局: "Hỏa Lục Cục" };

export interface PalaceInfo { vi: string; domain: string; advice: string }
export const PALACE: Record<string, PalaceInfo> = {
  命宫: { vi: "Mệnh", domain: "con người mình", advice: "Sống đúng sở trường, đừng cố đóng vai người khác." },
  兄弟: { vi: "Huynh Đệ", domain: "anh chị em và người cùng làm ăn", advice: "Tiền nong với anh em, bạn hùn hạp thì ghi rõ ra giấy." },
  夫妻: { vi: "Phu Thê", domain: "chuyện tình cảm, vợ chồng", advice: "Có gì không vừa ý thì nói thẳng một lần, đừng để dồn." },
  子女: { vi: "Tử Tức", domain: "con cái và người nhỏ hơn mình dìu dắt", advice: "Dạy bằng việc mình làm, nói nhiều quá con cũng không nghe." },
  财帛: { vi: "Tài Bạch", domain: "tiền bạc", advice: "Tách tiền tiêu và tiền để dành ra hai chỗ, ngay từ tháng này." },
  疾厄: { vi: "Tật Ách", domain: "sức khỏe", advice: "Khám định kỳ mỗi năm một lần, đừng đợi đau mới đi." },
  迁移: { vi: "Thiên Di", domain: "chuyện đi xa, ra ngoài xã hội", advice: "Ra ngoài thì giữ lời nói, người lạ nhớ mình qua cách cư xử." },
  仆役: { vi: "Nô Bộc", domain: "các mối quen và cấp dưới", advice: "Chọn ít bạn mà chắc, đừng gánh hết chuyện của người ta." },
  官禄: { vi: "Quan Lộc", domain: "công việc, sự nghiệp", advice: "Chọn một chuyên môn rồi đào sâu, nhảy việc nhiều là mất gốc." },
  田宅: { vi: "Điền Trạch", domain: "nhà cửa, đất đai, gia đạo", advice: "Mua nhà mua đất thì xem giấy tờ kỹ, đừng mua vì nóng." },
  福德: { vi: "Phúc Đức", domain: "tâm tính, cách tự làm mình vui", advice: "Mỗi ngày có một khoảng không điện thoại, không nghĩ chuyện người khác." },
  父母: { vi: "Phụ Mẫu", domain: "cha mẹ, cấp trên, giấy tờ", advice: "Với người lớn thì báo trước, xin ý kiến trước, đỡ va chạm về sau." },
};

export interface StarBlock {
  bucket: Bucket;
  core: string; // bold hook
  self: string;
  flaw: string;
  mate: string; // short partner description for the contradiction line
  partner: string;
  work: string;
  money: string;
  health: string;
  people: string; // how the star shows up in any other area
  advice: string;
  verdict: string;
  verdictDim: string;
}

export const STARS: Record<string, StarBlock> = {
  紫微: {
    bucket: "earth",
    core: "Sinh ra đã quen làm chủ",
    self: "Đi đâu cũng tự nhiên thành người quyết, người khác cũng ngầm chờ mình lên tiếng. Sĩ diện cao, thích được nể hơn được thương.",
    flaw: "Khó nhận sai trước mặt người khác, nhiều khi giữ thể diện mà để lỡ việc.",
    mate: "người cũng muốn cầm trịch",
    partner: "Người mình chọn có khí chất, có chính kiến, không chịu đứng sau ai. Hai cái tôi lớn ở chung thì phải có người biết lùi.",
    work: "Hợp vị trí quản lý, điều phối, hoặc tự đứng ra làm chủ. Làm nhân viên lâu năm dễ thấy bị bó.",
    money: "Tiền đến từ vị trí và uy tín, càng lên cao tiền càng nhiều. Tiêu cho thể diện cũng không ít.",
    health: "Hay dồn áp lực vào dạ dày và đầu, căng thẳng là ăn uống thất thường.",
    people: "Ở chỗ này có người đỡ đầu, nhưng ai cũng muốn làm chủ.",
    advice: "Bớt đóng vai người gánh hết, giao việc ra và chịu để người khác làm khác mình.",
    verdict: "Có số làm người đứng đầu, miễn đừng đứng một mình.",
    verdictDim: "Ngôi cao mà thiếu người phò, gồng một mình thì mệt.",
  },
  天机: {
    bucket: "air",
    core: "Đầu nhanh, nghĩ trước người ta ba bước",
    self: "Người ta nói nửa câu đã hiểu ý, giỏi tính toán, giỏi bày cách. Hợp làm quân sư hơn làm tướng.",
    flaw: "Nghĩ nhiều quá thành lo, một tin nhắn chưa trả lời cũng tự diễn ra cả vở kịch.",
    mate: "người hay đổi ý, khó đoán",
    partner: "Người mình thương thông minh, nói chuyện có duyên nhưng tâm trạng thay đổi nhanh. Chênh tuổi một chút thì dễ hòa hơn.",
    work: "Hợp lập kế hoạch, phân tích, kỹ thuật, tư vấn. Việc lặp đi lặp lại thì chán rất nhanh.",
    money: "Kiếm tiền bằng đầu óc, nhiều nguồn nhỏ. Hay đổi kế hoạch nên tiền khó đọng lại.",
    health: "Thần kinh căng, dễ mất ngủ, chân tay và gan cần để ý.",
    people: "Ở chỗ này mọi thứ hay thay đổi, được cái linh hoạt.",
    advice: "Đặt hạn cho việc suy nghĩ, quá hạn là phải làm, đúng sai sửa sau.",
    verdict: "Cái đầu là vốn quý nhất, chỉ cần nó chịu nghỉ đúng lúc.",
    verdictDim: "Thông minh mà hay lo, nghĩ ít đi một nửa là đời nhẹ hẳn.",
  },
  太阳: {
    bucket: "fire",
    core: "Sống để cho người khác nhìn thấy",
    self: "Rộng rãi, nhiệt tình, thích giúp và thích được ghi nhận. Đi đâu cũng muốn sáng sủa, đàng hoàng.",
    flaw: "Cho đi nhiều mà không nói ra mình cần gì, tới lúc kiệt mới than.",
    mate: "người sáng, nổi, được nhiều người để ý",
    partner: "Người bên cạnh hoạt bát, có tiếng nói ngoài xã hội. Tình cảm nồng lúc đầu, về sau phải giữ khoảng thở cho nhau.",
    work: "Hợp việc đứng trước đám đông: giảng dạy, truyền thông, quản lý, công vụ. Càng được ghi nhận càng làm tốt.",
    money: "Tiền đến từ danh tiếng, có tiếng trước rồi có tiền sau. Hào phóng quá thì tiền đi nhanh.",
    health: "Để ý mắt, huyết áp và đầu, làm quá sức là đổ bệnh.",
    people: "Ở chỗ này mình là người cho đi trước.",
    advice: "Giúp người thì giúp, nhưng nói rõ giới hạn, đừng gật đầu hết.",
    verdict: "Sáng cho người khác được, nhớ chừa ánh sáng cho mình.",
    verdictDim: "Mặt trời lặn thì phải biết nghỉ, đừng cố sáng giữa đêm.",
  },
  武曲: {
    bucket: "air",
    core: "Thẳng tính, làm là làm tới",
    self: "Quyết đoán, chịu khó, giỏi chuyện tiền và chuyện thực tế. Nói ít, làm nhiều.",
    flaw: "Cứng quá thành khô, thương mà nói ra như ra lệnh.",
    mate: "người cứng rắn, ít nói lời ngọt",
    partner: "Người mình chọn độc lập, giỏi kiếm tiền nhưng vụng chuyện tình cảm. Cưới muộn một chút thì bền hơn.",
    work: "Hợp tài chính, kỹ thuật, quân đội, kinh doanh. Việc có số liệu rõ ràng là mạnh nhất.",
    money: "Đây là sao tiền, kiếm được và giữ được. Cái giá là làm nhiều, nghỉ ít.",
    health: "Để ý phổi, hô hấp và các vết thương do va chạm.",
    people: "Ở chỗ này mọi chuyện tính bằng việc thật, không bằng lời.",
    advice: "Mỗi tuần nói ra một câu cảm ơn hay một câu thương, không kèm điều kiện.",
    verdict: "Giỏi làm ra tiền, học thêm cách làm ra hơi ấm.",
    verdictDim: "Cứng thì dễ gãy, mềm đi một chút là giữ được cả tiền lẫn người.",
  },
  天同: {
    bucket: "water",
    core: "Hiền, dễ chịu, ai gặp cũng thấy dễ gần",
    self: "Thích sống thoải mái, ghét tranh giành, có khiếu hưởng thụ. Trẻ con thì nhõng nhẽo, lớn lên mới cứng dần.",
    flaw: "Dễ an phận, việc khó là hay để mai tính.",
    mate: "người hiền, chiều mình nhưng lười đổi",
    partner: "Người bên cạnh hiền lành, dễ chịu, thích yên ổn. Lệch tuổi nhiều một chút thì hợp.",
    work: "Hợp dịch vụ, chăm sóc, ăn uống, nghệ thuật. Môi trường căng thẳng thì xuống tinh thần rất nhanh.",
    money: "Tiền đủ dùng, không thiếu nhưng khó giàu nhanh. Thích gì mua nấy.",
    health: "Để ý thận, bàng quang, tiêu hóa và chuyện tăng cân.",
    people: "Ở chỗ này êm, ít va chạm, được cái hòa khí.",
    advice: "Mỗi tháng nhận một việc khó hơn sức mình một chút, làm cho xong.",
    verdict: "Phúc đến từ sự hiền, giàu thì phải chịu thêm một chút khổ.",
    verdictDim: "Hiền quá thành ỷ, đứng dậy sớm hơn người khác chờ là đổi đời.",
  },
  廉贞: {
    bucket: "fire",
    core: "Nhìn thì điềm tĩnh, trong lòng lửa rất to",
    self: "Có nguyên tắc, sắc sảo, biết giữ hình ảnh. Yêu ghét rõ ràng nhưng không để lộ ngay.",
    flaw: "Ôm thù dai, một lần mất niềm tin là rất khó quay lại.",
    mate: "người cuốn hút nhưng nhiều sóng gió",
    partner: "Người mình bị hút vào thường có sức hấp dẫn mạnh, nhiều cảm xúc, quan hệ lúc nóng lúc lạnh.",
    work: "Hợp pháp lý, chính trị, kỹ thuật, quản trị nhân sự. Làm việc có luật lệ rõ là thăng tiến nhanh.",
    money: "Tiền đến qua quan hệ và quyền hạn. Tiền nóng thì đi cũng nhanh.",
    health: "Để ý tim mạch, máu huyết và bệnh phụ khoa, nam khoa.",
    people: "Ở chỗ này có hút có đẩy, quan hệ không bao giờ nhạt.",
    advice: "Giận thì ngủ một đêm rồi mới nói, đừng quyết trong lúc nóng.",
    verdict: "Lửa trong người dùng đúng chỗ là thành tài, dùng sai là thành họa.",
    verdictDim: "Lửa âm ỉ dễ cháy mình trước, xả ra bằng việc đừng xả bằng lời.",
  },
  天府: {
    bucket: "earth",
    core: "Giữ của giỏi, sống kín kẽ",
    self: "Chu đáo, thận trọng, thích ổn định và có của để dành. Người ta tin vì mình đáng tin.",
    flaw: "Ngại thay đổi, có cơ hội lớn cũng chần chừ vì sợ mất cái đang có.",
    mate: "người an toàn, chu đáo",
    partner: "Người bên cạnh đàng hoàng, biết lo, coi trọng gia đình. Thiếu lãng mạn nhưng đủ chắc.",
    work: "Hợp ngân hàng, kế toán, quản lý tài sản, hành chính. Càng làm lâu càng có vị trí.",
    money: "Kho tiền của lá số, giỏi tích lũy. Tiền vào chậm nhưng ở lại lâu.",
    health: "Để ý dạ dày, lá lách và chuyện ăn uống quá đà.",
    people: "Ở chỗ này có người lo cho, có chỗ dựa.",
    advice: "Mỗi năm thử một việc mới với khoản tiền nhỏ, đừng giữ mãi một chỗ.",
    verdict: "Giữ được của là phúc, dám dùng của mới là tài.",
    verdictDim: "Kho trống thì đừng cố tỏ ra đầy, tích từ ít một.",
  },
  太阴: {
    bucket: "water",
    core: "Tinh tế, nhạy cảm, để ý từng chi tiết",
    self: "Dịu dàng, có gu, thích không gian riêng. Cảm nhận người khác rất nhanh nhưng ít khi nói ra.",
    flaw: "Ôm cảm xúc trong lòng, buồn mà ai hỏi cũng nói không sao.",
    mate: "người mềm, kín, cần được dỗ",
    partner: "Người mình thương dịu dàng, sống tình cảm, cần sự quan tâm đều đặn hơn quà lớn.",
    work: "Hợp thiết kế, bất động sản, tài chính, nghề liên quan phụ nữ và cái đẹp.",
    money: "Giỏi tích tiểu thành đại, tiền vào đều. Hợp đầu tư nhà đất.",
    health: "Để ý mắt, nội tiết, giấc ngủ và chuyện lạnh bụng.",
    people: "Ở chỗ này tình cảm nhiều hơn lý lẽ.",
    advice: "Buồn thì nói ra một câu với một người tin được, đừng tự gặm.",
    verdict: "Mềm như trăng mà bền, miễn đừng giấu mình sau mây.",
    verdictDim: "Trăng mờ thì càng phải tự thắp đèn, đừng chờ người khác nhận ra.",
  },
  贪狼: {
    bucket: "water",
    core: "Ham sống, ham thử, nhiều tài lẻ",
    self: "Giao tiếp giỏi, đa tài, thích cái mới, đi đâu cũng có bạn. Ham muốn nhiều nên động lực cũng lớn.",
    flaw: "Ôm nhiều thứ quá, cái gì cũng biết mà ít cái tới nơi.",
    mate: "người duyên dáng, nhiều người để ý",
    partner: "Người bên cạnh hấp dẫn, giỏi giao tiếp, đời sống tình cảm phong phú. Cần tin nhau thật chắc.",
    work: "Hợp kinh doanh, giải trí, ngoại giao, ăn uống, làm đẹp. Phát muộn nhưng phát mạnh.",
    money: "Tiền đến từ quan hệ và cơ hội. Ham vui thì tiền cũng theo vui mà đi.",
    health: "Để ý gan, thận và hậu quả của tiệc tùng, thức khuya.",
    people: "Ở chỗ này nhiều mối, vui nhưng phải lọc.",
    advice: "Chọn ra hai việc quan trọng nhất năm nay, còn lại tạm gác.",
    verdict: "Ham muốn là động cơ, có phanh thì đi được xa.",
    verdictDim: "Muốn nhiều quá thì được ít, bớt một nửa là được gấp đôi.",
  },
  巨门: {
    bucket: "water",
    core: "Miệng sắc, nhìn ra cái sai rất nhanh",
    self: "Lý lẽ chặt, nghiên cứu sâu, hay hỏi tới cùng. Nói đúng nhưng thường nói thẳng quá.",
    flaw: "Hay nghi, một chuyện nhỏ cũng soi tới chân tơ kẽ tóc, dễ mang tiếng khó tính.",
    mate: "người hay tranh luận, nói câu nào trúng câu đó",
    partner: "Người bên cạnh sắc sảo, lý lẽ, dễ có cãi vã ngầm. Nói chuyện rõ ràng thì càng cãi càng hiểu nhau.",
    work: "Hợp luật, giảng dạy, nghiên cứu, bán hàng bằng lời nói, truyền thông.",
    money: "Kiếm tiền bằng miệng, bằng chuyên môn. Lời nói không khéo là mất mối.",
    health: "Để ý miệng, họng, tiêu hóa và chuyện ăn uống thất thường.",
    people: "Ở chỗ này dễ có thị phi, nói ít thì đỡ.",
    advice: "Trước khi chê ai, nói một điểm tốt của họ trước.",
    verdict: "Cái miệng kiếm ra cơm, cũng chính nó làm đổ cơm.",
    verdictDim: "Nghi ngờ ít đi một chút, người ta sẽ nói thật với mình nhiều hơn.",
  },
  天相: {
    bucket: "water",
    core: "Đáng tin, biết điều, giỏi giữ cân bằng",
    self: "Lịch sự, công bằng, chỉn chu, hay đứng ra hòa giải. Người ta giao gì cũng yên tâm.",
    flaw: "Ngại làm mất lòng nên hay ôm việc của người khác.",
    mate: "người chu toàn nhưng hay chiều theo ý người khác",
    partner: "Người bên cạnh hiền hòa, chu đáo, biết điều. Chỉ sợ cả hai cùng ngại nói ra cái mình muốn.",
    work: "Hợp hành chính, nhân sự, trợ lý cấp cao, ngoại giao. Đứng cạnh người giỏi là phát.",
    money: "Tiền ổn, ít khi túng. Làm cho người khác giàu thì mình cũng có phần.",
    health: "Để ý da, thận và đường tiết niệu.",
    people: "Ở chỗ này có người giúp, quan hệ biết trước biết sau.",
    advice: "Tập nói không với một việc không phải của mình mỗi tuần.",
    verdict: "Người tốt có người giúp, nhớ giữ một phần tốt cho mình.",
    verdictDim: "Chiều hết lòng người thì mất lòng mình, chọn ra ai đáng chiều.",
  },
  天梁: {
    bucket: "earth",
    core: "Già trước tuổi, thích che chở người khác",
    self: "Có nguyên tắc, hay khuyên bảo, gặp chuyện là đứng ra gánh. Hay được người lớn thương.",
    flaw: "Nói như dạy đời, giúp người mà người ta thấy bị quản.",
    mate: "người chững chạc, như anh chị lớn",
    partner: "Người mình chọn hơn tuổi hoặc chững chạc hơn mình, biết lo nhưng hay nói như dạy.",
    work: "Hợp y, giáo dục, bảo hiểm, pháp lý, công tác xã hội. Càng giúp người càng có danh.",
    money: "Tiền không ồ ạt nhưng có quý nhân đỡ lúc khó. Không hợp đầu cơ.",
    health: "Thường tai qua nạn khỏi. Để ý dạ dày và chuyện lo âu kéo dài.",
    people: "Ở chỗ này có quý nhân, gặp khó có người đỡ.",
    advice: "Khuyên một lần thôi, người ta không nghe thì để họ tự học.",
    verdict: "Có phúc che chở người, cũng có phúc được người che chở.",
    verdictDim: "Gánh việc người khác nhiều quá thì lưng mình còng, bớt lại.",
  },
  七杀: {
    bucket: "fire",
    core: "Thẳng, gan, ghét vòng vo",
    self: "Quyết đoán, dám xông, một khi muốn là làm tới cùng. Người ta sợ mà cũng phục.",
    flaw: "Nóng vội, cắt đứt quá nhanh, đôi khi phá luôn cái đáng giữ.",
    mate: "người lì, không chịu thua",
    partner: "Người bên cạnh cá tính mạnh, độc lập. Hai bên cùng cứng thì cãi to, nhưng cũng dám nói thật.",
    work: "Hợp việc mở đường: khởi nghiệp, kinh doanh mạo hiểm, quân đội, thể thao. Thăng trầm lớn.",
    money: "Tiền đến theo đợt lớn, có lúc rất nhiều có lúc trắng tay. Cần quỹ dự phòng.",
    health: "Để ý tai nạn, chấn thương và phổi.",
    people: "Ở chỗ này nhiều va chạm, nhưng cũng nhờ va chạm mà lớn.",
    advice: "Trước mỗi quyết định lớn, đợi đủ ba ngày rồi mới làm.",
    verdict: "Gan là trời cho, biết lúc dừng là tự mình học.",
    verdictDim: "Xông mà không có giáp, chuẩn bị kỹ rồi hẵng lao.",
  },
  破军: {
    bucket: "water",
    core: "Thích đập đi làm lại",
    self: "Dám thay đổi, không sợ bắt đầu từ con số không, ghét lối mòn. Đời nhiều khúc rẽ.",
    flaw: "Chán nhanh, cái gì đang ổn cũng muốn phá ra làm khác.",
    mate: "người bốc đồng, thất thường",
    partner: "Người mình bị hút vào thường phá cách, khó đoán. Quan hệ nhiều biến động trước khi ổn định.",
    work: "Hợp đổi mới, khởi nghiệp, sáng tạo, xây dựng lại thứ cũ. Hợp làm người mở đường.",
    money: "Tiền vào ra mạnh, phá rồi lập. Giữ được một khoản không đụng tới là thắng.",
    health: "Để ý thận, máu và các bệnh do thức khuya, sống thất thường.",
    people: "Ở chỗ này hay thay máu, cũ đi mới tới.",
    advice: "Muốn bỏ việc gì thì viết ra ba lý do, để một tuần rồi đọc lại.",
    verdict: "Phá để xây thì thành tướng, phá vì chán thì thành nợ.",
    verdictDim: "Đổi nhiều quá thì chẳng gì kịp lớn, giữ lại một gốc.",
  },
};

export const LUCKY = ["左辅", "右弼", "文昌", "文曲", "天魁", "天钺", "禄存"];
export const SHA = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"];

export const LINES = {
  bright: (star: string, b: string) => `${star} ở thế ${b}, mặt tốt lấn mặt xấu.`,
  dim: (star: string, b: string) => `${star} ở thế ${b}, mặt khó hiện rõ hơn mặt tốt.`,
  lucky: (names: string) => `Có ${names} hỗ trợ, gặp việc thường có người giúp một tay.`,
  sha: (names: string) => `Gặp ${names}, việc tốt đến kèm va chạm, cần chậm lại một nhịp.`,
  noSha: "Không gặp Tứ Sát, đường đi ở chỗ này khá êm.",
  vcd: (names: string) => `Cung này vô chính diệu, mượn ${names} từ cung đối diện nên dễ đổi theo hoàn cảnh.`,
  second: (star: string, core: string) => `Đi cùng ${star}: ${core.charAt(0).toLowerCase()}${core.slice(1)}.`,
  mutagen: {
    禄: (s: string, d: string) => `${s} hóa Lộc: chuyện ${d} là chỗ dễ ra tiền, ra cơ hội.`,
    权: (s: string, d: string) => `${s} hóa Quyền: chuyện ${d} mình nắm quyền quyết, đi kèm áp lực.`,
    科: (s: string, d: string) => `${s} hóa Khoa: chuyện ${d} được tiếng tốt, có người ghi nhận.`,
    忌: (s: string, d: string) => `${s} hóa Kỵ: chuyện ${d} là món nợ đời, càng né càng vướng.`,
  } as Record<string, (s: string, d: string) => string>,
  kyAdvice: "Chỗ có Hóa Kỵ thì đối diện sớm, để lâu chỉ thêm rối.",
};

export const RULES: Record<string, string> = {
  BRIGHT: "Chính tinh miếu vượng thì lấy mặt tốt làm chủ, gặp sát cũng không phá hết.",
  DIM: "Chính tinh hãm địa thì mặt khó nổi lên trước, cần cát tinh đỡ mới dùng được.",
  VCD: "Cung vô chính diệu thì mượn chính tinh cung đối để luận, lực yếu hơn một bậc.",
  LUCKY: "Tả Hữu, Xương Khúc, Khôi Việt, Lộc Tồn hội vào cung nào thì cung đó có người giúp.",
  SHA: "Kình Đà Hỏa Linh Không Kiếp vào cung nào thì cung đó có trắc trở, đến nhanh đi nhanh.",
  NO_SHA: "Không có Tứ Sát xâm phạm thì cát tính của cung giữ được trọn.",
  M_禄: "Hóa Lộc là chỗ được, chỗ đó dễ có tiền và cơ hội.",
  M_权: "Hóa Quyền là chỗ nắm, chỗ đó mình có tiếng nói và chịu trách nhiệm.",
  M_科: "Hóa Khoa là chỗ được tiếng, chỗ đó có danh và có người nâng.",
  M_忌: "Hóa Kỵ là chỗ nợ, chỗ đó phải trả bằng công sức hoặc nước mắt.",
  PAIR: "Hai chính tinh đồng cung thì luận chung, sao đứng trước làm chủ.",
};

export const GLOSSARY: Record<string, string> = {
  "Chính tinh": "14 sao chính quyết định tính chất của một cung.",
  "Miếu / Vượng / Đắc": "Thế sáng của sao, sao phát huy mặt tốt.",
  "Bình / Lợi": "Thế trung bình, tốt xấu tùy sao đi kèm.",
  "Bất / Hãm": "Thế tối của sao, mặt khó dễ hiện ra.",
  "Vô chính diệu": "Cung không có chính tinh, phải mượn sao cung đối diện.",
  "Tứ Sát": "Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, gây va chạm và trắc trở.",
  "Không Kiếp": "Địa Không, Địa Kiếp, chủ hao hụt và mất mát bất ngờ.",
  "Tứ Hóa": "Lộc, Quyền, Khoa, Kỵ, bốn biến hóa theo can năm sinh.",
  "Đại hạn": "Mỗi chặng mười năm vận đi qua một cung.",
  "Lưu niên": "Cung mà năm hiện tại rơi vào, là chỗ nóng nhất trong năm.",
};
