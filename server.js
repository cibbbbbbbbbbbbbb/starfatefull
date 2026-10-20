require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const argon2 = require('argon2');
const { z } = require('zod');
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient, Prisma } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || '';
const SESSION_TTL_DAYS = Math.max(1, Number(process.env.SESSION_TTL_DAYS || 7));
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/api/auth/google/callback`;
const CORS_ORIGIN = process.env.CORS_ORIGIN || `http://localhost:${PORT}`;
const MIN_BIRTH_YEAR = Math.max(1800, Number(process.env.MIN_BIRTH_YEAR) || 1900);
const oauth = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

if (IS_PRODUCTION && (!SESSION_SECRET || SESSION_SECRET.length < 32)) {
  throw new Error('SESSION_SECRET must be set to at least 32 characters in production.');
}
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. The server cannot persist data until PostgreSQL is configured.');
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      'script-src': ["'self'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'self'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'object-src': ["'none'"]
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => { res.setHeader('Content-Language', 'zh-TW'); next(); });

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { ok: false, message: '登入相關操作過於頻繁，請稍後再試。' } });
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false });
app.use('/api/', apiLimiter);
app.use(express.static(__dirname));

const emailSchema = z.string().trim().toLowerCase().email().max(320);
const passwordSchema = z.string().min(8, '密碼至少需要 8 個字元。').max(128);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必須為 YYYY-MM-DD。');
const jsonSchema = z.any().refine(v => v !== undefined && v !== null, '結果資料不可為空。');

function json(res, status, body) { return res.status(status).type('application/json').set('Content-Type', 'application/json; charset=utf-8').json(body); }
function hashToken(token) { return crypto.createHash('sha256').update(`${token}:${SESSION_SECRET}`).digest('hex'); }
function cookieSerialize(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.secure) parts.push('Secure');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join('; ');
}
function cookieMap(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('='); if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function sessionCookie(token) {
  return cookieSerialize('sf_session', token, { httpOnly: true, secure: IS_PRODUCTION, sameSite: 'Lax', path: '/', maxAge: SESSION_TTL_DAYS * 86400 });
}
function clearSessionCookie() {
  return cookieSerialize('sf_session', '', { httpOnly: true, secure: IS_PRODUCTION, sameSite: 'Lax', path: '/', maxAge: 0 });
}
function oauthCookie(name, value, maxAge = 600) {
  return cookieSerialize(name, value, { httpOnly: true, secure: IS_PRODUCTION, sameSite: 'Lax', path: '/', maxAge });
}
function normalizeDateOnly(input) {
  const [y, m, d] = String(input).split('-').map(Number);
  return { y, m, d };
}
function daysInMonth(y, m) { return [31, ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] || 0; }
function taipeiDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function birthValidDate(input) {
  const parsed = dateSchema.safeParse(input); if (!parsed.success) return false;
  const { y, m, d } = normalizeDateOnly(input);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d) || y < 1900 || m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return false;
  return input <= taipeiDateKey();
}
function dateToDb(dateString) { return new Date(`${dateString}T00:00:00.000Z`); }
function userPublic(u) { return { id: u.id, email: u.email, name: u.name, role: u.role, googleLinked: !!u.googleId, createdAt: u.createdAt, updatedAt: u.updatedAt }; }

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400000);
  await prisma.session.create({ data: { userId, tokenHash, expiresAt } });
  return token;
}
async function destroySession(req) {
  const raw = cookieMap(req).sf_session;
  if (!raw) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(raw) } });
}
async function requireAuth(req, res, next) {
  try {
    const raw = cookieMap(req).sf_session;
    if (!raw) return json(res, 401, { ok: false, message: '尚未登入。' });
    const tokenHash = hashToken(raw);
    const session = await prisma.session.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      res.setHeader('Set-Cookie', clearSessionCookie());
      return json(res, 401, { ok: false, message: '登入狀態已失效，請重新登入。' });
    }
    req.user = session.user;
    req.session = session;
    next();
  } catch (e) { next(e); }
}
async function requireAdmin(req, res, next) {
  if (!req.user) return json(res, 401, { ok: false, message: '尚未登入。' });
  if (req.user.role !== 'admin') return json(res, 403, { ok: false, message: '此資源僅限管理員存取。' });
  next();
}
function parseBirthPayload(body) {
  let date = body.birthDate;
  if (!date && Number.isInteger(Number(body.year)) && Number.isInteger(Number(body.month)) && Number.isInteger(Number(body.day))) {
    date = `${Number(body.year)}-${String(Number(body.month)).padStart(2, '0')}-${String(Number(body.day)).padStart(2, '0')}`;
  }
  return date;
}

app.get('/fate/:code', (req, res) => res.sendFile(path.join(__dirname, 'fate', 'index.html')));
app.get('/api/health', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json(res, 200, { ok: true, service: 'STAR FATE', database: 'ok' });
  } catch (e) { return json(res, 503, { ok: false, service: 'STAR FATE', database: 'unavailable', message: 'Database 尚未連線。' }); }
});
app.get('/api/auth/config', (req, res) => json(res, 200, { googleClientId: GOOGLE_CLIENT_ID || null, redirectUri: GOOGLE_REDIRECT_URI }));

app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const email = emailSchema.parse(req.body?.email);
    const password = passwordSchema.parse(req.body?.password);
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 100) : null;
    if (req.body?.privacyConsent !== true) return json(res, 400, { ok: false, message: '請先同意隱私權政策與使用條款。' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return json(res, 409, { ok: false, message: '這個 Email 已經註冊，請直接登入。' });
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await prisma.user.create({ data: { email, passwordHash, name: name || email.split('@')[0] } });
    const token = await createSession(user.id);
    res.setHeader('Set-Cookie', sessionCookie(token));
    return json(res, 201, { ok: true, user: userPublic(user) });
  } catch (e) { if (e instanceof z.ZodError) return json(res, 400, { ok: false, message: e.issues?.[0]?.message || '註冊資料無效。' }); next(e); }
});

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const email = emailSchema.parse(req.body?.email);
    const password = z.string().min(1).max(128).parse(req.body?.password);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await argon2.verify(user.passwordHash, password))) return json(res, 401, { ok: false, message: 'Email 或密碼不正確。' });
    const token = await createSession(user.id);
    res.setHeader('Set-Cookie', sessionCookie(token));
    return json(res, 200, { ok: true, user: userPublic(user) });
  } catch (e) { if (e instanceof z.ZodError) return json(res, 400, { ok: false, message: 'Email 或密碼格式無效。' }); next(e); }
});

app.post('/api/auth/logout', requireAuth, async (req, res, next) => { try { await destroySession(req); res.setHeader('Set-Cookie', clearSessionCookie()); return json(res, 200, { ok: true }); } catch (e) { next(e); } });
app.get('/api/me', requireAuth, (req, res) => json(res, 200, { ok: true, user: userPublic(req.user) }));
app.patch('/api/me', requireAuth, async (req,res,next)=>{try{const name=typeof req.body?.name==='string'?req.body.name.trim().slice(0,100):'';const user=await prisma.user.update({where:{id:req.user.id},data:{name:name||null}});return json(res,200,{ok:true,user:userPublic(user)});}catch(e){next(e);}});

app.get('/api/auth/google/start', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return res.status(503).type('text/plain').send('Google 登入尚未完成伺服器設定。');
  const state = crypto.randomBytes(24).toString('hex');
  const returnTo = typeof req.query.returnTo === 'string' && /^\/(?!\/)/.test(req.query.returnTo) ? req.query.returnTo : '/google-callback.html';
  res.setHeader('Set-Cookie', [oauthCookie('sf_oauth_state', state), oauthCookie('sf_oauth_return_to', returnTo)]);
  const url = oauth.generateAuthUrl({ access_type: 'offline', scope: ['openid', 'email', 'profile'], state, prompt: 'select_account' });
  res.redirect(url);
});
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const cookies = cookieMap(req); const { code, state } = req.query;
    if (!code || !state || state !== cookies.sf_oauth_state) throw new Error('invalid_oauth_state');
    const { tokens } = await oauth.getToken(code);
    const ticket = await oauth.verifyIdToken({ idToken: tokens.id_token, audience: GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email || p.email_verified !== true) throw new Error('invalid_google_identity');
    const email = p.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { googleId: p.sub } });
    if (!user) user = await prisma.user.findUnique({ where: { email } });
    if (!user) user = await prisma.user.create({ data: { email, name: p.name || email.split('@')[0], googleId: p.sub } });
    else if (!user.googleId) user = await prisma.user.update({ where: { id: user.id }, data: { googleId: p.sub, name: user.name || p.name || email.split('@')[0] } });
    const token = await createSession(user.id);
    const returnTo = cookies.sf_oauth_return_to || '/google-callback.html';
    res.setHeader('Set-Cookie', [sessionCookie(token), oauthCookie('sf_oauth_state', '', 0), oauthCookie('sf_oauth_return_to', '', 0)]);
    res.redirect(returnTo);
  } catch (e) { console.error('Google OAuth callback:', e.message); res.redirect('/login.html?google=error'); }
});

app.post('/api/validate-birth', (req, res) => {
  const birthDate = parseBirthPayload(req.body || {});
  if (!birthValidDate(birthDate)) return json(res, 400, { ok: false, message: '出生日期無效，請確認日期介於 1900-01-01 與今天之間。' });
  return json(res, 200, { ok: true, birthDate });
});

app.post('/api/fortune-results', requireAuth, async (req, res, next) => {
  try {
    const b = req.body || {}; const birthDate = parseBirthPayload(b);
    if (!birthValidDate(birthDate)) return json(res, 400, { ok: false, message: '出生日期無效。' });
    const type = z.string().trim().min(1).max(50).default('personal').parse(b.type || 'personal');
    const resultData = jsonSchema.parse(b.resultData);
    const item = await prisma.fortuneResult.create({ data: { userId: req.user.id, type, question: typeof b.question === 'string' ? b.question.slice(0, 2000) : null, birthDate: dateToDb(birthDate), birthTime: typeof b.birthTime === 'string' ? b.birthTime.slice(0, 20) : null, gender: typeof b.gender === 'string' ? b.gender.slice(0, 30) : null, bloodType: typeof b.bloodType === 'string' ? b.bloodType.slice(0, 20) : null, zodiac: typeof b.zodiac === 'string' ? b.zodiac.slice(0, 50) : null, resultData } });
    return json(res, 201, { ok: true, result: item });
  } catch (e) { if (e instanceof z.ZodError) return json(res, 400, { ok: false, message: e.issues?.[0]?.message || '占卜資料無效。' }); next(e); }
});
app.get('/api/fortune-results', requireAuth, async (req, res, next) => { try { const items = await prisma.fortuneResult.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 200 }); return json(res, 200, { ok: true, results: items }); } catch (e) { next(e); } });
app.get('/api/fortune-results/:id', requireAuth, async (req, res, next) => { try { const item = await prisma.fortuneResult.findFirst({ where: { id: req.params.id, userId: req.user.id } }); if (!item) return json(res, 404, { ok: false, message: '找不到這筆占卜紀錄。' }); return json(res, 200, { ok: true, result: item }); } catch (e) { next(e); } });

app.post('/api/couple-fortunes', requireAuth, async (req, res, next) => { try { const a = jsonSchema.parse(req.body?.personAData), b = jsonSchema.parse(req.body?.personBData), result = jsonSchema.parse(req.body?.resultData); const item = await prisma.coupleFortune.create({ data: { userId: req.user.id, personAData: a, personBData: b, resultData: result } }); return json(res, 201, { ok: true, result: item }); } catch (e) { if (e instanceof z.ZodError) return json(res, 400, { ok: false, message: '雙人占卜資料無效。' }); next(e); } });
app.get('/api/couple-fortunes', requireAuth, async (req, res, next) => { try { return json(res, 200, { ok: true, results: await prisma.coupleFortune.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 200 }) }); } catch (e) { next(e); } });
app.get('/api/couple-fortunes/:id', requireAuth, async (req, res, next) => { try { const item = await prisma.coupleFortune.findFirst({ where: { id: req.params.id, userId: req.user.id } }); if (!item) return json(res, 404, { ok: false, message: '找不到這筆雙人占卜紀錄。' }); return json(res, 200, { ok: true, result: item }); } catch (e) { next(e); } });

const DAILY_SALT = 'STAR-FATE-DAILY-2026-V1';
const COLORS = ['深藍','香檳白','月光銀','靛紫','星霧灰','琥珀金','午夜藍','霧玫瑰'];
const KEYWORDS = ['轉機','聚焦','整理','靠近','突破','穩定','連結','開展'];
const DIRECTIONS = ['東南','正東','西南','正北','東北','西北'];
function hash32(str) { let h = 2166136261 >>> 0; for (let i=0;i<str.length;i++){h ^= str.charCodeAt(i); h = Math.imul(h,16777619);} h += h<<13; h ^= h>>>7; h += h<<3; h ^= h>>>17; h += h<<5; return h>>>0; }
function rand01(seed) { let x=(seed>>>0)+0x6D2B79F5; x=Math.imul(x^(x>>>15),1|x); x^=x+Math.imul(x^(x>>>7),61|x); return ((x^(x>>>14))>>>0)/4294967296; }
function buildDailyFortune(birthDate, date) {
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n)); const seed=hash32(`${birthDate}|${date}|${DAILY_SALT}`); const a=rand01(seed),b=rand01(seed^0x9e3779b9),c=rand01(seed^0x85ebca6b),d=rand01(seed^0xc2b2ae35),e=rand01(seed^0x27d4eb2f); const phase=Math.floor(a*8);
  const scores={work:clamp(Math.round(58+b*34+(phase===1?5:phase===4?3:0))),wealth:clamp(Math.round(55+c*34+(phase===2?5:0))),love:clamp(Math.round(57+d*34+(phase===3?6:0))),social:clamp(Math.round(56+e*34+(phase===6?5:0))),health:clamp(Math.round(60+(1-b)*25+(phase===5?4:0)))};
  scores.overall=clamp(Math.round(scores.work*.24+scores.wealth*.18+scores.love*.22+scores.social*.18+scores.health*.18));
  const names={work:'工作／學業',wealth:'財運',love:'感情',social:'人際',health:'健康／生活'}; const ordered=Object.entries(scores).filter(([k])=>k!=='overall').sort((x,y)=>y[1]-x[1]); const dominant=ordered[0][0],secondary=ordered[1][0];
  const suggestion={work:'把最重要的一件事先完成，今天適合聚焦而不是同時追很多方向。',wealth:'先確認必要支出，再處理想買的東西；穩定現金流比一時衝動更重要。',love:'把感受說清楚，也給對方回應的空間；真誠比猜測更有力量。',social:'主動完成一次真實的交流，今天適合少一點表面應酬、多一點有效連結。',health:'把節奏放穩，安排休息、飲水與簡單活動，讓身體跟上你的步調。'}[dominant];
  const reminder={work:'不要把所有事情都當成今天一定要完成。',wealth:'避免因為一時情緒而做出大額或衝動決定。',love:'不要用沉默測試對方，直接表達會更清楚。',social:'留意自己的界線，不必為了維持氣氛而勉強答應。',health:'如果已經累了，休息本身就是今天重要的一件事。'}[secondary];
  const overview=scores.overall>=85?'今天的整體節奏偏強，適合把握清楚的機會。':scores.overall>=75?'今天有不錯的推進感，穩住節奏就容易把優勢放大。':scores.overall>=65?'今天屬於穩定累積型，先把眼前的事情做好，運勢會逐步變順。':'今天適合放慢一點，先整理狀態，再決定下一步。';
  return {version:1,dateKey:date,birthDate,seed,scores,overall:scores.overall,luckyNumber:Math.floor(rand01(seed^0x165667b1)*9)+1,luckyColor:COLORS[Math.floor(c*COLORS.length)%COLORS.length],luckyDirection:DIRECTIONS[Math.floor(e*DIRECTIONS.length)%DIRECTIONS.length],keyword:KEYWORDS[(phase+Math.floor(scores.overall/10))%KEYWORDS.length],dominant:names[dominant],secondary:names[secondary],overview,suggestion,reminder};
}
app.get('/api/daily-fortune', requireAuth, async (req, res, next) => {
  try {
    const requested = typeof req.query.date === 'string' && dateSchema.safeParse(req.query.date).success ? req.query.date : taipeiDateKey();
    const today = taipeiDateKey(); const fortuneDate = requested <= today ? requested : today;
    let birthDate = typeof req.query.birthDate === 'string' ? req.query.birthDate : null;
    if (!birthDate) { const latest = await prisma.fortuneResult.findFirst({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }); birthDate = latest ? latest.birthDate.toISOString().slice(0,10) : null; }
    if (!birthValidDate(birthDate)) return json(res, 400, { ok: false, message: '找不到有效出生日期，請先完成一次個人占卜或提供有效出生日期。' });
    let row = await prisma.dailyFortune.findUnique({ where: { userId_fortuneDate_birthDate: { userId: req.user.id, fortuneDate: dateToDb(fortuneDate), birthDate: dateToDb(birthDate) } } });
    if (!row) row = await prisma.dailyFortune.create({ data: { userId: req.user.id, fortuneDate: dateToDb(fortuneDate), birthDate: dateToDb(birthDate), resultData: buildDailyFortune(birthDate, fortuneDate) } });
    return json(res, 200, { ok: true, fortune: row });
  } catch (e) { next(e); }
});

app.get('/api/products', async (req,res,next)=>{ try { return json(res,200,{ok:true,products:await prisma.product.findMany({where:{status:'active'},orderBy:{createdAt:'asc'}})}); } catch(e){next(e);} });
app.post('/api/orders', requireAuth, async (req,res,next)=>{ try { const productId=z.string().min(1).max(100).parse(req.body?.productId); const product=await prisma.product.findFirst({where:{id:productId,status:'active'}}); if(!product)return json(res,404,{ok:false,message:'找不到可購買的產品。'}); const order=await prisma.order.create({data:{userId:req.user.id,productId:product.id,amount:product.price,currency:product.currency,status:'pending'}}); return json(res,201,{ok:true,order:{...order,product}}); } catch(e){if(e instanceof z.ZodError)return json(res,400,{ok:false,message:'productId 無效。'});next(e);} });
app.get('/api/orders', requireAuth, async(req,res,next)=>{try{return json(res,200,{ok:true,orders:await prisma.order.findMany({where:{userId:req.user.id},include:{product:true},orderBy:{createdAt:'desc'},take:200})});}catch(e){next(e);}});
app.get('/api/orders/:id', requireAuth, async(req,res,next)=>{try{const order=await prisma.order.findFirst({where:{id:req.params.id,userId:req.user.id},include:{product:true}});if(!order)return json(res,404,{ok:false,message:'找不到這筆訂單。'});return json(res,200,{ok:true,order});}catch(e){next(e);}});

app.get('/api/paid-results/:id', requireAuth, async(req,res,next)=>{try{const result=await prisma.paidResult.findFirst({where:{id:req.params.id,userId:req.user.id},include:{order:true}});if(!result||result.order.status!=='paid')return json(res,403,{ok:false,message:'付款尚未完成，無法取得付費結果。'});return json(res,200,{ok:true,result});}catch(e){next(e);}});

app.post('/api/favorites', requireAuth, async(req,res,next)=>{try{const fortuneId=z.string().min(1).parse(req.body?.fortuneId);const fortune=await prisma.fortuneResult.findFirst({where:{id:fortuneId,userId:req.user.id}});if(!fortune)return json(res,404,{ok:false,message:'找不到你的占卜紀錄。'});const item=await prisma.favorite.upsert({where:{userId_fortuneId:{userId:req.user.id,fortuneId}},update:{},create:{userId:req.user.id,fortuneId}});return json(res,201,{ok:true,favorite:item});}catch(e){if(e instanceof z.ZodError)return json(res,400,{ok:false,message:'fortuneId 無效。'});next(e);}});
app.delete('/api/favorites/:fortuneId', requireAuth, async(req,res,next)=>{try{await prisma.favorite.deleteMany({where:{userId:req.user.id,fortuneId:req.params.fortuneId}});return json(res,200,{ok:true});}catch(e){next(e);}});
app.get('/api/favorites', requireAuth, async(req,res,next)=>{try{return json(res,200,{ok:true,favorites:await prisma.favorite.findMany({where:{userId:req.user.id},include:{fortune:true},orderBy:{createdAt:'desc'}})});}catch(e){next(e);}});

app.post('/api/shares', requireAuth, async(req,res,next)=>{try{const fortuneId=z.string().min(1).parse(req.body?.fortuneId);const fortune=await prisma.fortuneResult.findFirst({where:{id:fortuneId,userId:req.user.id}});if(!fortune)return json(res,404,{ok:false,message:'找不到你的占卜紀錄。'});const shareToken=crypto.randomBytes(24).toString('base64url');const expiresAt=req.body?.expiresAt?new Date(req.body.expiresAt):null;const item=await prisma.share.create({data:{userId:req.user.id,fortuneId,shareToken,expiresAt:Number.isNaN(expiresAt?.getTime())?null:expiresAt}});return json(res,201,{ok:true,share:item});}catch(e){if(e instanceof z.ZodError)return json(res,400,{ok:false,message:'fortuneId 無效。'});next(e);}});
app.get('/api/shares/:token', async(req,res,next)=>{try{const item=await prisma.share.findUnique({where:{shareToken:req.params.token},include:{fortune:true}});if(!item||item.expiresAt&&item.expiresAt<=new Date())return json(res,404,{ok:false,message:'分享連結不存在或已過期。'});return json(res,200,{ok:true,share:{id:item.id,shareToken:item.shareToken,fortune:item.fortune,expiresAt:item.expiresAt}});}catch(e){next(e);}});

app.use((err, req, res, next) => { console.error(err); if (res.headersSent) return next(err); if (err instanceof Prisma.PrismaClientKnownRequestError) { if (err.code === 'P2002') return json(res,409,{ok:false,message:'資料已存在。'}); } return json(res,500,{ok:false,message:'伺服器發生錯誤，請稍後再試。'}); });

const server = app.listen(PORT, () => console.log(`STAR FATE backend listening on ${PORT} (${NODE_ENV})`));
async function shutdown(signal){ console.log(`${signal}: shutting down`); await prisma.$disconnect(); server.close(()=>process.exit(0)); }
process.on('SIGTERM',()=>shutdown('SIGTERM')); process.on('SIGINT',()=>shutdown('SIGINT'));
