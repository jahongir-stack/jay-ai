import { useState, useRef, useEffect } from "react";
import { loginGoogle, logout, watchUser, saveCloud, loadCloud, listUsers, getUserDoc, setBlocked, setUserField, deleteUser, getAnnouncement, setAnnouncement, getSupport, sendSupport, listSupport, markSupportRead } from "./firebase.js";

// O'ZINGIZNING Google emailingizni yozing — admin panel faqat sizga ko'rinadi:
const ADMIN_EMAIL = "hellojahongir@gmail.com";

const BASE_SYSTEM = `Sen JAY AI'san — aqlli, do'stona yordamchi. Seni ISHIMOV JAHONGIR yaratgan (JAY = "Jahongir AI Yasadi"). "Seni kim yaratgan?" deb so'rashsa, "Meni ISHIMOV JAHONGIR yaratgan" deb javob ber. Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob ber (asosan o'zbek tilida). Qisqa, aniq va foydali javob ber.

Sen sayt ham yasay olasan: foydalanuvchi sayt, sahifa yoki dizayn so'rasa, TO'LIQ ishlaydigan bitta HTML fayl yoz (CSS va JS ichida) va uni \`\`\`html ... \`\`\` blok ichida ber.`;

const MODES = {
  chat:   { label: "Oddiy chat", extra: "" },
  write:  { label: "Write",  icon: "✏️", extra: "\n\nHOZIRGI REJIM: WRITE. Sen professional yozuvchi yordamchisisan. Matn, maqola, xat, post, insho, reklama matni — chiroyli va ta'sirli yozasan. Uslub va grammatikaga alohida e'tibor ber." },
  learn:  { label: "Learn",  icon: "🎓", extra: "\n\nHOZIRGI REJIM: LEARN. Sen sabrli o'qituvchisan. Mavzuni oddiy tildan, bosqichma-bosqich, misollar bilan tushuntir. Oxirida bilimni tekshirish uchun 1 ta savol ber." },
  life:   { label: "Hayotiy", icon: "☕", extra: "\n\nHOZIRGI REJIM: HAYOTIY. Sen do'stona hayotiy maslahatchisan — kundalik ishlar, retseptlar, rejalar, sog'lom turmush, munosabatlar bo'yicha samimiy va amaliy maslahat berasan." },
  image:  { label: "Rasm", icon: "🖼", extra: "" },
  ustoz: { label: "Ustoz", icon: "👨‍🏫", extra: "\n\nHOZIRGI REJIM: USTOZ. Sen tajribali, sabrli ustozsan. Har mavzuni sodda misollar bilan, bosqichma-bosqich tushuntirasan. Talabani rag'batlantirasan, xatolarini yumshoq to'g'irlaysan." },
  dost: { label: "Do'st", icon: "🤝", extra: "\n\nHOZIRGI REJIM: DO'ST. Sen samimiy, quvnoq do'stsan. Erkin, do'stona ohangda gaplashasan, hazil ham qilasan, qo'llab-quvvatlaysan. Rasmiyatchiliksiz suhbatlashasan." },
  psixolog: { label: "Suhbatdosh", icon: "🧠", extra: "\n\nHOZIRGI REJIM: SUHBATDOSH. Sen diqqat bilan tinglaydigsan, hukm qilmaysan, his-tuyg'ularni tushunishga yordam berasan. MUHIM: sen psixolog EMASSAN — jiddiy ruhiy qiyinchiliklar, o'z joniga qasd fikri kabi holatlarda ALBATTA mutaxassisga (psixolog, ishonch telefoni) murojaat qilishni tavsiya qil." },
  biznes: { label: "Biznes", icon: "💼", extra: "\n\nHOZIRGI REJIM: BIZNES. Sen tajribali biznes-maslahatchisan. Marketing, sotuv, strategiya, moliya bo'yicha amaliy, konkret maslahatlar berasan. O'zbekiston bozorini hisobga olasan." },
  choice: { label: "JAY tanlovi", icon: "💡", extra: "\n\nHOZIRGI REJIM: JAY TANLOVI. Foydalanuvchiga o'zing qiziqarli mavzu tanlab ber: hayratlanarli fakt, foydali maslahat, qiziqarli savol yoki mini-o'yin taklif qil. Kreativ va qiziqarli bo'l." },
  code:   { label: "Code",   icon: "</>", extra: "\n\nHOZIRGI REJIM: CODE. Sen professional dasturchi yordamchisisan. Kod yozish, xatolarni topish, tushuntirish — asosiy vazifang. Kodni doim ```til ... ``` blokda ber." },
  design: { label: "Design", icon: "🎨", extra: "\n\nHOZIRGI REJIM: DESIGN. Sen professional veb-dizaynersan. Chiroyli, zamonaviy sayt va sahifalar yasaysan. Har doim to'liq HTML (CSS ichida) yozib, ```html blokda ber. Dizaynga alohida e'tibor ber: ranglar, shriftlar, animatsiyalar." },
};

const Logo = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <g stroke="#E5484D" strokeWidth="4" strokeLinecap="round">
      <line x1="20" y1="4" x2="20" y2="14" />
      <line x1="20" y1="26" x2="20" y2="36" />
      <line x1="4" y1="20" x2="14" y2="20" />
      <line x1="26" y1="20" x2="36" y2="20" />
      <line x1="8.7" y1="8.7" x2="15.8" y2="15.8" />
      <line x1="24.2" y1="24.2" x2="31.3" y2="31.3" />
      <line x1="31.3" y1="8.7" x2="24.2" y2="15.8" />
      <line x1="15.8" y1="24.2" x2="8.7" y2="31.3" />
    </g>
  </svg>
);

const fileToB64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(",")[1]);
  r.onerror = () => rej(new Error("Fayl o'qilmadi"));
  r.readAsDataURL(file);
});

function parseContent(text) {
  const parts = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "code", lang: (m[1] || "").toLowerCase(), value: m[2] });
    last = re.lastIndex;
  }
  if (last < text.length) {
    const rest = text.slice(last);
    const open = rest.indexOf("```");
    if (open !== -1) {
      if (open > 0) parts.push({ type: "text", value: rest.slice(0, open) });
      let code = rest.slice(open + 3);
      let lang = "";
      const nl = code.indexOf("\n");
      if (nl !== -1 && nl < 15) { lang = code.slice(0, nl).trim().toLowerCase(); code = code.slice(nl + 1); }
      parts.push({ type: "code", lang, value: code });
    } else {
      parts.push({ type: "text", value: rest });
    }
  }
  return parts;
}

function looksLikeHtml(lang, code) {
  if (lang === "html") return true;
  const c = code.trim().toLowerCase();
  return c.startsWith("<!doctype") || c.startsWith("<html") || c.startsWith("<svg") || c.includes("<body") || c.includes("<style") || c.includes("<div") || c.includes("<svg");
}

function isSvg(code) {
  const c = code.trim().toLowerCase();
  return c.startsWith("<svg") || (c.startsWith("<?xml") && c.includes("<svg"));
}

function SvgImage({ value }) {
  const clean = value.replace(/<script[\s\S]*?<\/script>/gi, "");
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };
  return (
    <div style={{ margin: "8px 0" }}>
      <div
        style={{
          borderRadius: 14, overflow: "hidden", border: "1px solid #26262B",
          background: "#FFF", lineHeight: 0, maxWidth: 420,
        }}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      <button onClick={copy} style={{
        marginTop: 6, background: "transparent", color: "#9A9AA2",
        border: "1px solid #3A3A40", borderRadius: 7, padding: "3px 10px",
        fontSize: 11, cursor: "pointer", fontFamily: "system-ui, sans-serif",
      }}>{copied ? "✓" : "SVG kodini nusxalash"}</button>
    </div>
  );
}

// Oddiy markdown: **qalin**, *kursiv*, `kod`, sarlavha, ro'yxatlar
function fmtInline(str, key) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) out.push(str.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<b key={key + "-b" + i}>{t.slice(2, -2)}</b>);
    else if (t.startsWith("`")) out.push(
      <code key={key + "-c" + i} style={{
        background: "#26262B", borderRadius: 5, padding: "1px 6px",
        fontFamily: "Consolas, Menlo, monospace", fontSize: "0.9em", color: "#F0A0A3",
      }}>{t.slice(1, -1)}</code>
    );
    else out.push(<i key={key + "-i" + i}>{t.slice(1, -1)}</i>);
    last = re.lastIndex; i++;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}

function Md({ text }) {
  const lines = text.split("\n");
  return (
    <span>
      {lines.map((ln, i) => {
        const h = ln.match(/^(#{1,4})\s+(.*)/);
        if (h) return (
          <div key={i} style={{ fontWeight: 700, fontSize: h[1].length <= 2 ? "1.15em" : "1.05em", margin: "10px 0 4px" }}>
            {fmtInline(h[2], i)}
          </div>
        );
        const li = ln.match(/^\s*[-*•]\s+(.*)/);
        if (li) return (
          <div key={i} style={{ paddingLeft: 16, position: "relative", margin: "2px 0" }}>
            <span style={{ position: "absolute", left: 2, color: "#E5484D" }}>•</span>
            {fmtInline(li[1], i)}
          </div>
        );
        const num = ln.match(/^\s*(\d+)[.)]\s+(.*)/);
        if (num) return (
          <div key={i} style={{ paddingLeft: 20, position: "relative", margin: "2px 0" }}>
            <span style={{ position: "absolute", left: 0, color: "#E5484D", fontWeight: 600 }}>{num[1]}.</span>
            {fmtInline(num[2], i)}
          </div>
        );
        if (ln.trim() === "") return <div key={i} style={{ height: 8 }} />;
        return <div key={i}>{fmtInline(ln, i)}</div>;
      })}
    </span>
  );
}

function CodeBlock({ lang, value, onPreview }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };
  return (
    <div style={{ margin: "10px 0", borderRadius: 12, overflow: "hidden", border: "1px solid #2A2A2E" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#1A1A1E", padding: "7px 12px",
        fontFamily: "system-ui, sans-serif", fontSize: 12, color: "#9A9AA2",
      }}>
        <span>{lang || "kod"}</span>
        <div style={{ display: "flex", gap: 8 }}>
          {looksLikeHtml(lang, value) && (
            <button onClick={() => onPreview(value)} style={{
              background: "#C41E24", color: "#FFF", border: "none",
              borderRadius: 7, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>▶ Ko'rish</button>
          )}
          <button onClick={copy} style={{
            background: "transparent", color: "#9A9AA2", border: "1px solid #3A3A40",
            borderRadius: 7, padding: "4px 12px", fontSize: 12, cursor: "pointer",
          }}>{copied ? "✓" : "Nusxalash"}</button>
        </div>
      </div>
      <pre style={{
        margin: 0, padding: 14, background: "#121216", color: "#D9D9DE",
        fontSize: 12.5, lineHeight: 1.55, overflowX: "auto",
        fontFamily: "Consolas, Menlo, monospace", maxHeight: 340,
      }}>{value}</pre>
    </div>
  );
}

const THEMES = {
  dark: {
    bg: "#0C0C0E", side: "#111114", card: "#161618", border: "#26262B",
    text: "#EDEDED", dim: "#9A9AA2", dim2: "#7A7A82", hover: "#222228",
    inputBg: "#0C0C0E", codeBg: "#121216", codeHead: "#1A1A1E", brd2: "#3A3A40",
  },
  light: {
    bg: "#FAF9F7", side: "#F2F0EC", card: "#FFFFFF", border: "#E3E0DA",
    text: "#1A1A1A", dim: "#6B6B6B", dim2: "#8A8A8A", hover: "#EDEAE4",
    inputBg: "#FFFFFF", codeBg: "#F5F3EF", codeHead: "#EAE7E1", brd2: "#D5D1C9",
  },
};

const LANGS = {
  uz: {
    newChat: "+ Yangi chat", chats: "💬 Chatlar", settings: "⚙️ Sozlash", admin: "🛠 Admin",
    modes: "Rejimlar", recents: "Oxirgilar", login: "Google bilan kirish", logout: "Chiqish",
    free: "{L.free}", placeholder: "JAY'ga xabar yozing...", send: "Yuborish",
    share: "📤 Ulashish", adminPanel: "Admin panel", settingsTitle: "Sozlash",
    nameLabel: "Ismingiz", extraLabel: "JAY uchun qo'shimcha ko'rsatma",
    extraPh: "Masalan: har doim juda qisqa javob ber...",
    saveNote: "O'zgarishlar avtomatik saqlanadi.",
    langLabel: "Til / Язык / Language",
    greet: (h) => h < 5 ? "Xayrli tun" : h < 11 ? "Xayrli tong" : h < 18 ? "Xayrli kun" : h < 23 ? "Xayrli kech" : "Xayrli tun",
    ttsLang: "uz-UZ",
    sysLang: "Interfeys tili: o'zbekcha. Asosan o'zbek tilida javob ber.",
    suggestions: ["✍️ Menga she'r yoz", "🐍 Python o'rgat", "🌍 Ingliz tiliga tarjima", "💡 Biznes g'oya ber"],
  },
  ru: {
    newChat: "+ Новый чат", chats: "💬 Чаты", settings: "⚙️ Настройки", admin: "🛠 Админ",
    modes: "Режимы", recents: "Недавние", login: "Войти через Google", logout: "Выйти",
    free: "Бесплатно · без лимита", placeholder: "Напишите JAY...", send: "Отправить",
    share: "📤 Поделиться", adminPanel: "Админ панель", settingsTitle: "Настройки",
    nameLabel: "Ваше имя", extraLabel: "Дополнительная инструкция для JAY",
    extraPh: "Например: отвечай всегда кратко...",
    saveNote: "Изменения сохраняются автоматически.",
    langLabel: "Til / Язык / Language",
    greet: (h) => h < 5 ? "Доброй ночи" : h < 11 ? "Доброе утро" : h < 18 ? "Добрый день" : h < 23 ? "Добрый вечер" : "Доброй ночи",
    ttsLang: "ru-RU",
    sysLang: "Язык интерфейса: русский. Отвечай в основном на русском языке.",
    suggestions: ["✍️ Напиши стихотворение", "🐍 Обучи Python", "🌍 Перевод на английский", "💡 Идея для бизнеса"],
  },
  en: {
    newChat: "+ New chat", chats: "💬 Chats", settings: "⚙️ Settings", admin: "🛠 Admin",
    modes: "Modes", recents: "Recents", login: "Sign in with Google", logout: "Sign out",
    free: "Free · unlimited", placeholder: "Message JAY...", send: "Send",
    share: "📤 Share", adminPanel: "Admin panel", settingsTitle: "Settings",
    nameLabel: "Your name", extraLabel: "Extra instruction for JAY",
    extraPh: "E.g.: always answer briefly...",
    saveNote: "Changes are saved automatically.",
    langLabel: "Til / Язык / Language",
    greet: (h) => h < 5 ? "Good night" : h < 11 ? "Good morning" : h < 18 ? "Good afternoon" : h < 23 ? "Good evening" : "Good night",
    ttsLang: "en-US",
    sysLang: "Interface language: English. Reply mainly in English.",
    suggestions: ["✍️ Write me a poem", "🐍 Teach me Python", "🌍 Translate to Uzbek", "💡 Give a business idea"],
  },
};

function AdminReply({ uid, onSent }) {
  const [txt, setTxt] = useState("");
  const send = async () => {
    if (!txt.trim()) return;
    await sendSupport(uid, { from: "admin", text: txt.trim(), ts: Date.now() });
    setTxt("");
    onSent && onSent();
  };
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
      <input value={txt} onChange={e => setTxt(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") send(); }}
        placeholder="Javob yozing..."
        style={{
          flex: 1, background: "#0C0C0E", color: "#EDEDED",
          border: "1px solid #3A3A40", borderRadius: 8, padding: "7px 10px",
          fontSize: 12.5, outline: "none", fontFamily: "system-ui, sans-serif",
        }} />
      <button onClick={send} style={{
        background: "#C41E24", color: "#FFF", border: "none", borderRadius: 8,
        padding: "0 14px", fontSize: 12, cursor: "pointer", fontWeight: 600,
      }}>➤</button>
    </div>
  );
}

const newConv = (mode = "chat") => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
  title: mode === "chat" ? "Yangi chat" : MODES[mode].label + " chat",
  msgs: [], mode,
});

export default function JayAI() {
  const [convs, setConvs] = useState([newConv()]);
  const [curId, setCurId] = useState(null);
  const [view, setView] = useState("chat"); // chat | artifacts | customize
  const [settings, setSettings] = useState({ name: "", extra: "", lang: "uz" });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(null);
  const [files, setFiles] = useState([]);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const [sideOpen, setSideOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [power, setPower] = useState("high"); // high | low
  const [user, setUser] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [meBlocked, setMeBlocked] = useState(false);
  const [mePremium, setMePremium] = useState(false);
  const [meLimit, setMeLimit] = useState(0);
  const dayRef = useRef({ date: "", count: 0 });
  const [viewUser, setViewUser] = useState(null);
  const [ann, setAnn] = useState(null); // e'lon
  const [annHide, setAnnHide] = useState(false);
  const [annDraft, setAnnDraft] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminSort, setAdminSort] = useState("updated");
  const [autoVoice, setAutoVoice] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("jay-theme") || "dark"; } catch (e) { return "dark"; }
  });
  const [guestMode, setGuestMode] = useState(() => {
    try { return localStorage.getItem("jay-guest") === "1"; } catch (e) { return false; }
  });
  const [streak, setStreak] = useState(1);
  const [chatSearch, setChatSearch] = useState("");
  const [regen, setRegen] = useState(0);
  const [supMsgs, setSupMsgs] = useState([]);      // mening yordam suhbatim
  const [supInput, setSupInput] = useState("");
  const [supUnread, setSupUnread] = useState(false);
  const [adminSup, setAdminSup] = useState([]);    // admin: barcha murojaatlar
  const [supOpen, setSupOpen] = useState(null);    // admin ochgan murojaat uid
  const fileRef = useRef(null);
  const endRef = useRef(null);

  const L = LANGS[settings.lang] || LANGS.uz;
  const T = THEMES[theme] || THEMES.dark;
  useEffect(() => {
    try { localStorage.setItem("jay-theme", theme); } catch (e) {}
    try { document.body.style.background = (THEMES[theme] || THEMES.dark).bg; } catch (e) {}
  }, [theme]);
  const cur = convs.find(c => c.id === curId) || convs[0];
  const msgs = cur ? cur.msgs : [];

  useEffect(() => {
    return watchUser(async (u) => {
      setUser(u);
      if (u) {
        const docData = await getUserDoc(u.uid);
        setMeBlocked(!!docData?.blocked);
        setMePremium(!!docData?.premium);
        setMeLimit(docData?.adminLimit || 0);
        dayRef.current = { date: docData?.dayDate || "", count: docData?.dayCount || 0 };
        if (!docData?.created) setUserField(u.uid, { created: Date.now() });
        const sup = await getSupport(u.uid);
        setSupMsgs(sup?.msgs || []);
        setSupUnread(!!sup?.unreadUser);
        const cloud = await loadCloud(u.uid);
        if (cloud && cloud.list && cloud.list.length) {
          setConvs(cloud.list);
          setCurId(cloud.cur || cloud.list[0].id);
        }
        if (u.displayName) setSettings(st => ({ ...st, name: st.name || u.displayName.split(" ")[0] }));
      }
    });
  }, []);

  useEffect(() => {
    // Kunlik streak
    try {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const saved = JSON.parse(localStorage.getItem("jay-streak") || "{}");
      let st = 1;
      if (saved.last === today) st = saved.streak || 1;
      else if (saved.last === yesterday) st = (saved.streak || 1) + 1;
      localStorage.setItem("jay-streak", JSON.stringify({ last: today, streak: st }));
      setStreak(st);
    } catch (e) {}
  }, []);

  useEffect(() => {
    (async () => {
      const a = await getAnnouncement();
      if (a && a.text) {
        setAnn(a);
        try {
          if (localStorage.getItem("jay-ann-seen") === String(a.ts)) setAnnHide(true);
        } catch (e) {}
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const v = localStorage.getItem("jay-convs");
        if (v) {
          const saved = JSON.parse(v);
          if (saved.list && saved.list.length) {
            setConvs(saved.list);
            setCurId(saved.cur || saved.list[0].id);
          }
        }
      } catch (e) {}
      try {
        const st = localStorage.getItem("jay-settings");
        if (st) setSettings(JSON.parse(st));
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const list = convs.map(c => ({
          ...c,
          msgs: c.msgs.slice(-30).map(m =>
            m.files ? { ...m, files: m.files.map(f => ({ kind: f.kind, name: f.name })) } : m
          ),
        })).slice(-15);
        const payload = { list, cur: cur?.id };
        localStorage.setItem("jay-convs", JSON.stringify(payload));
        if (user) saveCloud(user.uid, payload, { name: user.displayName, email: user.email });
      } catch (e) {}
    })();
  }, [convs, curId, ready, user]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try { localStorage.setItem("jay-settings", JSON.stringify(settings)); } catch (e) {}
    })();
  }, [settings, ready]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const updateCur = (fn) => setConvs(cs => cs.map(c => (c.id === cur.id ? fn(c) : c)));

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/```[\s\S]*?```/g, " ").replace(/[#*_`]/g, "");
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = L.ttsLang;
      u.rate = 1.0;
      u.pitch = 1.0;
      // Tilga mos eng yaxshi ovozni tanlash (Google ovozlari sifatliroq)
      const voices = window.speechSynthesis.getVoices();
      const pref = L.ttsLang.slice(0, 2);
      const best =
        voices.find(v => v.lang.startsWith(pref) && v.name.includes("Google")) ||
        voices.find(v => v.lang.startsWith(pref)) ||
        voices.find(v => v.lang.startsWith("ru") && v.name.includes("Google")) ||
        voices.find(v => v.lang.startsWith("ru"));
      if (best) u.voice = best;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  };

  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Brauzeringiz ovozni qo'llamaydi. Chrome ishlating."); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = "uz-UZ";
    rec.interimResults = true;
    rec.onresult = (e) => {
      let t = "";
      for (const r of e.results) t += r[0].transcript;
      setInput(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const sendSup = async () => {
    const text = supInput.trim();
    if (!text || !user) return;
    const msg = { from: "user", text, ts: Date.now() };
    setSupMsgs(m => [...m, msg]);
    setSupInput("");
    await sendSupport(user.uid, msg, { name: user.displayName, email: user.email });
  };

  const regenerate = async () => {
    if (loading || !cur || cur.msgs.length < 2) return;
    // Oxirgi assistant javobini olib tashlab, oxirgi user xabarini qayta yuboramiz
    const msgs = [...cur.msgs];
    while (msgs.length && msgs[msgs.length - 1].role === "assistant") msgs.pop();
    if (!msgs.length) return;
    updateCur(c => ({ ...c, msgs }));
    setLoading(true);
    const system = BASE_SYSTEM + "\n\n" + L.sysLang
      + (power === "low" ? "\n\nJUDA QISQA javob ber — 1-3 jumla, faqat eng muhimi." : "")
      + (settings.name ? "\n\nFoydalanuvchining ismi: " + settings.name + "." : "");
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_tokens: 4000, system, messages: msgs.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply = (data.content || []).map(c => c.type === "text" ? c.text : "").filter(Boolean).join("\n") || "Javob kelmadi.";
      updateCur(c => ({ ...c, msgs: [...msgs, { role: "assistant", content: reply }] }));
      if (autoVoice) speak(reply);
    } catch (e) {
      updateCur(c => ({ ...c, msgs: [...msgs, { role: "assistant", content: "Xatolik." }] }));
    }
    setLoading(false);
  };

  const copyText = (t) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = t; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    } catch (e) {}
  };

  const shareChat = () => {
    if (!cur || cur.msgs.length === 0) return;
    const text = "JAY AI suhbati — " + cur.title + "\n\n" +
      cur.msgs.map(m => (m.role === "user" ? "Men: " : "JAY: ") + m.content).join("\n\n");
    try {
      if (navigator.share) { navigator.share({ title: "JAY AI", text }); return; }
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      alert("Suhbat nusxalandi! Istalgan joyga tashlang.");
    } catch (e) {}
  };

  const pickFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    const out = [];
    for (const f of list.slice(0, 4)) {
      const isImg = f.type.startsWith("image/");
      const isPdf = f.type === "application/pdf";
      if (!isImg && !isPdf) continue;
      if (f.size > 4 * 1024 * 1024) continue;
      try {
        const data = await fileToB64(f);
        out.push({ kind: isImg ? "image" : "document", media_type: f.type, data, name: f.name });
      } catch (err) {}
    }
    setFiles(fs => [...fs, ...out].slice(0, 4));
    if (fileRef.current) fileRef.current.value = "";
  };

  const genImage = async (text, newMsgs) => {
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (data.b64) {
        updateCur(c => ({ ...c, msgs: [...newMsgs, { role: "assistant", content: "Mana rasmingiz! 🖼", image: "data:image/png;base64," + data.b64 }] }));
      } else {
        updateCur(c => ({ ...c, msgs: [...newMsgs, { role: "assistant", content: "Rasm yaratilmadi: " + (data.error || "noma'lum xato") }] }));
      }
    } catch (e) {
      updateCur(c => ({ ...c, msgs: [...newMsgs, { role: "assistant", content: "Rasm serverida xatolik." }] }));
    }
    setLoading(false);
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && files.length === 0) || loading || !cur) return;
    if (meBlocked) {
      updateCur(c => ({ ...c, msgs: [...c.msgs, { role: "assistant", content: "⛔ Kechirasiz, hisobingiz administrator tomonidan bloklangan." }] }));
      setInput("");
      return;
    }
    if (user && !mePremium && meLimit > 0) {
      const today = new Date().toDateString();
      if (dayRef.current.date !== today) dayRef.current = { date: today, count: 0 };
      if (dayRef.current.count >= meLimit) {
        updateCur(c => ({ ...c, msgs: [...c.msgs, { role: "assistant", content: "⏳ Bugungi limitingiz tugadi (" + meLimit + " ta xabar). Ertaga davom etasiz!" }] }));
        setInput("");
        return;
      }
      dayRef.current.count++;
      setUserField(user.uid, { dayCount: dayRef.current.count, dayDate: today });
    }
    const newMsgs = [...msgs, { role: "user", content: text || "Faylni ko'rib chiq", files }];
    updateCur(c => ({
      ...c, msgs: newMsgs,
      title: c.msgs.length === 0 && text ? text.slice(0, 32) : c.title,
    }));
    setInput("");
    setFiles([]);
    setLoading(true);
    if (cur.mode === "image" && text) { genImage(text, newMsgs); return; }
    const system = BASE_SYSTEM
      + "\n\n" + L.sysLang
      + (power === "low" ? "\n\nJUDA QISQA javob ber — 1-3 jumla, faqat eng muhimi." : "")
      + (MODES[cur.mode || "chat"]?.extra || "")
      + (settings.name ? `\n\nFoydalanuvchining ismi: ${settings.name}.` : "")
      + (settings.extra ? `\n\nFoydalanuvchining qo'shimcha ko'rsatmasi: ${settings.extra}` : "");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 4000,
          system,
          messages: newMsgs.map(m => {
            if (m.files && m.files.length && m.files.some(f => f.data)) {
              const blocks = m.files.filter(f => f.data).map(f =>
                f.kind === "image"
                  ? { type: "image", source: { type: "base64", media_type: f.media_type, data: f.data } }
                  : { type: "document", source: { type: "base64", media_type: "application/pdf", data: f.data } }
              );
              blocks.push({ type: "text", text: m.content || "Faylni ko'rib chiq" });
              return { role: m.role, content: blocks };
            }
            return { role: m.role, content: m.image ? (m.content || "Rasm yaratildi") : m.content };
          }),
        }),
      });
      const data = await res.json();
      const reply = (data.content || [])
        .map(c => (c.type === "text" ? c.text : ""))
        .filter(Boolean)
        .join("\n") || "Kechirasiz, javob kelmadi. Qayta urinib ko'ring.";
      updateCur(c => ({ ...c, msgs: [...c.msgs, { role: "assistant", content: reply }] }));
      if (autoVoice) speak(reply);
    } catch (e) {
      updateCur(c => ({ ...c, msgs: [...c.msgs, { role: "assistant", content: "Xatolik yuz berdi. Qayta urinib ko'ring." }] }));
    }
    setLoading(false);
  };

  const addChat = (mode = "chat") => {
    const c = newConv(mode);
    setConvs(cs => [c, ...cs]);
    setCurId(c.id);
    setView("chat");
    if (isMobile) setSideOpen(false);
  };

  const delChat = (id, e) => {
    e.stopPropagation();
    setConvs(cs => {
      const left = cs.filter(c => c.id !== id);
      const next = left.length ? left : [newConv()];
      if (id === cur?.id) setCurId(next[0].id);
      return next;
    });
  };

  // Artifacts: barcha chatlardagi HTML kodlar
  const artifacts = [];
  convs.forEach(c => {
    c.msgs.forEach(m => {
      if (m.role !== "assistant") return;
      parseContent(m.content).forEach(p => {
        if (p.type === "code" && looksLikeHtml(p.lang, p.value)) {
          artifacts.push({ chat: c.title, code: p.value });
        }
      });
    });
  });

  const S = {
    sideBtn: {
      display: "flex", alignItems: "center", gap: 10, width: "100%",
      background: "transparent", border: "none", color: T.text,
      padding: "9px 12px", borderRadius: 10, fontSize: 14, cursor: "pointer",
      fontFamily: "system-ui, sans-serif", textAlign: "left",
    },
    sect: {
      fontSize: 11, color: T.dim2, padding: "10px 12px 5px",
      fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 1,
    },
    inp: {
      width: "100%", background: T.card, border: "1px solid " + T.brd2, color: T.text,
      borderRadius: 12, padding: "11px 14px", fontSize: 14, outline: "none",
      fontFamily: "system-ui, sans-serif", boxSizing: "border-box",
    },
  };

  const inputBar = (
            <div style={{ padding: "12px 16px 18px" }}>
              {files.length > 0 && (
                <div style={{
                  maxWidth: 760, margin: "0 auto 8px", display: "flex", gap: 8, flexWrap: "wrap",
                  fontFamily: "system-ui, sans-serif",
                }}>
                  {files.map((f, k) => (
                    <span key={k} style={{
                      background: T.hover, border: "1px solid " + T.brd2, borderRadius: 10,
                      padding: "5px 10px", fontSize: 12, color: T.text,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {f.kind === "image" ? "🖼" : "📄"} {f.name}
                      <span onClick={() => setFiles(fs => fs.filter((_, i) => i !== k))}
                        style={{ cursor: "pointer", color: "#E5484D", fontWeight: 700 }}>×</span>
                    </span>
                  ))}
                </div>
              )}
              <div style={{
                maxWidth: 760, margin: "0 auto", display: "flex", gap: 10,
                background: T.card, border: "1px solid " + T.border, borderRadius: 18,
                padding: 8, boxShadow: "0 2px 12px rgba(196,30,36,0.12)",
              }}>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple
                  onChange={pickFiles} style={{ display: "none" }} />
                <button onClick={() => fileRef.current?.click()} title="Rasm yoki PDF biriktirish" style={{
                  background: "transparent", border: "1px solid " + T.brd2, color: T.text,
                  borderRadius: 12, padding: isMobile ? "0 9px" : "0 14px", fontSize: isMobile ? 15 : 17, cursor: "pointer",
                }}>📎</button>
                <button onClick={toggleMic} title="Ovoz bilan yozish" style={{
                  background: listening ? "#C41E24" : "transparent",
                  border: "1px solid " + (listening ? "#C41E24" : T.brd2),
                  color: T.text, borderRadius: 12, padding: isMobile ? "0 9px" : "0 14px", fontSize: isMobile ? 15 : 17, cursor: "pointer",
                }}>🎙</button>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={L.placeholder}
                  rows={1}
                  style={{
                    flex: 1, resize: "none", background: "transparent", color: T.text,
                    border: "none", padding: "10px 12px",
                    fontSize: 15, outline: "none", fontFamily: "system-ui, sans-serif",
                  }}
                />
                <button onClick={() => setPower(pw => pw === "high" ? "low" : "high")}
                  title="Javob rejimi" style={{
                  background: "transparent", border: "none", color: T.dim,
                  fontSize: 12.5, cursor: "pointer", fontFamily: "system-ui, sans-serif",
                  display: "flex", alignItems: "center", gap: 4, padding: "0 6px", whiteSpace: "nowrap",
                }}>
                  {!isMobile && <span style={{ fontWeight: 700, color: T.text }}>JAY 5</span>}
                  <span style={{ color: "#E5484D" }}>{power === "high" ? "High" : "Low"}</span>
                  <span style={{ fontSize: 9 }}>▼</span>
                </button>
                <button onClick={send} disabled={loading || (!input.trim() && files.length === 0)} style={{
                  background: loading || (!input.trim() && files.length === 0) ? T.hover : "#C41E24",
                  color: loading || (!input.trim() && files.length === 0) ? T.dim2 : "#FFF",
                  border: "none", borderRadius: 12, padding: isMobile ? "0 13px" : "0 20px", fontWeight: 600,
                  fontSize: isMobile ? 13 : 14, cursor: loading ? "default" : "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}>{isMobile ? "➤" : L.send}</button>
              </div>
            </div>
  );

  // ===== KIRISH SAHIFASI =====
  if (!user && !guestMode) {
    return (
      <div style={{
        minHeight: "100vh", background: T.bg, color: T.text,
        display: "flex", flexDirection: "column", fontFamily: "Georgia, serif",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: isMobile ? "16px 18px" : "22px 34px",
        }}>
          <Logo size={26} />
          <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.3px" }}>JAY AI</span>
          <button onClick={() => setTheme(t2 => t2 === "dark" ? "light" : "dark")} style={{
            marginLeft: "auto", background: "transparent", border: "1px solid " + T.brd2,
            color: T.text, borderRadius: 8, padding: "5px 10px", fontSize: 14, cursor: "pointer",
          }}>{theme === "dark" ? "☀️" : "🌙"}</button>
        </div>

        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: isMobile ? "10px 18px 50px" : "10px 34px 70px",
        }}>
          <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <Logo size={54} />
            </div>

            <div style={{
              fontSize: isMobile ? 34 : 44, fontWeight: 500, letterSpacing: "-1.5px", lineHeight: 1.15,
            }}>Savolingiz bormi?</div>

            <div style={{
              color: T.dim, fontSize: isMobile ? 14.5 : 16, marginTop: 12,
              fontFamily: "system-ui, sans-serif",
            }}>JAY AI — bepul o'zbek sun'iy intellekt yordamchingiz</div>

            <div style={{
              background: T.card, border: "1px solid " + T.border, borderRadius: 18,
              padding: isMobile ? 20 : 26, marginTop: 30,
            }}>
              <button onClick={() => loginGoogle().catch(() => {})} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                width: "100%", background: "#FFF", color: "#1A1A1A", border: "none",
                borderRadius: 12, padding: "13px 0", fontSize: 14.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "system-ui, sans-serif",
              }}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.9 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.9 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
                Google bilan kirish
              </button>

              <div style={{
                display: "flex", alignItems: "center", gap: 10, margin: "16px 0",
                color: T.dim2, fontSize: 12, fontFamily: "system-ui, sans-serif",
              }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                YOKI
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>

              <button onClick={() => {
                setGuestMode(true);
                try { localStorage.setItem("jay-guest", "1"); } catch (e) {}
              }} style={{
                width: "100%", background: "transparent", border: "1px solid " + T.brd2,
                color: T.text, borderRadius: 12, padding: "12px 0", fontSize: 14,
                cursor: "pointer", fontFamily: "system-ui, sans-serif",
              }}>Hisobsiz davom etish</button>

              <div style={{
                fontSize: 11.5, color: T.dim2, marginTop: 14, lineHeight: 1.5,
                fontFamily: "system-ui, sans-serif",
              }}>Kirsangiz — suhbatlaringiz saqlanadi va istalgan qurilmadan ochiladi.</div>
            </div>

            <a href="https://t.me/jayai_uz_bot" target="_blank" rel="noopener" style={{
              display: "inline-block", marginTop: 22, color: T.dim,
              fontSize: 13.5, fontFamily: "system-ui, sans-serif", textDecoration: "none",
            }}>✈️ Telegram botda ham ishlaydi</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh", display: "flex",
      background: T.bg, fontFamily: "Georgia, serif", color: T.text, overflow: "hidden",
    }}>
      {/* ===== Yon panel ===== */}
      {sideOpen && isMobile && (
        <div onClick={() => setSideOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 39,
        }} />
      )}
      {sideOpen && (
        <div style={{
          width: 250, flexShrink: 0, background: T.side,
          borderRight: "1px solid #26262B", display: "flex", flexDirection: "column",
          padding: "14px 10px",
          ...(isMobile ? {
            position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 40,
            boxShadow: "4px 0 24px rgba(0,0,0,0.5)",
          } : {}),
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 14px" }}>
            <Logo size={26} />
            <span style={{ fontWeight: 700, fontSize: 18 }}>JAY</span>
          </div>

          <button onClick={() => addChat("chat")} style={{
            ...S.sideBtn, background: "#C41E24", color: "#FFF",
            fontWeight: 600, justifyContent: "center", marginBottom: 10,
          }}>{L.newChat}</button>

          <button onClick={() => setView("chat")} style={{ ...S.sideBtn, background: view === "chat" ? T.hover : "transparent" }}>
            {L.chats}
          </button>
          <button onClick={() => setView("artifacts")} style={{ ...S.sideBtn, background: view === "artifacts" ? T.hover : "transparent" }}>
            📦 Artifacts {artifacts.length > 0 && <span style={{
              background: "#C41E24", borderRadius: 10, fontSize: 11, padding: "1px 7px", marginLeft: "auto",
            }}>{artifacts.length}</span>}
          </button>
          <button onClick={() => setView("customize")} style={{ ...S.sideBtn, background: view === "customize" ? T.hover : "transparent" }}>
            {L.settings}
          </button>
          <button onClick={async () => {
            setView("support");
            if (isMobile) setSideOpen(false);
            if (user) {
              const sup = await getSupport(user.uid);
              setSupMsgs(sup?.msgs || []);
              setSupUnread(false);
              markSupportRead(user.uid, "user");
            }
          }} style={{ ...S.sideBtn, background: view === "support" ? T.hover : "transparent" }}>
            🆘 Yordam {supUnread && <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "#E5484D", marginLeft: "auto",
            }} />}
          </button>
          <button onClick={() => { setView("favs"); if (isMobile) setSideOpen(false); }}
            style={{ ...S.sideBtn, background: view === "favs" ? T.hover : "transparent" }}>
            ⭐ Saqlanganlar
          </button>
          <a href="https://t.me/jayai_uz_bot" target="_blank" rel="noopener" style={{
            ...S.sideBtn, textDecoration: "none",
          }}>✈️ Telegram bot</a>
          {user && user.email === ADMIN_EMAIL && (
            <button onClick={async () => { setView("admin"); setAdminUsers(await listUsers()); setAdminSup(await listSupport()); }}
              style={{ ...S.sideBtn, background: view === "admin" ? T.hover : "transparent" }}>
              {L.admin}
            </button>
          )}

          <div style={S.sect}>{L.modes}</div>
          <button onClick={() => addChat("code")} style={S.sideBtn}>
            <span style={{ color: "#E5484D", fontFamily: "monospace", fontWeight: 700 }}>&lt;/&gt;</span> Code
          </button>
          <button onClick={() => addChat("design")} style={S.sideBtn}>🎨 Design</button>

          <div style={S.sect}>{L.recents}</div>
          <input value={chatSearch} onChange={e => setChatSearch(e.target.value)}
            placeholder="🔍 Qidirish..."
            style={{
              background: T.card, color: T.text, border: "1px solid " + T.border,
              borderRadius: 10, padding: "7px 12px", fontSize: 12.5, outline: "none",
              fontFamily: "system-ui, sans-serif", margin: "0 2px 8px",
            }} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            {[...convs].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).filter(c => !chatSearch.trim() || c.title.toLowerCase().includes(chatSearch.trim().toLowerCase())).map(c => (
              <div key={c.id} onClick={() => { setCurId(c.id); setView("chat"); if (isMobile) setSideOpen(false); }} style={{
                ...S.sideBtn,
                background: c.id === cur?.id && view === "chat" ? T.hover : "transparent",
                justifyContent: "space-between", marginBottom: 2,
              }}>
                <span style={{
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontSize: 13.5,
                }}>{c.mode === "code" ? "‹› " : c.mode === "design" ? "🎨 " : ""}{c.title}</span>
                <span onClick={e => {
                  e.stopPropagation();
                  setConvs(cs => cs.map(x => x.id === c.id ? { ...x, pinned: !x.pinned } : x));
                }} style={{
                  color: c.pinned ? "#F5C518" : T.dim2, fontSize: 12, padding: "0 3px", cursor: "pointer",
                }} title="Qadab qo'yish">📌</span>
                <span onClick={e => {
                  e.stopPropagation();
                  const nn = window.prompt("Yangi nom:", c.title);
                  if (nn && nn.trim()) setConvs(cs => cs.map(x => x.id === c.id ? { ...x, title: nn.trim().slice(0, 40) } : x));
                }} style={{
                  color: T.dim2, fontSize: 12, padding: "0 3px", cursor: "pointer",
                }}>✎</span>
                <span onClick={e => delChat(c.id, e)} style={{
                  color: T.dim2, fontSize: 15, padding: "0 4px", cursor: "pointer",
                }}>×</span>
              </div>
            ))}
          </div>

          <div style={{
            padding: "12px 8px 4px", borderTop: "1px solid #26262B",
            fontFamily: "system-ui, sans-serif",
          }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                  : <div style={{
                      width: 32, height: 32, borderRadius: "50%", background: "#C41E24",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 14, color: "#FFF",
                    }}>{(user.displayName || "U")[0].toUpperCase()}</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{user.displayName || user.email}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {mePremium && <span style={{ fontSize: 11, color: "#F5C518" }}>💎 Premium</span>}
                    <span onClick={() => {
                      try { localStorage.removeItem("jay-guest"); } catch (e) {}
                      setGuestMode(false);
                      logout();
                    }} style={{ fontSize: 11, color: "#E5484D", cursor: "pointer" }}>{L.logout}</span>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => {
                setGuestMode(false);
                try { localStorage.removeItem("jay-guest"); } catch (e) {}
              }} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", background: "#FFF", color: "#1A1A1E", border: "none",
                borderRadius: 10, padding: "9px 0", fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "system-ui, sans-serif",
              }}>
                <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.9 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.9 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
                {L.login}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== Asosiy qism ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
          borderBottom: "1px solid #26262B",
        }}>
          <button onClick={() => setTheme(t2 => t2 === "dark" ? "light" : "dark")}
            title="Yorug'/qorong'i" style={{
            background: "transparent", border: "1px solid " + T.brd2, color: T.text,
            borderRadius: 8, padding: "5px 10px", fontSize: 14, cursor: "pointer", marginRight: 6,
          }}>{theme === "dark" ? "☀️" : "🌙"}</button>
          <button onClick={() => setSideOpen(o => !o)} style={{
            background: "transparent", border: "1px solid " + T.brd2, color: T.text,
            borderRadius: 8, padding: "5px 11px", fontSize: 15, cursor: "pointer",
          }}>☰</button>
          <span title="Ketma-ket kunlar" style={{
            fontFamily: "system-ui, sans-serif", fontSize: 13, color: "#F5A623",
            background: "#2A1F0E", border: "1px solid #5C4A00", borderRadius: 10,
            padding: "3px 10px", fontWeight: 700, whiteSpace: "nowrap",
          }}>🔥 {streak}</span>
          <span style={{ fontWeight: 700, fontSize: 16, flex: 1 }}>
            {view === "artifacts" ? "Artifacts" : view === "customize" ? L.settingsTitle : view === "admin" ? L.adminPanel : view === "support" ? "🆘 Yordam" : view === "favs" ? "⭐ Saqlanganlar" : (cur?.title || "JAY AI")}
          </span>
          {view === "chat" && msgs.length > 0 && (
            <button onClick={() => {
              const txt = "JAY AI — " + (cur?.title || "Suhbat") + "\n\n" +
                msgs.map(m => (m.role === "user" ? "👤 Men: " : "🤖 JAY: ") + m.content).join("\n\n");
              const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = (cur?.title || "suhbat").replace(/[^a-zA-Z0-9а-яА-Яёo'gʻ ]/g, "").slice(0, 30) + ".txt";
              a.click();
              URL.revokeObjectURL(a.href);
            }} title="Yuklab olish" style={{
              background: "transparent", border: "1px solid " + T.brd2, color: T.text,
              borderRadius: 8, padding: "5px 10px", fontSize: 13, cursor: "pointer",
              fontFamily: "system-ui, sans-serif", marginRight: 6,
            }}>📥</button>
          )}
          {view === "chat" && msgs.length > 0 && (
            <button onClick={shareChat} title="Suhbatni ulashish" style={{
              background: "transparent", border: "1px solid " + T.brd2, color: T.text,
              borderRadius: 8, padding: "5px 12px", fontSize: 13, cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}>{L.share}</button>
          )}
          {view === "chat" && cur?.mode && cur.mode !== "chat" && (
            <span style={{
              background: T.hover, border: "1px solid " + T.brd2, borderRadius: 8,
              fontSize: 11, padding: "3px 10px", color: "#E5484D",
              fontFamily: "system-ui, sans-serif", fontWeight: 600,
            }}>{MODES[cur.mode].label} rejimi</span>
          )}
        </div>

        {/* ==== ARTIFACTS ko'rinishi ==== */}
        {view === "artifacts" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              {artifacts.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: 80, color: T.dim, fontFamily: "system-ui, sans-serif" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                  Hali artifactlar yo'q.<br />JAY sayt yasaganda, hammasi shu yerda to'planadi.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                  {artifacts.map((a, i) => (
                    <div key={i} style={{
                      background: T.card, border: "1px solid " + T.border, borderRadius: 14,
                      padding: 16, fontFamily: "system-ui, sans-serif",
                    }}>
                      <div style={{ fontSize: 26, marginBottom: 8 }}>🌐</div>
                      <div style={{
                        fontSize: 13, fontWeight: 600, marginBottom: 4,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{a.chat}</div>
                      <div style={{ fontSize: 11, color: T.dim, marginBottom: 12 }}>HTML sayt</div>
                      <button onClick={() => setPreview(a.code)} style={{
                        background: "#C41E24", color: "#FFF", border: "none", width: "100%",
                        borderRadius: 9, padding: "8px 0", fontSize: 13, cursor: "pointer", fontWeight: 600,
                      }}>▶ Ochish</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==== SOZLASH ko'rinishi ==== */}
        {view === "customize" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 520, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
              <div style={{ fontSize: 13, color: T.dim, marginBottom: 6 }}>{L.langLabel}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[["uz", "O'zbekcha"], ["ru", "Русский"], ["en", "English"]].map(([code, label]) => (
                  <button key={code} onClick={() => setSettings(st => ({ ...st, lang: code }))} style={{
                    flex: 1, padding: "10px 0", borderRadius: 12, cursor: "pointer",
                    fontFamily: "system-ui, sans-serif", fontSize: 13.5, fontWeight: 600,
                    background: (settings.lang || "uz") === code ? "#C41E24" : T.card,
                    border: "1px solid " + ((settings.lang || "uz") === code ? "#C41E24" : T.brd2),
                    color: (settings.lang || "uz") === code ? "#FFF" : T.text,
                  }}>{label}</button>
                ))}
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: T.card, border: "1px solid " + T.border, borderRadius: 12,
                padding: "12px 14px", marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>🗣 Avtomatik ovoz</div>
                  <div style={{ fontSize: 11.5, color: T.dim }}>JAY javoblarini o'zi ovozda o'qib bersin</div>
                </div>
                <div onClick={() => setAutoVoice(v => !v)} style={{
                  width: 46, height: 26, borderRadius: 13, cursor: "pointer",
                  background: autoVoice ? "#C41E24" : T.brd2, position: "relative", transition: "0.2s",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", background: "#FFF",
                    position: "absolute", top: 3, left: autoVoice ? 23 : 3, transition: "0.2s",
                  }} />
                </div>
              </div>

              {user && (() => {
                const myMsgs = convs.reduce((n, c) => n + c.msgs.filter(m => m.role === "user").length, 0);
                const refLink = "https://t.me/jayai_uz_bot?start=" + (user.uid || "").slice(0, 8);
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1, background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#E5484D" }}>{myMsgs}</div>
                        <div style={{ fontSize: 11, color: T.dim }}>Yuborilgan xabar</div>
                      </div>
                      <div style={{ flex: 1, background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#E5484D" }}>{convs.length}</div>
                        <div style={{ fontSize: 11, color: T.dim }}>Suhbatlar</div>
                      </div>
                      <div style={{ flex: 1, background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: mePremium ? "#F5C518" : T.dim }}>{mePremium ? "💎" : "—"}</div>
                        <div style={{ fontSize: 11, color: T.dim }}>Premium</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: T.dim, marginBottom: 6 }}>🎁 Do'stni taklif qiling</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input readOnly value={refLink} style={{
                        flex: 1, background: T.card, color: T.dim, border: "1px solid " + T.brd2,
                        borderRadius: 10, padding: "9px 12px", fontSize: 12, fontFamily: "system-ui, sans-serif",
                      }} />
                      <button onClick={() => copyText(refLink)} style={{
                        background: "#C41E24", color: "#FFF", border: "none", borderRadius: 10,
                        padding: "0 16px", fontSize: 13, cursor: "pointer", fontWeight: 600,
                      }}>Nusxa</button>
                    </div>
                  </div>
                );
              })()}

              <div style={{ fontSize: 13, color: T.dim, marginBottom: 6 }}>{L.nameLabel}</div>
              <input value={settings.name}
                onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
                style={{ ...S.inp, marginBottom: 20 }} placeholder="Ismingiz" />

              <div style={{ fontSize: 13, color: T.dim, marginBottom: 6 }}>
                {L.extraLabel}
              </div>
              <textarea value={settings.extra}
                onChange={e => setSettings(s => ({ ...s, extra: e.target.value }))}
                rows={5}
                style={{ ...S.inp, resize: "vertical" }}
                placeholder={L.extraPh} />
              <div style={{ fontSize: 12, color: T.dim2, marginTop: 10 }}>
                {L.saveNote}
              </div>

              <div style={{
                marginTop: 24, paddingTop: 18, borderTop: "1px solid " + T.border,
              }}>
                <div style={{ fontSize: 13, color: T.dim, marginBottom: 8 }}>🧹 Tozalash</div>
                <button onClick={() => {
                  if (window.confirm("Barcha suhbatlar o'chirilsinmi? Bu amalni qaytarib bo'lmaydi!")) {
                    const fresh = newConv();
                    setConvs([fresh]);
                    setCurId(fresh.id);
                    setView("chat");
                  }
                }} style={{
                  background: "transparent", border: "1px solid #C41E24", color: "#E5484D",
                  borderRadius: 12, padding: "10px 18px", fontSize: 13.5, cursor: "pointer",
                  fontWeight: 600, fontFamily: "system-ui, sans-serif",
                }}>🗑 Barcha chatlarni o'chirish</button>
              </div>
            </div>
          </div>
        )}

        {/* ==== SAQLANGANLAR ==== */}
        {view === "favs" && (() => {
          const favs = [];
          convs.forEach(c => c.msgs.forEach(m => {
            if (m.fav && m.role === "assistant") favs.push({ chat: c.title, content: m.content });
          }));
          return (
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 14 : 24 }}>
              <div style={{ maxWidth: 720, margin: "0 auto" }}>
                {favs.length === 0 ? (
                  <div style={{ textAlign: "center", marginTop: 60, color: T.dim, fontFamily: "system-ui, sans-serif" }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>⭐</div>
                    Hali saqlangan javoblar yo'q.<br/>Yoqqan javob ostidagi ☆ ni bosing.
                  </div>
                ) : favs.map((f, i) => (
                  <div key={i} style={{
                    background: T.card, border: "1px solid " + T.border, borderRadius: 14,
                    padding: 16, marginBottom: 12,
                  }}>
                    <div style={{ fontSize: 11, color: "#F5C518", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>
                      ⭐ {f.chat}
                    </div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.6 }}><Md text={f.content} /></div>
                    <button onClick={() => copyText(f.content)} style={{
                      marginTop: 10, background: "transparent", border: "1px solid " + T.brd2,
                      color: T.dim, borderRadius: 8, padding: "5px 14px", fontSize: 12, cursor: "pointer",
                      fontFamily: "system-ui, sans-serif",
                    }}>📋 Nusxalash</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ==== YORDAM ko'rinishi ==== */}
        {view === "support" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 12 : 24 }}>
              <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
                {!user ? (
                  <div style={{ textAlign: "center", marginTop: 60, color: T.dim }}>
                    Yordam bo'limidan foydalanish uchun avval Google bilan kiring.
                  </div>
                ) : (
                  <>
                    <div style={{
                      background: T.card, border: "1px solid " + T.border, borderRadius: 12,
                      padding: "10px 14px", marginBottom: 16, fontSize: 13, color: T.dim,
                    }}>
                      Savol yoki muammoingizni yozing — administrator tez orada javob beradi.
                    </div>
                    {supMsgs.map((m, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                        marginBottom: 10,
                      }}>
                        <div style={{
                          maxWidth: "80%", padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
                          whiteSpace: "pre-wrap", wordBreak: "break-word",
                          borderRadius: m.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          background: m.from === "user" ? "#C41E24" : T.card,
                          border: m.from === "user" ? "none" : "1px solid #26262B",
                          color: T.text,
                        }}>
                          {m.from === "admin" && <div style={{ fontSize: 10, color: "#E5484D", fontWeight: 700, marginBottom: 3 }}>👑 ADMIN</div>}
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            {user && (
              <div style={{ padding: "10px 14px 16px" }}>
                <div style={{
                  maxWidth: 640, margin: "0 auto", display: "flex", gap: 8,
                  background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: 6,
                }}>
                  <textarea value={supInput} onChange={e => setSupInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendSup(); } }}
                    placeholder="Xabar yozing..." rows={1}
                    style={{
                      flex: 1, resize: "none", background: "transparent", color: T.text,
                      border: "none", padding: "9px 10px", fontSize: 14, outline: "none",
                      fontFamily: "system-ui, sans-serif",
                    }} />
                  <button onClick={sendSup} disabled={!supInput.trim()} style={{
                    background: supInput.trim() ? "#C41E24" : T.hover,
                    color: supInput.trim() ? "#FFF" : T.dim2,
                    border: "none", borderRadius: 10, padding: "0 16px", fontWeight: 600,
                    fontSize: 13, cursor: "pointer", fontFamily: "system-ui, sans-serif",
                  }}>➤</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==== ADMIN ko'rinishi ==== */}
        {view === "admin" && (() => {
          const today = new Date().toDateString();
          const activeToday = adminUsers.filter(u => u.updated && new Date(u.updated).toDateString() === today).length;
          const newToday = adminUsers.filter(u => u.created && new Date(u.created).toDateString() === today).length;

          const q = adminSearch.trim().toLowerCase();
          let list = adminUsers.filter(u =>
            !q || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
          );
          list = [...list].sort((a, b) =>
            adminSort === "msgs" ? b.msgs - a.msgs :
            adminSort === "created" ? b.created - a.created :
            b.updated - a.updated
          );

          // Grafik: oxirgi 14 kunda yangi foydalanuvchilar
          const days = [];
          for (let i = 13; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toDateString();
            days.push({
              label: d.getDate(),
              n: adminUsers.filter(u => u.created && new Date(u.created).toDateString() === key).length,
            });
          }
          const maxN = Math.max(1, ...days.map(d => d.n));

          // So'nggi xabarlar lentasi
          const feed = [];
          [...adminUsers].sort((a, b) => b.updated - a.updated).slice(0, 10).forEach(u => {
            try {
              const chats = JSON.parse(u.data).list || [];
              const last = chats[0];
              const lastMsg = (last?.msgs || []).filter(m => m.role === "user").slice(-1)[0];
              if (lastMsg) feed.push({ name: u.name || u.email, text: lastMsg.content });
            } catch (e) {}
          });

          return (
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 12 : 24 }}>
            <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

              {/* Statistika kartalari */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                {[
                  ["Foydalanuvchilar", adminUsers.length],
                  ["Bugun faol", activeToday],
                  ["Bugun yangi", newToday],
                  ["Jami xabarlar", adminUsers.reduce((n, u) => n + u.msgs, 0)],
                ].map(([t, v]) => (
                  <div key={t} style={{
                    flex: 1, minWidth: 120, background: T.card, border: "1px solid " + T.border,
                    borderRadius: 12, padding: 12,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#E5484D" }}>{v}</div>
                    <div style={{ fontSize: 11, color: T.dim }}>{t}</div>
                  </div>
                ))}
              </div>

              {/* O'sish grafigi */}
              <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: T.dim, marginBottom: 10 }}>📈 Yangi foydalanuvchilar (14 kun)</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 70 }}>
                  {days.map((d, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div title={d.n} style={{
                        height: Math.max(3, (d.n / maxN) * 55), background: d.n ? "#C41E24" : T.border,
                        borderRadius: 3,
                      }} />
                      <div style={{ fontSize: 8, color: T.dim2, marginTop: 3 }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* E'lon yuborish */}
              <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: T.dim, marginBottom: 8 }}>📢 Barcha foydalanuvchilarga e'lon</div>
                <textarea value={annDraft} onChange={e => setAnnDraft(e.target.value)} rows={2}
                  placeholder={ann?.text ? "Joriy e'lon: " + ann.text : "E'lon matni..."}
                  style={{
                    width: "100%", boxSizing: "border-box", background: T.bg, color: T.text,
                    border: "1px solid " + T.brd2, borderRadius: 10, padding: 10, fontSize: 13,
                    fontFamily: "system-ui, sans-serif", resize: "vertical",
                  }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={async () => {
                    if (!annDraft.trim()) return;
                    await setAnnouncement(annDraft.trim());
                    setAnn({ text: annDraft.trim(), ts: Date.now() });
                    setAnnDraft("");
                    setAnnHide(false);
                  }} style={{
                    background: "#C41E24", color: "#FFF", border: "none", borderRadius: 8,
                    padding: "7px 16px", fontSize: 12.5, cursor: "pointer", fontWeight: 600,
                  }}>Yuborish</button>
                  {ann?.text && (
                    <button onClick={async () => { await setAnnouncement(""); setAnn(null); }} style={{
                      background: "transparent", color: T.dim, border: "1px solid " + T.brd2,
                      borderRadius: 8, padding: "7px 16px", fontSize: 12.5, cursor: "pointer",
                    }}>E'lonni o'chirish</button>
                  )}
                </div>
              </div>

              {/* Support murojaatlari */}
              <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: T.dim, flex: 1 }}>
                    🆘 Yordam murojaatlari
                    {adminSup.filter(t => t.unreadAdmin).length > 0 && (
                      <span style={{
                        background: "#C41E24", color: "#FFF", borderRadius: 10,
                        fontSize: 10, padding: "1px 7px", marginLeft: 6,
                      }}>{adminSup.filter(t => t.unreadAdmin).length} yangi</span>
                    )}
                  </div>
                  <button onClick={async () => setAdminSup(await listSupport())} style={{
                    background: T.hover, border: "1px solid " + T.brd2, color: T.text,
                    borderRadius: 8, padding: "4px 12px", fontSize: 11.5, cursor: "pointer",
                  }}>🔄 Yangilash</button>
                </div>
                {adminSup.length === 0 && <div style={{ fontSize: 12, color: T.dim }}>Murojaatlar yo'q — "Yangilash"ni bosing</div>}
                {adminSup.map(t => (
                  <div key={t.uid} style={{
                    border: "1px solid " + (t.unreadAdmin ? "#C41E24" : T.border),
                    borderRadius: 10, padding: "8px 12px", marginBottom: 6,
                  }}>
                    <div onClick={async () => {
                      const open = supOpen === t.uid ? null : t.uid;
                      setSupOpen(open);
                      if (open && t.unreadAdmin) {
                        await markSupportRead(t.uid, "admin");
                        setAdminSup(await listSupport());
                      }
                    }} style={{ cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ fontSize: 13 }}>{t.unreadAdmin && "🔴 "}{t.name || t.email}</b>
                        <div style={{ fontSize: 11.5, color: T.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {(t.msgs || []).slice(-1)[0]?.text || ""}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: T.dim2 }}>
                        {t.updated ? new Date(t.updated).toLocaleString().slice(0, 17) : ""}
                      </span>
                    </div>
                    {supOpen === t.uid && (
                      <div style={{ marginTop: 8, borderTop: "1px solid #26262B", paddingTop: 8 }}>
                        {(t.msgs || []).map((m, mi) => (
                          <div key={mi} style={{
                            fontSize: 12.5, marginBottom: 5,
                            color: m.from === "user" ? "#FFF" : "#E5484D",
                            whiteSpace: "pre-wrap",
                          }}>
                            <b>{m.from === "user" ? "👤" : "👑"}</b> {m.text}
                          </div>
                        ))}
                        <AdminReply uid={t.uid} onSent={async () => setAdminSup(await listSupport())} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* So'nggi xabarlar */}
              {feed.length > 0 && (
                <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: T.dim, marginBottom: 8 }}>💬 So'nggi xabarlar</div>
                  {feed.map((f, i) => (
                    <div key={i} style={{ fontSize: 12.5, marginBottom: 6, color: T.text }}>
                      <b style={{ color: "#E5484D" }}>{f.name}:</b> {(f.text || "").slice(0, 120)}
                    </div>
                  ))}
                </div>
              )}

              {/* Qidiruv va saralash */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <input value={adminSearch} onChange={e => setAdminSearch(e.target.value)}
                  placeholder="🔍 Ism yoki email bo'yicha qidirish..."
                  style={{
                    flex: 1, minWidth: 180, background: T.card, color: T.text,
                    border: "1px solid " + T.brd2, borderRadius: 10, padding: "9px 12px",
                    fontSize: 13, outline: "none", fontFamily: "system-ui, sans-serif",
                  }} />
                {[["updated", "Faollik"], ["msgs", "Xabarlar"], ["created", "Yangilar"]].map(([k, lbl]) => (
                  <button key={k} onClick={() => setAdminSort(k)} style={{
                    background: adminSort === k ? "#C41E24" : T.card,
                    border: "1px solid " + (adminSort === k ? "#C41E24" : T.brd2),
                    color: adminSort === k ? "#FFF" : T.text,
                    borderRadius: 10, padding: "0 14px", fontSize: 12.5, cursor: "pointer",
                  }}>{lbl}</button>
                ))}
              </div>

              {/* Foydalanuvchilar ro'yxati */}
              {list.map(u => (
                <div key={u.uid} style={{
                  background: T.card, border: "1px solid " + (u.blocked ? "#C41E24" : T.border),
                  borderRadius: 12, padding: "10px 14px", marginBottom: 8, fontSize: 13,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 600 }}>
                        {u.premium && "💎 "}{u.name || "Nomsiz"} {u.blocked && <span style={{ color: "#E5484D", fontSize: 11 }}>⛔</span>}
                      </div>
                      <div style={{ color: T.dim, fontSize: 12 }}>{u.email}</div>
                    </div>
                    <div style={{ color: T.dim, fontSize: 11 }}>{u.chats}ch · {u.msgs}xb</div>
                    <input type="number" min="0" defaultValue={u.adminLimit || ""}
                      title="Kunlik limit (0 = cheksiz)" placeholder="∞"
                      onBlur={async e => {
                        const v = parseInt(e.target.value) || 0;
                        if (v !== u.adminLimit) { await setUserField(u.uid, { adminLimit: v }); setAdminUsers(await listUsers()); }
                      }}
                      style={{
                        width: 46, background: T.bg, color: T.text, textAlign: "center",
                        border: "1px solid " + T.brd2, borderRadius: 8, padding: "5px 4px", fontSize: 12,
                      }} />
                    <button onClick={async () => {
                      await setUserField(u.uid, { premium: !u.premium });
                      setAdminUsers(await listUsers());
                    }} title="Premium berish/olish" style={{
                      background: u.premium ? "#5C4A00" : T.hover, border: "1px solid " + T.brd2,
                      color: "#F5C518", borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer",
                    }}>💎</button>
                    <button onClick={() => setViewUser(viewUser?.uid === u.uid ? null : u)} style={{
                      background: T.hover, border: "1px solid " + T.brd2, color: T.text,
                      borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer",
                    }}>👁</button>
                    <button onClick={async () => {
                      await setBlocked(u.uid, !u.blocked);
                      setAdminUsers(await listUsers());
                    }} style={{
                      background: u.blocked ? "#1E5C2E" : "#C41E24", border: "none", color: "#FFF",
                      borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600,
                    }}>{u.blocked ? "✓" : "⛔"}</button>
                    <button onClick={async () => {
                      if (window.confirm(u.email + " butunlay o'chirilsinmi? Qaytarib bo'lmaydi!")) {
                        await deleteUser(u.uid);
                        setAdminUsers(await listUsers());
                      }
                    }} title="O'chirish" style={{
                      background: "transparent", border: "1px solid #C41E24", color: "#E5484D",
                      borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer",
                    }}>🗑</button>
                  </div>

                  {viewUser?.uid === u.uid && (() => {
                    let chats = [];
                    try { chats = JSON.parse(u.data).list || []; } catch (e) {}
                    return (
                      <div style={{ marginTop: 12, borderTop: "1px solid #26262B", paddingTop: 10 }}>
                        {chats.length === 0 && <div style={{ color: T.dim, fontSize: 12 }}>Suhbatlar yo'q</div>}
                        {chats.map((c, ci) => (
                          <details key={ci} style={{ marginBottom: 8 }}>
                            <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#E5484D" }}>
                              💬 {c.title} ({(c.msgs || []).length} xabar)
                            </summary>
                            <div style={{ padding: "8px 0 0 14px" }}>
                              {(c.msgs || []).map((m, mi) => (
                                <div key={mi} style={{
                                  fontSize: 12, marginBottom: 6, color: m.role === "user" ? "#FFF" : T.dim,
                                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                                }}>
                                  <b>{m.role === "user" ? "👤" : "🤖"}</b> {(m.content || "").slice(0, 500)}
                                </div>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ))}
              {list.length === 0 && (
                <div style={{ color: T.dim, textAlign: "center", marginTop: 30 }}>
                  Hech narsa topilmadi
                </div>
              )}
            </div>
          </div>
          );
        })()}

        {/* ==== CHAT ko'rinishi ==== */}
        {view === "chat" && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 10px" : "24px 16px" }}>
              <div style={{ maxWidth: 760, margin: "0 auto" }}>
                {ann && ann.text && !annHide && (
                  <div style={{
                    background: "#2A1215", border: "1px solid #C41E24", borderRadius: 12,
                    padding: "10px 14px", marginBottom: 16, fontSize: 13.5,
                    fontFamily: "system-ui, sans-serif", display: "flex", gap: 10, alignItems: "center",
                  }}>
                    <span>📢</span>
                    <span style={{ flex: 1, whiteSpace: "pre-wrap" }}>{ann.text}</span>
                    <span onClick={() => {
                      setAnnHide(true);
                      try { localStorage.setItem("jay-ann-seen", String(ann.ts)); } catch (e) {}
                    }} style={{ cursor: "pointer", color: "#E5484D", fontWeight: 700 }}>×</span>
                  </div>
                )}
                {msgs.length === 0 && (
                  <div style={{ textAlign: "center", marginTop: 70 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                      <Logo size={52} />
                    </div>
                    <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 500, letterSpacing: "-1px" }}>
                      {L.greet(new Date().getHours())}{settings.name ? `, ${settings.name}` : ""}
                    </div>
                    {cur?.mode === "image" && (
                      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 18, marginBottom: -6 }}>
                        {[["Realistik", "realistic photo"], ["Anime", "anime style"], ["3D", "3d render"], ["Rasm", "digital painting"], ["Logo", "minimalist logo"]].map(([lbl, tag]) => (
                          <button key={lbl} onClick={() => setInput(prev => (prev ? prev + ", " : "") + tag)} style={{
                            background: T.card, border: "1px solid " + T.brd2, color: T.text,
                            borderRadius: 16, padding: "6px 12px", fontSize: 12, cursor: "pointer",
                            fontFamily: "system-ui, sans-serif",
                          }}>{lbl}</button>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: 28, textAlign: "left" }}>{inputBar}</div>
                    {(!cur?.mode || cur?.mode === "chat") && (
                      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
                        {(L.suggestions || []).map((sug, si) => (
                          <button key={si} onClick={() => setInput(sug)} style={{
                            background: T.card, border: "1px solid " + T.border, color: T.dim,
                            borderRadius: 16, padding: "8px 14px", fontSize: 12.5, cursor: "pointer",
                            fontFamily: "system-ui, sans-serif",
                          }}>{sug}</button>
                        ))}
                      </div>
                    )}
                    <div style={{
                      display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap",
                      marginTop: 18, fontFamily: "system-ui, sans-serif",
                    }}>
                      {[
                        ["write", "✏️ Write"],
                        ["learn", "🎓 Learn"],
                        ["code", "‹/› Code"],
                        ["life", "☕ Hayotiy"],
                        ["image", "🖼 Rasm"],
                        ["choice", "💡 JAY tanlovi"],
                        ["ustoz", "👨‍🏫 Ustoz"],
                        ["dost", "🤝 Do'st"],
                        ["psixolog", "🧠 Suhbatdosh"],
                        ["biznes", "💼 Biznes"],
                      ].map(([mode, label]) => (
                        <button key={mode}
                          onClick={() => {
                            updateCur(c => ({ ...c, mode }));
                            if (mode === "choice") {
                              setTimeout(() => setInput("Menga qiziqarli narsa ayt"), 0);
                            }
                          }}
                          style={{
                            background: cur?.mode === mode ? "#C41E24" : T.card,
                            border: "1px solid " + (cur?.mode === mode ? "#C41E24" : T.brd2),
                            color: cur?.mode === mode ? "#FFF" : T.text,
                            borderRadius: 20, padding: "9px 16px", fontSize: 13, cursor: "pointer",
                            fontWeight: 500,
                          }}>{label}</button>
                      ))}
                    </div>
                  </div>
                )}

                {msgs.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 14,
                  }}>
                    {m.role === "assistant" && (
                      <div style={{ marginRight: 10, marginTop: 4, flexShrink: 0 }}><Logo size={22} /></div>
                    )}
                    <div style={{
                      maxWidth: m.role === "user" ? "80%" : "88%", padding: "12px 16px",
                      fontSize: 15, lineHeight: 1.6, wordBreak: "break-word",
                      borderRadius: m.role === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                      background: m.role === "user" ? "#C41E24" : T.card,
                      border: m.role === "user" ? "none" : "1px solid #26262B",
                      color: m.role === "user" ? "#FFF" : T.text,
                      fontFamily: m.role === "user" ? "system-ui, sans-serif" : "Georgia, serif",
                    }}>
                      {m.role === "user"
                        ? <span style={{ whiteSpace: "pre-wrap" }}>
                            {m.files && m.files.length > 0 && (
                              <span style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: m.content ? 8 : 0 }}>
                                {m.files.map((f, k) =>
                                  f.kind === "image" && f.data
                                    ? <img key={k} src={`data:${f.media_type};base64,${f.data}`} alt={f.name}
                                        style={{ maxWidth: 160, maxHeight: 160, borderRadius: 10, display: "block" }} />
                                    : <span key={k} style={{
                                        background: "rgba(255,255,255,0.18)", borderRadius: 8, padding: "5px 10px",
                                        fontSize: 12, fontFamily: "system-ui, sans-serif",
                                      }}>{f.kind === "image" ? "🖼" : "📄"} {f.name}</span>
                                )}
                              </span>
                            )}
                            {m.content}
                          </span>
                        : <>
                          {m.image && (
                            <img src={m.image} alt="JAY rasmi" style={{
                              maxWidth: "100%", borderRadius: 12, display: "block", marginBottom: 8,
                            }} />
                          )}
                          {parseContent(m.content).map((p, j) =>
                            p.type === "code"
                              ? (isSvg(p.value)
                                  ? <SvgImage key={j} value={p.value} />
                                  : <CodeBlock key={j} lang={p.lang} value={p.value} onPreview={setPreview} />)
                              : <Md key={j} text={p.value} />
                          )}
                          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                            <button onClick={() => speak(m.content)} title="Ovozda eshitish" style={{
                              background: "transparent", border: "none", color: T.dim2, cursor: "pointer", fontSize: 14,
                            }}>🔊</button>
                            <button onClick={() => copyText(m.content)} title="Nusxalash" style={{
                              background: "transparent", border: "none", color: T.dim2, cursor: "pointer", fontSize: 14,
                            }}>📋</button>
                            <button onClick={() => {
                              updateCur(c => ({ ...c, msgs: c.msgs.map((x, xi) => xi === i ? { ...x, fav: !x.fav } : x) }));
                            }} title="Saqlash" style={{
                              background: "transparent", border: "none",
                              color: m.fav ? "#F5C518" : T.dim2, cursor: "pointer", fontSize: 14,
                            }}>{m.fav ? "★" : "☆"}</button>
                            {i === msgs.length - 1 && (
                              <button onClick={regenerate} title="Qayta yaratish" style={{
                                background: "transparent", border: "none", color: T.dim2, cursor: "pointer", fontSize: 14,
                              }}>🔄</button>
                            )}
                          </div>
                        </>}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: "flex", gap: 6, padding: "10px 16px", alignItems: "center" }}>
                    <Logo size={20} />
                    {[0, 1, 2].map(d => (
                      <span key={d} style={{
                        width: 7, height: 7, borderRadius: "50%", background: "#E5484D",
                        animation: `jayb 1s ${d * 0.15}s infinite alternate`,
                      }} />
                    ))}
                    <style>{`@keyframes jayb { from { opacity:.25; transform:translateY(0);} to { opacity:1; transform:translateY(-4px);} }`}</style>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            {msgs.length > 0 && inputBar}
          </>
        )}
      </div>

      {/* Sayt ko'rish oynasi */}
      {preview && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: T.card, borderRadius: 16, width: "100%", maxWidth: 920,
            height: "85vh", display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px", borderBottom: "1px solid #26262B",
              fontFamily: "system-ui, sans-serif",
            }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>JAY yasagan sayt</span>
              <button onClick={() => setPreview(null)} style={{
                background: "#C41E24", color: "#FFF", border: "none",
                borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600,
              }}>Yopish ✕</button>
            </div>
            <iframe srcDoc={preview} sandbox="allow-scripts"
              style={{ flex: 1, border: "none", width: "100%", background: "#FFF" }} title="preview" />
          </div>
        </div>
      )}
    </div>
  );
}
