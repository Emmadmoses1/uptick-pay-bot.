const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const ADMIN_ID = 7565077798;
const UPDATES_CHANNEL = '@uptickupdates';
const PAYMENTS_CHANNEL = '@uptickpayments';

// 40 Professional Templates
const TEMPLATES = [
  { id: 1, title: '💰 Payment Proof', text: '✅ *PAYMENT SUCCESSFUL!*\n\nAnother happy member just got paid!\n\n💸 Amount: ₦XXX\n🏦 Bank: XXX\n\n🚀 Join now and start earning!\n\n📞 @upticksupport' },
  { id: 2, title: '🎉 Welcome Bonus', text: '🎁 *FREE ₦5,000 BONUS!*\n\nNew users get ₦5,000 just for verifying!\n\n✅ Join both channels\n✅ Verify account\n✅ Get ₦5,000 instantly\n\nStart now: @uptickpay_bot' },
  { id: 3, title: '👥 Referral Alert', text: '👥 *NEW EARNINGS ALERT!*\n\nSomeone just earned ₦XXX from referrals!\n\n💰 You can too! ₦5,000 per referral\n\nStart inviting friends now!\n\n🔗 @uptickpay_bot' },
  { id: 4, title: '🚀 Motivation', text: '🚀 *DON\'T MISS OUT!*\n\nThousands are earning daily on UPTICK PAY!\n\n💰 ₦5,000 per referral\n🎁 ₦5,000 welcome bonus\n💳 Withdraw from ₦75,000\n\nStart today: @uptickpay_bot' },
  { id: 5, title: '📊 Stats Update', text: '📊 *PLATFORM STATS*\n\n👥 100,000+ Users\n💰 ₦50M+ Paid Out\n✅ Instant Payments\n\nJoin the winning team!\n@uptickpay_bot' },
  { id: 6, title: '💳 Withdrawal Notice', text: '💳 *WITHDRAWAL UPDATE*\n\nPending withdrawals are being processed!\n\n⏱ Processing time: 24-48 hours\n💰 Min withdrawal: ₦75,000\n\nHave questions? @upticksupport' },
  { id: 7, title: '🎯 Daily Goal', text: '🎯 *TODAY\'S GOAL*\n\nInvite 5 friends = ₦25,000!\n\nSounds easy? It IS easy!\n\nShare your link now and start earning 💰\n\n@uptickpay_bot' },
  { id: 8, title: '⭐ Testimonial', text: '⭐ *WHAT USERS SAY*\n\n"I earned ₦50,000 in my first week!" - Happy Member\n\n💰 You can too!\n🎁 Start with ₦5,000 bonus\n\n@uptickpay_bot' },
  { id: 9, title: '🔥 Urgent', text: '🔥 *LIMITED TIME!*\n\nReferral bonus still at ₦5,000!\n\nDon\'t wait - start inviting friends now!\n\nEvery referral counts 💰\n\n@uptickpay_bot' },
  { id: 10, title: '📢 Announcement', text: '📢 *ANNOUNCEMENT*\n\nWe\'re growing fast! 🚀\n\nNew features coming soon!\n\nStay tuned for updates.\n\n@uptickupdates' },
  { id: 11, title: '💡 Tips', text: '💡 *EARNING TIPS*\n\n1. Share in groups\n2. Post on social media\n3. Tell friends & family\n4. Be consistent\n\nSmall efforts = Big rewards! 💰\n\n@uptickpay_bot' },
  { id: 12, title: '🏆 Leaderboard', text: '🏆 *TOP EARNERS THIS WEEK*\n\n1. ₦500,000\n2. ₦350,000\n3. ₦250,000\n\nYou could be next! Start now!\n\n@uptickpay_bot' },
  { id: 13, title: '✅ Verification', text: '✅ *GET VERIFIED TODAY!*\n\nSteps:\n1. Join @uptickupdates\n2. Join @uptickpayments\n3. Click Verify\n4. Get ₦5,000 bonus!\n\nEasy peasy! 🎉\n\n@uptickpay_bot' },
  { id: 14, title: '🎊 Weekend', text: '🎊 *WEEKEND EARNING!\n\nDon\'t stop grinding!\n\nEarn even on weekends 💰\n\nShare your link and make money!\n\n@uptickpay_bot' },
  { id: 15, title: '💪 Motivation', text: '💪 *STAY MOTIVATED!*\n\nEvery big earner started small.\n\nKeep sharing, keep earning!\n\nYour breakthrough is coming! 🚀\n\n@uptickpay_bot' },
  { id: 16, title: '📱 Social Share', text: '📱 *SHARE ON SOCIAL MEDIA*\n\nPost your referral link on:\n• WhatsApp\n• Facebook\n• Twitter\n• Instagram\n\nMore shares = More earnings! 💰\n\n@uptickpay_bot' },
  { id: 17, title: '🎁 Bonus Alert', text: '🎁 *BONUS ALERT!*\n\nEvery new user gets ₦5,000!\n\nTell your friends NOW!\n\nDon\'t let them miss out!\n\n@uptickpay_bot' },
  { id: 18, title: '⏰ Reminder', text: '⏰ *DAILY REMINDER*\n\nHave you shared your link today?\n\nEvery share is a potential ₦5,000!\n\nStart now! 💰\n\n@uptickpay_bot' },
  { id: 19, title: '🌟 Success Story', text: '🌟 *SUCCESS STORY*\n\n"I started with ₦0 and now I earn ₦100K weekly!"\n\nYour story can be next!\n\nStart today: @uptickpay_bot' },
  { id: 20, title: '📈 Growth', text: '📈 *WE\'RE GROWING!*\n\n100K+ members and counting!\n\nBe part of something big!\n\nJoin now and earn 💰\n\n@uptickpay_bot' },
  { id: 21, title: '💳 Payment Update', text: '💳 *PAYMENTS PROCESSED!*\n\nAll approved withdrawals sent!\n\nCheck your account 💰\n\nMore payments coming soon!\n\n@uptickpayments' },
  { id: 22, title: '🔔 Notification', text: '🔔 *DID YOU KNOW?*\n\nYou can earn ₦25,000 daily!\n\nJust invite 5 friends!\n\nStart your journey now! 🚀\n\n@uptickpay_bot' },
  { id: 23, title: '🎯 Challenge', text: '🎯 *7-DAY CHALLENGE*\n\nInvite 3 friends daily = ₦105,000 weekly!\n\nAre you up for it?\n\nStart today! 💪\n\n@uptickpay_bot' },
  { id: 24, title: '💎 Premium', text: '💎 *PREMIUM OPPORTUNITY*\n\nTop referrers get special bonuses!\n\nBe in the top 10!\n\nEarn more, live better! 💰\n\n@uptickpay_bot' },
  { id: 25, title: '🌅 Morning', text: '🌅 *GOOD MORNING!*\n\nNew day, new earnings!\n\nShare your link before breakfast!\n\nMake today count! 💰\n\n@uptickpay_bot' },
  { id: 26, title: '🌙 Evening', text: '🌙 *GOOD EVENING!*\n\nHow much did you earn today?\n\nTomorrow can be better!\n\nKeep sharing! 🚀\n\n@uptickpay_bot' },
  { id: 27, title: '🎓 Tutorial', text: '🎓 *HOW TO EARN MORE*\n\n1. Share in 10 groups daily\n2. Post on your status\n3. Create a channel\n4. Be consistent\n\nMaster these = Big earnings! 💰\n\n@uptickpay_bot' },
  { id: 28, title: '🏃 Quick Earn', text: '🏃 *QUICK EARNING TIP*\n\nShare your link in 5 groups NOW!\n\nPotential earnings: ₦25,000+\n\nWhat are you waiting for?\n\n@uptickpay_bot' },
  { id: 29, title: '🎪 Event', text: '🎪 *SPECIAL EVENT!*\n\nDouble earnings this week!\n\nEvery referral counts double!\n\nLimited time only! 🔥\n\n@uptickpay_bot' },
  { id: 30, title: '📊 Report', text: '📊 *WEEKLY REPORT*\n\nTotal paid this week: ₦X,XXX,XXX\n\nBe part of next week\'s stats!\n\nStart referring today! 💰\n\n@uptickpay_bot' },
  { id: 31, title: '🤝 Partnership', text: '🤝 *PARTNER WITH US!*\n\nHave a large audience?\n\nEarn even more as a partner!\n\nDM @upticksupport\n\n@uptickpay_bot' },
  { id: 32, title: '🎁 Giveaway', text: '🎁 *GIVEAWAY ALERT!*\n\nTop 10 referrers this week get bonus!\n\n1st: ₦50,000\n2nd: ₦30,000\n3rd: ₦20,000\n\nStart sharing! 🚀\n\n@uptickpay_bot' },
  { id: 33, title: '💬 Testimonial 2', text: '💬 *"I was skeptical at first, but UPTICK PAY is REAL!"*\n\nThousands of satisfied users!\n\nJoin now and see for yourself 💰\n\n@uptickpay_bot' },
  { id: 34, title: '🔗 Link Tips', text: '🔗 *MAXIMIZE YOUR LINK*\n\n• Add to bio\n• Post in stories\n• Send to contacts\n• Share in groups\n\nEvery click could be ₦5,000! 💰\n\n@uptickpay_bot' },
  { id: 35, title: '📢 Channel', text: '📢 *CREATE YOUR CHANNEL!*\n\nMake a channel about earning online\n\nShare your referral link there\n\nBuild your own audience! 🚀\n\n@uptickpay_bot' },
  { id: 36, title: '💡 Idea', text: '💡 *EARNING IDEA*\n\nMake a "How to earn ₦5,000" video\n\nShare on TikTok/YouTube\n\nAdd your referral link!\n\nViral = Big earnings! 💰\n\n@uptickpay_bot' },
  { id: 37, title: '🎯 Focus', text: '🎯 *STAY FOCUSED!*\n\nDon\'t compare your Day 1 to someone\'s Day 100.\n\nKeep going!\n\nYour time is coming! 🚀\n\n@uptickpay_bot' },
  { id: 38, title: '🏦 Bank Alert', text: '🏦 *BANK ALERT!*\n\nAnother batch of payments sent!\n\nCheck your account!\n\nMore coming soon 💰\n\n@uptickpayments' },
  { id: 39, title: '🌟 Review', text: '🌟 *5-STAR REVIEW*\n\n"Best earning platform!" - User\n\nJoin 100,000+ happy members!\n\nStart your journey today 💰\n\n@uptickpay_bot' },
  { id: 40, title: '🚀 Final Push', text: '🚀 *FINAL PUSH!*\n\nEnd of month approaching!\n\nMaximize your earnings!\n\nShare, share, share! 💰\n\n@uptickpay_bot' }
];

function fm(amount) {
  return '₦' + parseFloat(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function checkMembership(tid, channel) {
  try { const m = await bot.telegram.getChatMember(channel, tid); return ['member','administrator','creator'].includes(m.status); } catch(e) { return false; }
}

async function refreshUser(ctx) {
  const { data: u } = await supabase.from('users').select('*').eq('telegram_id', ctx.from.id).single();
  if (u) ctx.user = u;
}

const mainKeyboard = Markup.keyboard([
  ['📊 Dashboard', '👥 Invite Friends'],
  ['✅ Verify Account', '💳 Withdraw Funds'],
  ['👤 My Profile', '📜 History'],
  ['📢 Join Channels', 'ℹ️ Help']
]).resize().persistent();

const adminKeyboard = Markup.keyboard([
  ['📊 Stats', '👥 Users'],
  ['💳 Withdrawals', '✏️ Edit Balance'],
  ['📢 Post to Channel', '📋 Templates'],
  ['📢 Broadcast', '🔙 Exit Admin']
]).resize();

bot.use(async (ctx, next) => {
  if (ctx.from) {
    const tid = ctx.from.id;
    let { data: u } = await supabase.from('users').select('*').eq('telegram_id', tid).single();
    if (!u) {
      const { data: nu } = await supabase.from('users').insert({
        telegram_id: tid, first_name: ctx.from.first_name||'User',
        last_name: ctx.from.last_name||'', username: ctx.from.username||''
      }).select().single();
      u = nu;
    }
    ctx.user = u;
  }
  return next();
});

// START
bot.start(async (ctx) => {
  await refreshUser(ctx); const u = ctx.user; const ref = ctx.startPayload;
  if (ref && !u.referred_by) {
    const { data: r } = await supabase.from('users').select('telegram_id').eq('referral_code',ref).single();
    if (r && r.telegram_id !== u.telegram_id) await supabase.from('users').update({referred_by:r.telegram_id}).eq('id',u.id);
  }
  await ctx.replyWithMarkdown('🟡 *WELCOME TO UPTICK PAY* 🟡\n\n👋 *'+u.first_name+'*!\n💎 Earn *'+fm(5000)+'* per referral!\n💰 Balance: *'+fm(u.balance)+'*\n👥 Refs: *'+(u.successful_referrals||0)+'*\n🔗 `https://t.me/uptickpay_bot?start='+u.referral_code+'`\n👇 Use buttons:', mainKeyboard);
});

// DASHBOARD
bot.hears('📊 Dashboard', async (ctx) => {
  await refreshUser(ctx); const u = ctx.user;
  const { data: p } = await supabase.from('withdrawals').select('id').eq('user_id',u.id).eq('status','pending').single();
  const can = u.balance>=75000 && (u.successful_referrals||0)>=7 && !p;
  await ctx.replyWithMarkdown('📊 *DASHBOARD*\n💰 '+fm(u.balance)+'\n👥 '+(u.successful_referrals||0)+' refs\n💳 Can Withdraw: '+(can?'✅':'❌'), mainKeyboard);
});

// INVITE
bot.hears('👥 Invite Friends', async (ctx) => {
  await refreshUser(ctx); const u = ctx.user;
  const btn = Markup.inlineKeyboard([[Markup.button.switchToChat('📤 SHARE',u.referral_code)]]);
  await ctx.replyWithMarkdown('👥 *INVITE*\n🔗 `https://t.me/uptickpay_bot?start='+u.referral_code+'`\n📋 `'+u.referral_code+'`\n👥 '+(u.successful_referrals||0)+' refs',{...btn,...mainKeyboard});
});

// VERIFY
bot.hears('✅ Verify Account', async (ctx) => {
  await refreshUser(ctx); const u = ctx.user;
  if(u.is_verified) return ctx.reply('✅ Already!',mainKeyboard);
  const ck = await ctx.reply('🔍 Checking...');
  const uo = await checkMembership(u.telegram_id,UPDATES_CHANNEL);
  const po = await checkMembership(u.telegram_id,PAYMENTS_CHANNEL);
  await ctx.deleteMessage(ck.message_id);
  if(uo&&po){
    await supabase.from('users').update({is_verified:true,is_member_uptickupdates:true,is_member_uptickpayments:true,membership_verified_at:new Date().toISOString()}).eq('id',u.id);
    await ctx.replyWithMarkdown('✅ *VERIFIED!*\n🎁 '+fm(5000)+' bonus!',mainKeyboard);
  }else{
    const bt = Markup.inlineKeyboard([[Markup.button.url('📢 JOIN','https://t.me/uptickupdates')],[Markup.button.url('💳 JOIN','https://t.me/uptickpayments')]]);
    await ctx.reply('❌ Join both!',{...bt,...mainKeyboard});
  }
});

// WITHDRAW
bot.hears('💳 Withdraw Funds', async (ctx) => {
  await refreshUser(ctx); const u = ctx.user;
  if(!u.is_verified) return ctx.reply('❌ Verify!',mainKeyboard);
  if(u.balance<75000) return ctx.reply('❌ Min '+fm(75000),mainKeyboard);
  if((u.successful_referrals||0)<7) return ctx.reply('❌ 7 refs needed',mainKeyboard);
  const qb = Markup.inlineKeyboard([[Markup.button.callback('💵 '+fm(75000),'q_75000'),Markup.button.callback('💵 '+fm(100000),'q_100000')]]);
  await ctx.replyWithMarkdown('💳 *WITHDRAW*\n💰 '+fm(u.balance)+'\nSend:\n```\nAMOUNT\nBANK\nNAME\nACCOUNT\n```',{...qb,...mainKeyboard});
});

// PROFILE
bot.hears('👤 My Profile', async (ctx) => {
  await refreshUser(ctx); const u = ctx.user;
  await ctx.replyWithMarkdown('👤 '+u.first_name+'\n💰 '+fm(u.balance)+'\n👥 '+(u.successful_referrals||0)+' refs\n🔗 `'+u.referral_code+'`',mainKeyboard);
});

// HISTORY
bot.hears('📜 History', async (ctx) => {
  const { data: w } = await supabase.from('withdrawals').select('*').eq('user_id',ctx.from.id).order('created_at',{ascending:false}).limit(10);
  let m='📜 *HISTORY*\n\n';
  if(w&&w.length) w.forEach(function(x){m+=(x.status==='approved'?'✅':'⏳')+' '+fm(x.amount)+' | '+x.bank_name+'\n';});
  else m+='No withdrawals.';
  await ctx.replyWithMarkdown(m,mainKeyboard);
});

// CHANNELS
bot.hears('📢 Join Channels', async (ctx) => {
  const bt = Markup.inlineKeyboard([[Markup.button.url('📢 UPDATES','https://t.me/uptickupdates')],[Markup.button.url('💳 PAYMENTS','https://t.me/uptickpayments')]]);
  await ctx.reply('📢 Join both:',{...bt,...mainKeyboard});
});

// HELP
bot.hears('ℹ️ Help', async (ctx) => {
  await ctx.reply('ℹ️ *HELP*\n💰 '+fm(5000)+'/ref\n💳 Min '+fm(75000)+'\n👥 7 refs\n📞 @upticksupport',mainKeyboard);
});

// WITHDRAWAL TEXT - Only processes if NOT in edit mode
bot.on('text', async (ctx, next) => {
  const t = ctx.message.text.trim();
  if(t.match(/^[📊👥✅💳👤📜📢ℹ️🔙✏️📋]/)||t.startsWith('/')) return next();
  if(ctx.session && ctx.session.editMode) return next();
  const lines = t.split('\n').map(function(l){return l.trim()});
  if(lines.length!==4) return next();
  const [am,bn,an,ac] = lines;
  const a = parseFloat(am);
  if(isNaN(a)||a<75000||!/^\d{10}$/.test(ac)) return next();
  await refreshUser(ctx); const u = ctx.user;
  if(!u.is_verified||a>parseFloat(u.balance)||(u.successful_referrals||0)<7) return;
  await supabase.from('withdrawals').insert({user_id:u.id,amount:a,bank_name:bn,account_name:an,account_number:ac,status:'pending'});
  await ctx.replyWithMarkdown('✅ *SUBMITTED!*\n💰 '+fm(a)+'\n🏦 '+bn+'\n⏳ Pending...',mainKeyboard);
});

// INLINE
bot.action('retry_verify', async (ctx) => {
  await ctx.answerCbQuery(); const u = ctx.user;
  const uo = await checkMembership(u.telegram_id,UPDATES_CHANNEL);
  const po = await checkMembership(u.telegram_id,PAYMENTS_CHANNEL);
  if(uo&&po){await supabase.from('users').update({is_verified:true}).eq('id',u.id);await ctx.replyWithMarkdown('✅ Verified!',mainKeyboard);}
  else{await ctx.answerCbQuery('Join both!',{show_alert:true});}
});
bot.action('q_75000',async(ctx)=>{await ctx.answerCbQuery();await ctx.reply('Send:\n75000\nBANK\nNAME\nACCOUNT',mainKeyboard);});
bot.action('q_100000',async(ctx)=>{await ctx.answerCbQuery();await ctx.reply('Send:\n100000\nBANK\nNAME\nACCOUNT',mainKeyboard);});

// ═══════════════ ADMIN PANEL ═══════════════
bot.command('admin', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return ctx.reply('⛔ Access Denied\n\n🔑 Your ID: `'+ctx.from.id+'`\n👤 Admin ID: `'+ADMIN_ID+'`',{parse_mode:'Markdown'});
  await ctx.replyWithMarkdown('🔐 *ADMIN CONTROL PANEL*\n\n━━━━━━━━━━━━━━━━━━\n👋 Welcome, *'+ctx.from.first_name+'*!\n\n📊 Manage your platform below:\n━━━━━━━━━━━━━━━━━━', adminKeyboard);
});

// STATS
bot.hears('📊 Stats', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  const {count:t} = await supabase.from('users').select('*',{count:'exact',head:true});
  const {data:w} = await supabase.from('withdrawals').select('status,amount');
  const paid = w?w.filter(function(x){return x.status==='approved'}).reduce(function(s,x){return s+parseFloat(x.amount)},0):0;
  const pend = w?w.filter(function(x){return x.status==='pending'}).length:0;
  await ctx.replyWithMarkdown('📊 *PLATFORM STATISTICS*\n\n━━━━━━━━━━━━━━━━━━\n👥 *Total Users:* '+ (t||0) +'\n💰 *Total Paid:* '+fm(paid)+'\n⏳ *Pending:* '+pend+'\n━━━━━━━━━━━━━━━━━━', adminKeyboard);
});

// USERS - With Copyable Telegram ID
bot.hears('👥 Users', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  const {data:u} = await supabase.from('users').select('*').order('created_at',{ascending:false}).limit(15);
  let m='👥 *RECENT USERS*\n\n━━━━━━━━━━━━━━━━━━\n';
  const btns = [];
  if(u) u.forEach(function(x,i){
    m+=(i+1)+'. *'+x.first_name+'* @'+(x.username||'N/A')+'\n';
    m+='   💰 '+fm(x.balance)+' | 👥 '+(x.successful_referrals||0)+' refs\n';
    m+='   🆔 `'+x.telegram_id+'`\n';
    m+='   ✅ '+(x.is_verified?'Verified':'Unverified')+' | '+x.account_status+'\n\n';
    btns.push([Markup.button.callback('📋 Copy ID #'+(i+1)+' (`'+x.telegram_id+'`)', 'copyid_'+x.telegram_id)]);
  });
  btns.push([Markup.button.callback('🔄 Refresh Users', 'refresh_users')]);
  await ctx.replyWithMarkdown(m,{...Markup.inlineKeyboard(btns),...adminKeyboard});
});

// Copy Telegram ID
bot.action(/copyid_(.+)/, async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  const id = ctx.match[1];
  await ctx.answerCbQuery('✅ ID Copied: '+id, {show_alert: true});
  await ctx.reply('📋 *Telegram ID:* `'+id+'`',{parse_mode:'Markdown'});
});

// Refresh Users
bot.action('refresh_users', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery('🔄 Refreshing...');
  const {data:u} = await supabase.from('users').select('*').order('created_at',{ascending:false}).limit(15);
  let m='👥 *RECENT USERS (Refreshed)*\n\n━━━━━━━━━━━━━━━━━━\n';
  const btns = [];
  if(u) u.forEach(function(x,i){
    m+=(i+1)+'. *'+x.first_name+'* @'+(x.username||'N/A')+'\n';
    m+='   💰 '+fm(x.balance)+' | 👥 '+(x.successful_referrals||0)+' refs\n';
    m+='   🆔 `'+x.telegram_id+'`\n';
    m+='   ✅ '+(x.is_verified?'Verified':'Unverified')+' | '+x.account_status+'\n\n';
    btns.push([Markup.button.callback('📋 Copy ID #'+(i+1)+' (`'+x.telegram_id+'`)', 'copyid_'+x.telegram_id)]);
  });
  btns.push([Markup.button.callback('🔄 Refresh Users', 'refresh_users')]);
  await ctx.replyWithMarkdown(m,{...Markup.inlineKeyboard(btns),...adminKeyboard});
});

// WITHDRAWALS
bot.hears('💳 Withdrawals', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  const {data:w} = await supabase.from('withdrawals').select('*,user:user_id(first_name,telegram_id)').eq('status','pending');
  if(!w||!w.length) return ctx.reply('✅ *No Pending Withdrawals*',{parse_mode:'Markdown',...adminKeyboard});
  let m='💳 *PENDING WITHDRAWALS*\n\n━━━━━━━━━━━━━━━━━━\n'; const bt=[];
  w.forEach(function(x,i){
    m+=(i+1)+'. 💰 *'+fm(x.amount)+'*\n';
    m+='   👤 '+(x.user?x.user.first_name:'N/A')+' | 🏦 '+x.bank_name+'\n';
    m+='   👤 '+x.account_name+' | 🔢 `'+x.account_number+'`\n';
    m+='   🆔 `'+(x.user?x.user.telegram_id:'N/A')+'`\n\n';
    bt.push([Markup.button.callback('✅ Approve #'+(i+1),'app_'+x.id),Markup.button.callback('❌ Reject #'+(i+1),'rej_'+x.id)]);
  });
  await ctx.replyWithMarkdown(m,{...Markup.inlineKeyboard(bt),...adminKeyboard});
});

bot.action(/app_(.+)/,async(ctx)=>{
  if(ctx.from.id!==ADMIN_ID)return;await ctx.answerCbQuery();
  const {data:w}=await supabase.from('withdrawals').select('*,user:user_id(*)').eq('id',ctx.match[1]).single();
  if(!w)return;
  await supabase.from('withdrawals').update({status:'approved',processed_at:new Date().toISOString()}).eq('id',w.id);
  try{await bot.telegram.sendMessage(w.user.telegram_id,'✅ *Withdrawal Approved!*\n\n💰 Amount: '+fm(w.amount)+'\n🏦 '+w.bank_name+'\n\n💸 Payment on the way!',{parse_mode:'Markdown'});}catch(e){}
  await ctx.reply('✅ Approved '+fm(w.amount)+' for '+w.user.first_name);
});

bot.action(/rej_(.+)/,async(ctx)=>{
  if(ctx.from.id!==ADMIN_ID)return;await ctx.answerCbQuery();
  const {data:w}=await supabase.from('withdrawals').select('*,user:user_id(*)').eq('id',ctx.match[1]).single();
  if(!w)return;
  await supabase.from('withdrawals').update({status:'rejected'}).eq('id',w.id);
  try{await bot.telegram.sendMessage(w.user.telegram_id,'❌ Withdrawal Rejected.\n\nContact @upticksupport',{parse_mode:'Markdown'});}catch(e){}
  await ctx.reply('❌ Rejected '+fm(w.amount)+' for '+w.user.first_name);
});

// ═══════════════ EDIT BALANCE - FIXED ═══════════════
bot.hears('✏️ Edit Balance', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  ctx.session = { step: 'edit_search', editMode: true };
  await ctx.replyWithMarkdown('✏️ *EDIT USER BALANCE*\n\n━━━━━━━━━━━━━━━━━━\n🔍 Search user by *Username*\n\n📝 Enter the username (with or without @):\n\n_Example: johndoe or @johndoe_', Markup.keyboard([['🔙 Cancel']]).resize());
});

bot.hears('🔙 Cancel', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  ctx.session = {};
  await ctx.reply('❌ Operation Cancelled.', adminKeyboard);
});

// EDIT BALANCE TEXT HANDLER - Uses editMode flag
bot.on('text', async (ctx, next) => {
  if(!ctx.session || !ctx.session.editMode || ctx.from.id !== ADMIN_ID) return next();
  const t = ctx.message.text.trim();
  if(t === '🔙 Cancel'){ctx.session = {};return ctx.reply('Cancelled.', adminKeyboard);}

  if(ctx.session.step === 'edit_search'){
    const username = t.replace('@','').toLowerCase().trim();
    const {data: users} = await supabase.from('users').select('*').ilike('username', '%'+username+'%').limit(10);
    
    if(!users || users.length === 0){
      return ctx.reply('❌ No user found with: *@'+username+'*\n\nTry again or 🔙 Cancel',{parse_mode:'Markdown'});
    }
    
    if(users.length === 1){
      const u = users[0];
      ctx.session.editUser = u;
      ctx.session.step = 'edit_amount';
      await ctx.replyWithMarkdown('👤 *User Found!*\n\n📛 Name: *'+u.first_name+'* '+ (u.last_name||'') +'\n👤 @'+(u.username||'N/A')+'\n🆔 ID: `'+u.telegram_id+'`\n💰 Balance: *'+fm(u.balance)+'*\n👥 Refs: *'+(u.successful_referrals||0)+'*\n\n📝 Enter *new balance* amount:');
      return;
    } else {
      ctx.session.foundUsers = users;
      ctx.session.step = 'edit_select';
      let m = '👥 *MULTIPLE USERS FOUND*\n\n━━━━━━━━━━━━━━━━━━\n';
      const btns = [];
      users.forEach(function(u,i){
        m += (i+1)+'. *'+u.first_name+'* '+ (u.last_name||'') +'\n';
        m += '   👤 @'+(u.username||'N/A')+' | 🆔 `'+u.telegram_id+'`\n';
        m += '   💰 '+fm(u.balance)+' | 👥 '+(u.successful_referrals||0)+' refs\n\n';
        btns.push([Markup.button.callback('Select #'+(i+1)+': '+u.first_name, 'seluser_'+(i+1))]);
      });
      btns.push([Markup.button.callback('🔙 Cancel', 'cancel_search')]);
      await ctx.replyWithMarkdown(m,{...Markup.inlineKeyboard(btns),...Markup.keyboard([['🔙 Cancel']]).resize()});
      return;
    }
  }
  
  if(ctx.session.step === 'edit_amount'){
    const amt = parseFloat(t);
    if(isNaN(amt)||amt<0) return ctx.reply('❌ Invalid. Enter positive number:');
    ctx.session.editAmount = amt;
    ctx.session.step = 'edit_confirm';
    await ctx.replyWithMarkdown('📋 *CONFIRM*\n\n👤 '+ctx.session.editUser.first_name+'\n💰 Old: *'+fm(ctx.session.editUser.balance)+'*\n💰 New: *'+fm(amt)+'*\n\nReply *YES* to confirm:');
    return;
  }

  if(ctx.session.step === 'edit_confirm'){
    if(t.toUpperCase()==='YES'){
      await supabase.from('users').update({balance:ctx.session.editAmount}).eq('id',ctx.session.editUser.id);
      try{await bot.telegram.sendMessage(ctx.session.editUser.telegram_id,'✏️ Balance updated to: *'+fm(ctx.session.editAmount)+'*',{parse_mode:'Markdown'});}catch(e){}
      await ctx.replyWithMarkdown('✅ *UPDATED!*\n💰 '+fm(ctx.session.editAmount), adminKeyboard);
    }else{
      await ctx.reply('❌ Cancelled.', adminKeyboard);
    }
    ctx.session={};
    return;
  }
  return next();
});

// User selection
bot.action(/seluser_(.+)/, async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  const index = parseInt(ctx.match[1])-1;
  const u = ctx.session.foundUsers[index];
  ctx.session.editUser = u;
  ctx.session.step = 'edit_amount';
  await ctx.replyWithMarkdown('👤 *Selected: '+u.first_name+'*\n💰 Current: '+fm(u.balance)+'\n\n📝 Enter new balance:');
});

bot.action('cancel_search', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  ctx.session = {};
  await ctx.reply('❌ Cancelled.', adminKeyboard);
});

// ═══════════════ POST TO CHANNEL ═══════════════
bot.hears('📢 Post to Channel', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  ctx.session = { step: 'select_channel' };
  const chBtns = Markup.inlineKeyboard([
    [Markup.button.callback('📢 @uptickupdates (Updates Channel)', 'ch_updates')],
    [Markup.button.callback('💳 @uptickpayments (Payments Channel)', 'ch_payments')],
    [Markup.button.callback('🔙 Cancel', 'post_cancel')]
  ]);
  await ctx.replyWithMarkdown('📢 *POST TO CHANNEL*\n\n━━━━━━━━━━━━━━━━━━\n📌 *Step 1:* Select target channel\n━━━━━━━━━━━━━━━━━━', chBtns);
});

bot.action('ch_updates', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  ctx.session = { channel: '@uptickupdates', channelName: 'UPDATES', step: 'select_method' };
  await showPostMethod(ctx);
});

bot.action('ch_payments', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  ctx.session = { channel: '@uptickpayments', channelName: 'PAYMENTS', step: 'select_method' };
  await showPostMethod(ctx);
});

bot.action('post_cancel', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session = {};
  await ctx.reply('❌ Post cancelled.', adminKeyboard);
});

async function showPostMethod(ctx) {
  const methodBtns = Markup.inlineKeyboard([
    [Markup.button.callback('✍️ Write Custom Message', 'method_custom')],
    [Markup.button.callback('📋 Select from 40 Templates', 'method_template')],
    [Markup.button.callback('🔙 Back to Channel Selection', 'post_back')]
  ]);
  await ctx.replyWithMarkdown('📢 *POST TO* `'+ctx.session.channel+'`\n\n━━━━━━━━━━━━━━━━━━\n📌 *Step 2:* Choose posting method\n━━━━━━━━━━━━━━━━━━', methodBtns);
}

bot.action('post_back', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  ctx.session = { step: 'select_channel' };
  const chBtns = Markup.inlineKeyboard([
    [Markup.button.callback('📢 @uptickupdates (Updates Channel)', 'ch_updates')],
    [Markup.button.callback('💳 @uptickpayments (Payments Channel)', 'ch_payments')],
    [Markup.button.callback('🔙 Cancel', 'post_cancel')]
  ]);
  await ctx.replyWithMarkdown('📢 *SELECT CHANNEL*', chBtns);
});

bot.action('method_custom', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  ctx.session.step = 'post_text';
  await ctx.replyWithMarkdown('✍️ *WRITE CUSTOM MESSAGE*\n\n━━━━━━━━━━━━━━━━━━\n📢 Channel: `'+ctx.session.channel+'`\n\n📝 Send your message below:\n\n_Supports Markdown formatting_', Markup.keyboard([['🔙 Cancel']]).resize());
});

bot.action('method_template', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  ctx.session.step = 'select_template';
  await showTemplatePage(ctx, 1);
});

async function showTemplatePage(ctx, page) {
  const start = (page-1)*10;
  const btns = [];
  for(let i=start; i<start+10 && i<TEMPLATES.length; i+=2){
    const row = [Markup.button.callback((i+1)+'. '+TEMPLATES[i].title, 'seltpl_'+(i+1))];
    if(TEMPLATES[i+1]) row.push(Markup.button.callback((i+2)+'. '+TEMPLATES[i+1].title, 'seltpl_'+(i+2)));
    btns.push(row);
  }
  const navBtns = [];
  if(page>1) navBtns.push(Markup.button.callback('⬅️ Prev Page '+(page-1), 'tplnav_'+(page-1)));
  if(page<4) navBtns.push(Markup.button.callback('Next Page '+(page+1)+' ➡️', 'tplnav_'+(page+1)));
  if(navBtns.length) btns.push(navBtns);
  btns.push([Markup.button.callback('🔙 Back to Method', 'method_template_back')]);
  await ctx.replyWithMarkdown('📋 *TEMPLATES - Page '+page+'/4*\n\n━━━━━━━━━━━━━━━━━━\n📢 Channel: `'+ctx.session.channel+'`\n📌 Select a template:\n━━━━━━━━━━━━━━━━━━', Markup.inlineKeyboard(btns));
}

bot.action('method_template_back', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  ctx.session.step = 'select_method';
  await showPostMethod(ctx);
});

bot.action(/tplnav_(.+)/, async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  await showTemplatePage(ctx, parseInt(ctx.match[1]));
});

bot.action(/seltpl_(.+)/, async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  const id = parseInt(ctx.match[1]);
  const tpl = TEMPLATES[id-1];
  ctx.session.postText = tpl.text;
  ctx.session.tplTitle = tpl.title;
  
  const previewBtns = Markup.inlineKeyboard([
    [Markup.button.callback('✅ POST TO '+ctx.session.channel, 'post_confirm')],
    [Markup.button.callback('✏️ Edit Before Posting', 'edit_before_post')],
    [Markup.button.callback('🔙 Back to Templates', 'method_template')]
  ]);
  
  await ctx.replyWithMarkdown('📋 *TEMPLATE PREVIEW*\n\n━━━━━━━━━━━━━━━━━━\n📌 *'+tpl.title+'*\n📢 Channel: `'+ctx.session.channel+'`\n━━━━━━━━━━━━━━━━━━\n\n'+tpl.text+'\n\n━━━━━━━━━━━━━━━━━━', previewBtns);
});

bot.action('edit_before_post', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  ctx.session.step = 'post_text';
  await ctx.replyWithMarkdown('✍️ *EDIT MESSAGE*\n\nCurrent text:\n\n'+ctx.session.postText+'\n\n📝 Send the edited message:', Markup.keyboard([['🔙 Cancel']]).resize());
});

// Handle post text
bot.on('text', async (ctx, next) => {
  if(!ctx.session||ctx.session.step!=='post_text'||ctx.from.id!==ADMIN_ID) return next();
  const t = ctx.message.text.trim();
  if(t==='🔙 Cancel'){ctx.session={};return ctx.reply('Cancelled.',adminKeyboard);}
  
  ctx.session.postText = t;
  ctx.session.step = 'post_confirm';
  await ctx.replyWithMarkdown('📋 *FINAL PREVIEW*\n\n━━━━━━━━━━━━━━━━━━\n📢 Channel: `'+ctx.session.channel+'`\n━━━━━━━━━━━━━━━━━━\n\n'+t+'\n\n━━━━━━━━━━━━━━━━━━\n\nPost this message?',Markup.inlineKeyboard([
    [Markup.button.callback('✅ POST NOW', 'post_confirm')],
    [Markup.button.callback('✏️ Edit Again', 'edit_before_post')],
    [Markup.button.callback('❌ Cancel', 'post_cancel')]
  ]));
  return;
});

bot.action('post_confirm', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  try{
    await bot.telegram.sendMessage(ctx.session.channel, ctx.session.postText, {parse_mode:'Markdown'});
    await ctx.replyWithMarkdown('✅ *POSTED SUCCESSFULLY!*\n\n━━━━━━━━━━━━━━━━━━\n📢 Channel: `'+ctx.session.channel+'`\n📅 Time: '+new Date().toLocaleString()+'\n━━━━━━━━━━━━━━━━━━\n\nMessage delivered!', adminKeyboard);
  }catch(e){
    await ctx.reply('❌ *POST FAILED*\n\n'+e.message+'\n\nMake sure bot is admin in the channel!',{parse_mode:'Markdown',...adminKeyboard});
  }
  ctx.session={};
});

// TEMPLATES BROWSER
bot.hears('📋 Templates', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  ctx.session = { step: 'browse_templates' };
  await showTemplateBrowser(ctx, 1);
});

async function showTemplateBrowser(ctx, page) {
  const start = (page-1)*10;
  const btns = [];
  for(let i=start; i<start+10 && i<TEMPLATES.length; i+=2){
    const row = [Markup.button.callback((i+1)+'. '+TEMPLATES[i].title, 'browsetpl_'+(i+1))];
    if(TEMPLATES[i+1]) row.push(Markup.button.callback((i+2)+'. '+TEMPLATES[i+1].title, 'browsetpl_'+(i+2)));
    btns.push(row);
  }
  const navBtns = [];
  if(page>1) navBtns.push(Markup.button.callback('⬅️ Page '+(page-1), 'browsenav_'+(page-1)));
  if(page<4) navBtns.push(Markup.button.callback('Page '+(page+1)+' ➡️', 'browsenav_'+(page+1)));
  if(navBtns.length) btns.push(navBtns);
  await ctx.replyWithMarkdown('📋 *TEMPLATE LIBRARY - Page '+page+'/4*\n\n━━━━━━━━━━━━━━━━━━\nBrowse all 40 templates\n━━━━━━━━━━━━━━━━━━',{...Markup.inlineKeyboard(btns),...adminKeyboard});
}

bot.action(/browsenav_(.+)/, async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  await showTemplateBrowser(ctx, parseInt(ctx.match[1]));
});

bot.action(/browsetpl_(.+)/, async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  const tpl = TEMPLATES[parseInt(ctx.match[1])-1];
  await ctx.replyWithMarkdown('📋 *'+tpl.title+'*\n\n━━━━━━━━━━━━━━━━━━\n'+tpl.text+'\n━━━━━━━━━━━━━━━━━━\n\nUse 📢 *Post to Channel* to post this template.', Markup.inlineKeyboard([
    [Markup.button.callback('📢 Post This Template', 'use_template_'+tpl.id)],
    [Markup.button.callback('🔙 Back to Templates', 'browse_back')]
  ]));
});

bot.action('browse_back', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  await showTemplateBrowser(ctx, 1);
});

bot.action(/use_template_(.+)/, async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  await ctx.answerCbQuery();
  const tpl = TEMPLATES[parseInt(ctx.match[1])-1];
  ctx.session = { step: 'select_channel', postText: tpl.text, tplTitle: tpl.title, fromTemplate: true };
  const chBtns = Markup.inlineKeyboard([
    [Markup.button.callback('📢 @uptickupdates (Updates)', 'ch_updates')],
    [Markup.button.callback('💳 @uptickpayments (Payments)', 'ch_payments')]
  ]);
  await ctx.replyWithMarkdown('📢 *POST TEMPLATE*\n\nTemplate: *'+tpl.title+'*\n\nSelect channel:', chBtns);
});

// BROADCAST
bot.hears('📢 Broadcast', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  ctx.session={broadcast:true};
  await ctx.replyWithMarkdown('📢 *BROADCAST MESSAGE*\n\n━━━━━━━━━━━━━━━━━━\nSend message to ALL users:\n\n_Supports Markdown_',Markup.keyboard([['🔙 Cancel Broadcast']]).resize());
});

bot.hears('🔙 Cancel Broadcast', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  ctx.session={};
  await ctx.reply('Broadcast cancelled.',adminKeyboard);
});

bot.on('text', async (ctx, next) => {
  if(ctx.session&&ctx.session.broadcast&&ctx.from.id===ADMIN_ID){
    const txt = ctx.message.text;
    if(txt==='🔙 Cancel Broadcast') return;
    const {data:u}=await supabase.from('users').select('telegram_id');
    let s=0; 
    if(u) for(const x of u){
      try{await bot.telegram.sendMessage(x.telegram_id,'📢 *BROADCAST*\n\n'+txt,{parse_mode:'Markdown'});s++;}catch(e){}
      await new Promise(r=>setTimeout(r,100));
    }
    ctx.session={};
    await ctx.replyWithMarkdown('✅ *BROADCAST COMPLETE!*\n\n📤 Sent to: *'+s+'* users',adminKeyboard);
    return;
  }
  return next();
});

// EXIT ADMIN
bot.hears('🔙 Exit Admin', async (ctx) => {
  if(ctx.from.id!==ADMIN_ID) return;
  ctx.session={};
  await ctx.replyWithMarkdown('👋 *Exited Admin Panel*\n\nReturned to main menu.',mainKeyboard);
});

// COMMANDS
bot.command('dashboard',async(ctx)=>{await ctx.reply('Use 📊 button!',mainKeyboard);});
bot.command('invite',async(ctx)=>{await ctx.reply('Use 👥 button!',mainKeyboard);});
bot.command('verify',async(ctx)=>{await ctx.reply('Use ✅ button!',mainKeyboard);});
bot.command('withdraw',async(ctx)=>{await ctx.reply('Use 💳 button!',mainKeyboard);});
bot.command('help',async(ctx)=>{await ctx.reply('Use ℹ️ button!',mainKeyboard);});

// LAUNCH
bot.launch().then(function(){
  console.log('╔══════════════════════════════════════╗');
  console.log('║      🤖 UPTICK PAY BOT ONLINE       ║');
  console.log('║      Admin ID: 7565077798           ║');
  console.log('║      40 Templates Ready             ║');
  console.log('║      Edit by Username: ✅           ║');
  console.log('╚══════════════════════════════════════╝');
}).catch(function(err){console.error('Error:',err.message);});

process.once('SIGINT',function(){bot.stop('SIGINT');});
process.once('SIGTERM',function(){bot.stop('SIGTERM');});