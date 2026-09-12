// JAY AI Telegram bot. Kalitlar: TELEGRAM_BOT_TOKEN, GEMINI_API_KEY, ADMIN_CHAT_ID
const SYS_BY_LANG = {
  uz: `Sen JAY AI'san — aqlli, do'stona yordamchi (Telegram bot versiyasi). Seni ISHIMOV JAHONGIR yaratgan (JAY = "Jahongir AI Yasadi"). "Seni kim yaratgan?" deb so'rashsa, "Meni ISHIMOV JAHONGIR yaratgan" deb javob ber. Interfeys tili: o'zbekcha, asosan o'zbek tilida javob ber. Qisqa, aniq va foydali javob ber. Oddiy matn yoz, murakkab markdown ishlatma. Javobingda o'ylash jarayonini yozma, faqat toza javob ber. Sayt: jayai.vercel.app`,
  ru: `Ты JAY AI — умный, дружелюбный помощник (версия для Telegram). Тебя создал ISHIMOV JAHONGIR (JAY = "Jahongir AI Yasadi"). На вопрос "кто тебя создал?" отвечай "Меня создал ISHIMOV JAHONGIR". Язык интерфейса: русский, отвечай в основном на русском. Кратко, точно и полезно. Простой текст, без сложного markdown. Не пиши процесс размышления, только чистый ответ. Сайт: jayai.vercel.app`,
  en: `You are JAY AI — a smart, friendly assistant (Telegram version). You were created by ISHIMOV JAHONGIR (JAY = "Jahongir AI Yasadi"). If asked "who created you?", answer "I was created by ISHIMOV JAHONGIR". Interface language: English, reply mainly in English. Be short, precise and useful. Plain text, no complex markdown. Do not write your thinking process, only the clean answer. Site: jayai.vercel.app`,
};

const TXT = {
  uz: {
    welcome: (name) => "Salom" + (name ? ", " + name : "") + "! 👋\n\nMen JAY AI 🤖 — savolingizni yozing.",
    intro: "Salom! Men JAY AI 🤖\nJahongir AI Yasadi — bepul o'zbek AI yordamchisi.\n\nBoshlashdan oldin tanishib olaylik.\n\n👤 Ismingizni yozing:",
    askName: (n) => "Tanishganimdan xursandman, " + n + "! 📱\n\nEndi telefon raqamingizni ulashing (raqamingiz faqat ro'yxatdan o'tish uchun saqlanadi):",
    askPhone: "Iltimos, pastdagi 📱 tugma orqali raqamingizni ulashing.",
    shareBtn: "📱 Raqamni ulashish",
    doneReg: "✅ Rahmat! Ro'yxatdan o'tdingiz. Endi istalgan savolni yozing 🤖",
    btnSupport: "🆘 Adminga murojaat", btnSite: "🌐 Sayt", btnAbout: "ℹ️ JAY haqida", btnLang: "🌍 Til",
    supportAsk: "✍️ Murojaatingizni SHU XABARGA JAVOB (reply) qilib yozing — admin tez orada javob beradi.",
    supportSent: "✅ Murojaatingiz adminga yuborildi! Javob shu yerga keladi.",
    supportNoAdmin: "Hozircha admin ulanmagan, keyinroq urinib ko'ring.",
    siteInfo: "🌐 JAY AI to'liq versiyasi:\njayai.vercel.app\n\nU yerda: rasm yaratish, fayl yuklash, rejimlar, suhbatlar tarixi va boshqalar!",
    about: "🤖 JAY AI — Jahongir AI Yasadi\n\nBepul o'zbek AI yordamchisi. Yaratuvchi: ISHIMOV JAHONGIR.\n\n💬 Savol-javob, kod, tarjima, maslahat\n🖼 Rasm yaratish (saytda)\n🌐 jayai.vercel.app",
    chooseLang: "🌍 Tilni tanlang:",
    langSet: "✅ Til o'zbekchaga o'zgartirildi.",
    noText: "Hozircha faqat matnli xabarlarni tushunaman 🙂 Rasm va fayllar uchun: jayai.vercel.app",
    thinking: "Kechirasiz, hozir javob bera olmayapman. Birozdan keyin qayta urinib ko'ring 🙏",
    voiceFail: "Ovozni tushuna olmadim, qayta urinib ko'ring 🎙",
    youSaid: "🎙 Siz: ",
    adminReplySent: "✅ Javob yuborildi",
    adminReplyPrefix: "👑 Admin javobi:\n\n",
  },
  ru: {
    welcome: (name) => "Привет" + (name ? ", " + name : "") + "! 👋\n\nЯ JAY AI 🤖 — напишите ваш вопрос.",
    intro: "Привет! Я JAY AI 🤖\nJahongir AI Yasadi — бесплатный AI помощник.\n\nПрежде чем начать, давайте познакомимся.\n\n👤 Напишите ваше имя:",
    askName: (n) => "Приятно познакомиться, " + n + "! 📱\n\nТеперь поделитесь номером телефона (номер сохраняется только для регистрации):",
    askPhone: "Пожалуйста, поделитесь номером через кнопку 📱 ниже.",
    shareBtn: "📱 Поделиться номером",
    doneReg: "✅ Спасибо! Вы зарегистрированы. Теперь пишите любой вопрос 🤖",
    btnSupport: "🆘 Написать админу", btnSite: "🌐 Сайт", btnAbout: "ℹ️ О JAY", btnLang: "🌍 Язык",
    supportAsk: "✍️ Напишите обращение ОТВЕТОМ (reply) на это сообщение — админ скоро ответит.",
    supportSent: "✅ Обращение отправлено админу! Ответ придёт сюда.",
    supportNoAdmin: "Админ пока не подключен, попробуйте позже.",
    siteInfo: "🌐 Полная версия JAY AI:\njayai.vercel.app\n\nТам: генерация изображений, файлы, режимы, история чатов и другое!",
    about: "🤖 JAY AI — Jahongir AI Yasadi\n\nБесплатный AI помощник. Создатель: ISHIMOV JAHONGIR.\n\n💬 Вопросы, код, перевод, советы\n🖼 Генерация изображений (на сайте)\n🌐 jayai.vercel.app",
    chooseLang: "🌍 Выберите язык:",
    langSet: "✅ Язык изменён на русский.",
    noText: "Пока понимаю только текстовые сообщения 🙂 Для изображений и файлов: jayai.vercel.app",
    thinking: "Извините, сейчас не могу ответить. Попробуйте чуть позже 🙏",
    voiceFail: "Не смог распознать голос, попробуйте ещё раз 🎙",
    youSaid: "🎙 Вы: ",
    adminReplySent: "✅ Ответ отправлен",
    adminReplyPrefix: "👑 Ответ админа:\n\n",
  },
  en: {
    welcome: (name) => "Hi" + (name ? ", " + name : "") + "! 👋\n\nI'm JAY AI 🤖 — ask me anything.",
    intro: "Hi! I'm JAY AI 🤖\nJahongir AI Yasadi — a free AI assistant.\n\nLet's get to know each other first.\n\n👤 What's your name?",
    askName: (n) => "Nice to meet you, " + n + "! 📱\n\nNow share your phone number (it's saved only for registration):",
    askPhone: "Please share your number using the 📱 button below.",
    shareBtn: "📱 Share number",
    doneReg: "✅ Thanks! You're registered. Ask me anything now 🤖",
    btnSupport: "🆘 Contact admin", btnSite: "🌐 Website", btnAbout: "ℹ️ About JAY", btnLang: "🌍 Language",
    supportAsk: "✍️ Write your message as a REPLY to this message — admin will respond soon.",
    supportSent: "✅ Your message was sent to admin! Reply will appear here.",
    supportNoAdmin: "Admin isn't connected yet, try later.",
    siteInfo: "🌐 Full JAY AI version:\njayai.vercel.app\n\nThere: image generation, files, modes, chat history and more!",
    about: "🤖 JAY AI — Jahongir AI Yasadi\n\nFree AI assistant. Creator: ISHIMOV JAHONGIR.\n\n💬 Q&A, code, translation, advice\n🖼 Image generation (on website)\n🌐 jayai.vercel.app",
    chooseLang: "🌍 Choose language:",
    langSet: "✅ Language switched to English.",
    noText: "I currently understand only text messages 🙂 For images and files: jayai.vercel.app",
    thinking: "Sorry, I can't respond right now. Please try again shortly 🙏",
    voiceFail: "Couldn't understand the voice message, try again 🎙",
    youSaid: "🎙 You: ",
    adminReplySent: "✅ Reply sent",
    adminReplyPrefix: "👑 Admin reply:\n\n",
  },
};

const MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-lite",
  "gemma-4-26b-a4b-it",
  "gemma-4-31b-it",
];

function keyboardFor(lang) {
  const t = TXT[lang] || TXT.uz;
  return {
    keyboard: [
      [{ text: t.btnSupport }],
      [{ text: t.btnSite }, { text: t.btnAbout }, { text: t.btnLang }],
    ],
    resize_keyboard: true,
  };
}



async function askGemini(userText, lang, history) {
  const SYSTEM = SYS_BY_LANG[lang] || SYS_BY_LANG.uz;
  const contents = [];
  for (const h of (history || []).slice(-10)) {
    contents.push({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.text }] });
  }
  contents.push({ role: "user", parts: [{ text: userText }] });
  for (const model of MODELS) {
    try {
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" +
          process.env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM }] },
            contents,
            generationConfig: { maxOutputTokens: 2000 },
          }),
        }
      );
      const data = await r.json();
      if (r.ok) {
        const text = (data.candidates?.[0]?.content?.parts || [])
          .map(p => p.text || "").join("");
        if (text) return text;
      }
      if (r.status !== 429 && r.status !== 404 && r.status !== 400) break;
    } catch (e) {}
  }
  return (TXT[lang] || TXT.uz).thinking;
}

// Firestore REST (kalitsiz — public rules bilan) — tg_users kolleksiyasi
const FS_BASE = "https://firestore.googleapis.com/v1/projects/jay---ai/databases/(default)/documents";

async function getTgUser(chatId) {
  try {
    const r = await fetch(FS_BASE + "/tg_users/" + chatId);
    if (!r.ok) return null;
    const d = await r.json();
    const f = d.fields || {};
    let hist = [];
    try { hist = JSON.parse(f.history?.stringValue || "[]"); } catch (e) {}
    return {
      name: f.name?.stringValue || "",
      phone: f.phone?.stringValue || "",
      step: f.step?.stringValue || "",
      lang: f.lang?.stringValue || "uz",
      history: hist,
    };
  } catch (e) { return null; }
}

async function saveTgUser(chatId, fields) {
  try {
    const cur = await getTgUser(chatId) || {};
    const merged = { ...cur, ...fields };
    await fetch(FS_BASE + "/tg_users/" + chatId + "?updateMask.fieldPaths=name&updateMask.fieldPaths=phone&updateMask.fieldPaths=step&updateMask.fieldPaths=lang&updateMask.fieldPaths=history", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: {
        name: { stringValue: merged.name || "" },
        phone: { stringValue: merged.phone || "" },
        step: { stringValue: merged.step || "" },
        lang: { stringValue: merged.lang || "uz" },
        history: { stringValue: JSON.stringify((merged.history || []).slice(-12)) },
      } }),
    });
  } catch (e) {}
}

// Ovozli xabarni Gemini orqali matnga aylantirish
// Ovozli xabarni Gemini orqali matnga aylantirish
async function transcribeVoice(fileId) {
  try {
    const fr = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fd = await fr.json();
    if (!fd.ok) return null;
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fd.result.file_path}`;
    const ar = await fetch(fileUrl);
    const buf = Buffer.from(await ar.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) return null;
    const b64 = buf.toString("base64");

    for (const model of MODELS) {
      if (!model.startsWith("gemini")) continue;
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" +
          process.env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [
              { inline_data: { mime_type: "audio/ogg", data: b64 } },
              { text: "Bu ovozli xabarni aynan aytilganidek matnga ko'chir. Faqat matnni yoz, izohsiz." },
            ] }],
          }),
        }
      );
      const data = await r.json();
      if (r.ok) {
        const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
        if (text) return text;
      }
    }
  } catch (e) {}
  return null;
}

async function tg(method, body) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch (e) { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("JAY AI Telegram bot ishlayapti ✓");
  try {
    const msg = req.body?.message;
    if (!msg || !msg.chat) return res.status(200).json({ ok: true });
    const chatId = msg.chat.id;
    const text = (msg.text || "").trim();
    const ADMIN = process.env.ADMIN_CHAT_ID;
    const isAdmin = ADMIN && String(chatId) === String(ADMIN);

    const chatType = msg.chat.type; // private | group | supergroup
    const isGroup = chatType === "group" || chatType === "supergroup";

    // Guruhda: faqat "jay" so'zi bilan boshlansa yoki botga reply qilinsa javob beramiz
    if (isGroup) {
      const botReplied = msg.reply_to_message?.from?.is_bot;
      const m = text.match(/^jay[,:\s]+([\s\S]+)/i);
      if (!m && !botReplied) return res.status(200).json({ ok: true });
      const q = m ? m[1].trim() : text;
      await tg("sendChatAction", { chat_id: chatId, action: "typing" });
      const reply = await askGemini(q, "uz");
      await tg("sendMessage", {
        chat_id: chatId,
        text: reply.slice(0, 3900),
        reply_to_message_id: msg.message_id,
      });
      return res.status(200).json({ ok: true });
    }

    const u0 = await getTgUser(chatId);
    const lang = u0?.lang || "uz";
    const t = TXT[lang] || TXT.uz;
    const KB = keyboardFor(lang);

    // ===== ADMIN: murojaatga javob (reply orqali) =====
    if (isAdmin && msg.reply_to_message) {
      const orig = msg.reply_to_message.text || "";
      const m = orig.match(/#u(-?\d+)/);
      if (m) {
        const targetLang = (await getTgUser(m[1]))?.lang || "uz";
        await tg("sendMessage", {
          chat_id: m[1],
          text: (TXT[targetLang] || TXT.uz).adminReplyPrefix + text,
        });
        await tg("sendMessage", { chat_id: chatId, text: t.adminReplySent });
        return res.status(200).json({ ok: true });
      }
    }

    // ===== FOYDALANUVCHI: support xabari (reply orqali) =====
    if (msg.reply_to_message && (msg.reply_to_message.text || "").startsWith("✍️")) {
      if (ADMIN) {
        const who = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ")
          + (msg.from?.username ? " (@" + msg.from.username + ")" : "");
        await tg("sendMessage", {
          chat_id: ADMIN,
          text: "🆘 YANGI MUROJAAT (" + lang + ")\n👤 " + who + "\n#u" + chatId + "\n\n" + text +
            "\n\n↩️ Javob berish uchun shu xabarga REPLY qiling",
        });
        await tg("sendMessage", { chat_id: chatId, text: t.supportSent, reply_markup: KB });
      } else {
        await tg("sendMessage", { chat_id: chatId, text: t.supportNoAdmin, reply_markup: KB });
      }
      return res.status(200).json({ ok: true });
    }

    // ===== Til tanlash (reply orqali) =====
    if (msg.reply_to_message && (msg.reply_to_message.text || "").includes("🌍") && ["uz", "ru", "en"].includes(text)) {
      await saveTgUser(chatId, { lang: text });
      const nt = TXT[text];
      await tg("sendMessage", { chat_id: chatId, text: nt.langSet, reply_markup: keyboardFor(text) });
      return res.status(200).json({ ok: true });
    }

    if (text === "/start") {
      if (u0 && u0.name && u0.phone) {
        await tg("sendMessage", { chat_id: chatId, text: t.welcome(u0.name), reply_markup: KB });
      } else {
        await saveTgUser(chatId, { step: "name" });
        await tg("sendMessage", { chat_id: chatId, text: t.intro, reply_markup: { remove_keyboard: true } });
      }
      return res.status(200).json({ ok: true });
    }

    if (text === "/id") {
      await tg("sendMessage", { chat_id: chatId, text: "Chat ID: " + chatId });
      return res.status(200).json({ ok: true });
    }

    if (text === t.btnLang || text === "/lang") {
      await tg("sendMessage", {
        chat_id: chatId,
        text: t.chooseLang,
        reply_markup: {
          keyboard: [[{ text: "uz" }, { text: "ru" }, { text: "en" }]],
          resize_keyboard: true, one_time_keyboard: true,
        },
      });
      return res.status(200).json({ ok: true });
    }

    if (text === t.btnSupport) {
      await tg("sendMessage", { chat_id: chatId, text: t.supportAsk, reply_markup: { force_reply: true } });
      return res.status(200).json({ ok: true });
    }

    if (text === t.btnSite) {
      await tg("sendMessage", { chat_id: chatId, text: t.siteInfo, reply_markup: KB });
      return res.status(200).json({ ok: true });
    }

    if (text === t.btnAbout) {
      await tg("sendMessage", { chat_id: chatId, text: t.about, reply_markup: KB });
      return res.status(200).json({ ok: true });
    }

    // ===== Ovozli xabar =====
    if (msg.voice) {
      await tg("sendChatAction", { chat_id: chatId, action: "typing" });
      const spoken = await transcribeVoice(msg.voice.file_id);
      if (!spoken) {
        await tg("sendMessage", { chat_id: chatId, text: t.voiceFail, reply_markup: KB });
        return res.status(200).json({ ok: true });
      }
      await tg("sendChatAction", { chat_id: chatId, action: "typing" });
      const reply = await askGemini(spoken, lang);
      await tg("sendMessage", { chat_id: chatId, text: t.youSaid + spoken + "\n\n" + reply.slice(0, 3800), reply_markup: KB });
      return res.status(200).json({ ok: true });
    }

    // ===== Admin: /stats =====
    if (isAdmin && text === "/stats") {
      let count = 0;
      try {
        const r = await fetch(FS_BASE + "/tg_users?pageSize=300");
        const d = await r.json();
        count = (d.documents || []).length;
      } catch (e) {}
      await tg("sendMessage", { chat_id: chatId, text: "📊 Ro'yxatdan o'tganlar: " + count + (count >= 300 ? "+" : "") });
      return res.status(200).json({ ok: true });
    }

    // ===== Telefon kontakt qabul qilish =====
    if (msg.contact && msg.contact.phone_number) {
      await saveTgUser(chatId, { phone: msg.contact.phone_number, step: "done" });
      await tg("sendMessage", { chat_id: chatId, text: t.doneReg, reply_markup: KB });
      // Adminga yangi foydalanuvchi haqida xabar
      if (ADMIN && String(chatId) !== String(ADMIN)) {
        const uname = msg.from?.username ? "@" + msg.from.username : "—";
        await tg("sendMessage", {
          chat_id: ADMIN,
          text: "🎉 YANGI FOYDALANUVCHI\n\n👤 " + (u0?.name || msg.from?.first_name || "—") +
            "\n📱 " + msg.contact.phone_number +
            "\n🔗 " + uname +
            "\n🌍 " + lang +
            "\n🆔 #u" + chatId,
        });
      }
      return res.status(200).json({ ok: true });
    }

    // ===== Registratsiya bosqichlari =====
    if (u0 && u0.step === "name" && text) {
      await saveTgUser(chatId, { name: text.slice(0, 40), step: "phone" });
      await tg("sendMessage", {
        chat_id: chatId,
        text: t.askName(text.slice(0, 40)),
        reply_markup: { keyboard: [[{ text: t.shareBtn, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
      });
      return res.status(200).json({ ok: true });
    }
    if (u0 && u0.step === "phone") {
      await tg("sendMessage", {
        chat_id: chatId,
        text: t.askPhone,
        reply_markup: { keyboard: [[{ text: t.shareBtn, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
      });
      return res.status(200).json({ ok: true });
    }

    if (!text) {
      await tg("sendMessage", { chat_id: chatId, text: t.noText, reply_markup: KB });
      return res.status(200).json({ ok: true });
    }

    // ===== Oddiy AI suhbat (xotira bilan) =====
    await tg("sendChatAction", { chat_id: chatId, action: "typing" });
    const reply = await askGemini(text, lang, u0?.history);
    // Suhbat tarixini yangilash
    const newHist = [...(u0?.history || []), { role: "user", text }, { role: "assistant", text: reply }].slice(-12);
    await saveTgUser(chatId, { history: newHist });
    for (let i = 0; i < reply.length; i += 4000) {
      await tg("sendMessage", { chat_id: chatId, text: reply.slice(i, i + 4000), reply_markup: KB });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: true });
  }
}
