const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ═══════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// YOUR TELEGRAM ID FOR ADMIN ACCESS
const ADMIN_IDS = [8792865125];

// Channel usernames
const UPDATES_CHANNEL = '@uptickupdates';
const PAYMENTS_CHANNEL = '@uptickpayments';

// ═══════════════════════════════════════════════════
// FORMAT CURRENCY
// ═══════════════════════════════════════════════════
function fm(amount) {
  return '₦' + parseFloat(amount || 0).toLocaleString('en-NG', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

// ═══════════════════════════════════════════════════
// PERSISTENT REPLY KEYBOARD (Bottom Menu)
// ═══════════════════════════════════════════════════
const mainKeyboard = Markup.keyboard([
  ['📊 Dashboard', '👥 Invite Friends'],
  ['✅ Verify Account', '💳 Withdraw Funds'],
  ['👤 My Profile', '📜 History'],
  ['📢 Join Channels', 'ℹ️ Help & Support']
]).resize().persistent();

const adminKeyboard = Markup.keyboard([
  ['📊 Stats', '👥 Users'],
  ['💳 Withdrawals', '📢 Broadcast'],
  ['🔙 Exit Admin']
]).resize();

// ═══════════════════════════════════════════════════
// MIDDLEWARE - GET OR CREATE USER
// ═══════════════════════════════════════════════════
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const tid = ctx.from.id;
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', tid)
      .single();

    if (!user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          telegram_id: tid,
          first_name: ctx.from.first_name || 'User',
          last_name: ctx.from.last_name || '',
          username: ctx.from.username || ''
        })
        .select()
        .single();
      user = newUser;
    }
    ctx.user = user;
    ctx.isAdmin = ADMIN_IDS.includes(tid);
  }
  return next();
});

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════
async function checkMembership(tid, channel) {
  try {
    const member = await bot.telegram.getChatMember(channel, tid);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch { return false; }
}

async function refreshUser(ctx) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', ctx.from.id)
    .single();
  if (user) ctx.user = user;
}

// ═══════════════════════════════════════════════════
// 🏠 START COMMAND
// ═══════════════════════════════════════════════════
bot.start(async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;
  const refCode = ctx.startPayload;

  // Process referral
  if (refCode && !user.referred_by) {
    const { data: referrer } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('referral_code', refCode)
      .single();
    if (referrer && referrer.telegram_id !== user.telegram_id) {
      await supabase.from('users').update({ referred_by: referrer.telegram_id }).eq('id', user.id);
    }
  }

  const welcome = `
🟡 *WELCOME TO UPTICK PAY* 🟡
*The #1 Referral Rewards Platform*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👋 Hello, *${user.first_name}*!

💎 Earn *${fm(5000)}* for EVERY friend you invite!
━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────┐
│      👤 ACCOUNT INFO         │
├─────────────────────────────┤
│ 💰 Balance:   *${fm(user.balance)}* │
│ 👥 Referrals:  *${user.successful_referrals || 0}*  │
│ ✅ Status:  *${user.is_verified ? 'Verified ✓' : 'Unverified ✗'}* │
└─────────────────────────────┘

┌─────────────────────────────┐
│   🔗 YOUR REFERRAL LINK      │
├─────────────────────────────┤
│ \`https://t.me/uptickpay_bot?start=${user.referral_code}\` │
└─────────────────────────────┘

📋 *Code:* \`${user.referral_code}\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *GET STARTED:*
1️⃣ Join both channels
2️⃣ Tap ✅ *Verify Account*
3️⃣ Get ${fm(5000)} welcome bonus
4️⃣ Tap 👥 *Invite Friends*
5️⃣ Earn & withdraw!
━━━━━━━━━━━━━━━━━━━━━━━━━━━

👇 *Use the buttons below:*
  `;

  await ctx.replyWithMarkdown(welcome, mainKeyboard);
});

// ═══════════════════════════════════════════════════
// 📊 DASHBOARD
// ═══════════════════════════════════════════════════
bot.hears('📊 Dashboard', async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;

  const { data: pending } = await supabase
    .from('withdrawals')
    .select('id, amount')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  const canWithdraw = user.balance >= 75000 && (user.successful_referrals || 0) >= 7 && !pending;

  const dashboard = `
📊 *DASHBOARD*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *FINANCES*
┣ 💵 Available:    *${fm(user.balance)}*
┣ 🎁 Welcome Bonus: ${fm(user.welcome_bonus)}
┣ 👥 Ref Earnings:  ${fm(user.referral_earnings)}
┣ 💳 Total Withdrawn: ${fm(user.total_withdrawals)}
┗ ⏳ Pending:       ${pending ? fm(pending.amount) : 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *REFERRALS*
┣ 📊 Total Invited: *${user.referral_count || 0}*
┗ ✅ Successful:    *${user.successful_referrals || 0}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 *WITHDRAWAL ELIGIBILITY*
┣ 💰 Min ${fm(75000)}: ${user.balance >= 75000 ? '✅' : '❌'}
┣ 👥 Min 7 Refs:  ${(user.successful_referrals || 0) >= 7 ? '✅' : '❌'}
┣ ⏳ No Pending:   ${!pending ? '✅' : '⚠️'}
┗ 🎯 *CAN WITHDRAW:* ${canWithdraw ? '*✅ YES!* 🎉' : '*❌ Not Yet*'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;

  await ctx.replyWithMarkdown(dashboard, mainKeyboard);
});

// ═══════════════════════════════════════════════════
// 👥 INVITE FRIENDS
// ═══════════════════════════════════════════════════
bot.hears('👥 Invite Friends', async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;

  const invite = `
👥 *INVITE FRIENDS & EARN*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 Earn *${fm(5000)}* for EVERY friend that joins!

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 *YOUR REFERRAL LINK:*
\`https://t.me/uptickpay_bot?start=${user.referral_code}\`

📋 *YOUR CODE:* \`${user.referral_code}\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 *YOUR STATS:*
┣ 👥 Referrals: *${user.successful_referrals || 0}*
┗ 💵 Earned:    *${fm(user.referral_earnings)}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Share your link now!
  `;

  const shareButtons = Markup.inlineKeyboard([
    [Markup.button.switchToChat('📤 SHARE WITH FRIENDS', user.referral_code)],
    [Markup.button.url('📢 SHARE TO CHANNEL', `https://t.me/share/url?url=https://t.me/uptickpay_bot?start=${user.referral_code}`)],
  ]);

  await ctx.replyWithMarkdown(invite, { ...shareButtons, ...mainKeyboard });
});

// ═══════════════════════════════════════════════════
// ✅ VERIFY ACCOUNT
// ═══════════════════════════════════════════════════
bot.hears('✅ Verify Account', async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;

  if (user.is_verified) {
    return ctx.replyWithMarkdown(
      `✅ *ALREADY VERIFIED!*\n\n🎉 Account verified\n💰 Balance: *${fm(user.balance)}*\n👥 Referrals: *${user.successful_referrals || 0}*\n\nInvite friends with 👥 button below!`,
      mainKeyboard
    );
  }

  const checkMsg = await ctx.reply('🔍 *Checking memberships...*', { parse_mode: 'Markdown' });

  const updatesOk = await checkMembership(user.telegram_id, UPDATES_CHANNEL);
  const paymentsOk = await checkMembership(user.telegram_id, PAYMENTS_CHANNEL);

  await ctx.deleteMessage(checkMsg.message_id);

  if (updatesOk && paymentsOk) {
    await supabase.from('users').update({
      is_verified: true,
      is_member_uptickupdates: true,
      is_member_uptickpayments: true,
      membership_verified_at: new Date().toISOString()
    }).eq('id', user.id);

    await ctx.replyWithMarkdown(
      `✅ *VERIFICATION SUCCESSFUL!* 🎉\n\n` +
      `🎁 *${fm(5000)} Welcome Bonus* credited!\n` +
      `💰 New Balance: *${fm(parseFloat(user.balance) + 5000)}*\n\n` +
      `🚀 Start earning! Tap 👥 *Invite Friends* below!`,
      mainKeyboard
    );
  } else {
    const joinButtons = Markup.inlineKeyboard([
      [Markup.button.url('📢 JOIN UPDATES CHANNEL', 'https://t.me/uptickupdates')],
      [Markup.button.url('💳 JOIN PAYMENTS CHANNEL', 'https://t.me/uptickpayments')],
      [Markup.button.callback('🔄 VERIFY NOW', 'retry_verify')]
    ]);

    await ctx.replyWithMarkdown(
      `❌ *VERIFICATION FAILED*\n\n` +
      `Join BOTH channels:\n\n` +
      `${updatesOk ? '✅' : '❌'} @uptickupdates\n` +
      `${paymentsOk ? '✅' : '❌'} @uptickpayments\n\n` +
      `After joining, tap 🔄 VERIFY NOW below:`,
      { ...joinButtons, ...mainKeyboard }
    );
  }
});

// ═══════════════════════════════════════════════════
// 💳 WITHDRAW FUNDS
// ═══════════════════════════════════════════════════
bot.hears('💳 Withdraw Funds', async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;

  if (!user.is_verified) {
    return ctx.replyWithMarkdown('❌ *VERIFY FIRST!*\n\nTap ✅ *Verify Account* below.', mainKeyboard);
  }

  if (user.balance < 75000) {
    return ctx.replyWithMarkdown(
      `❌ *LOW BALANCE*\n\n💰 Balance: ${fm(user.balance)}\n📊 Required: ${fm(75000)}\n📉 Need: ${fm(75000 - parseFloat(user.balance))}\n\nInvite friends!`,
      mainKeyboard
    );
  }

  if ((user.successful_referrals || 0) < 7) {
    return ctx.replyWithMarkdown(
      `❌ *NEED MORE REFERRALS*\n\n👥 You have: ${user.successful_referrals || 0}\n📊 Required: 7\n📉 Need: ${7 - (user.successful_referrals || 0)} more`,
      mainKeyboard
    );
  }

  const { data: pending } = await supabase
    .from('withdrawals')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (pending) {
    return ctx.replyWithMarkdown('⏳ You have a pending withdrawal already.', mainKeyboard);
  }

  const quickButtons = Markup.inlineKeyboard([
    [Markup.button.callback(`💵 ${fm(75000)}`, 'q_75000'), Markup.button.callback(`💵 ${fm(100000)}`, 'q_100000')],
    [Markup.button.callback(`💵 ${fm(150000)}`, 'q_150000'), Markup.button.callback(`💵 ${fm(200000)}`, 'q_200000')]
  ]);

  await ctx.replyWithMarkdown(
    `💳 *WITHDRAW FUNDS*\n\n` +
    `💰 Available: *${fm(user.balance)}*\n` +
    `📊 Minimum: ${fm(75000)}\n\n` +
    `📝 *SEND DETAILS IN THIS FORMAT:*\n` +
    `\`\`\`\nAMOUNT\nBANK NAME\nACCOUNT NAME\nACCOUNT NUMBER\n\`\`\`\n` +
    `📌 *EXAMPLE:*\n` +
    `\`\`\`\n75000\nGTBank\nJohn Doe\n0123456789\n\`\`\``,
    { ...quickButtons, ...mainKeyboard }
  );
});

// ═══════════════════════════════════════════════════
// 👤 MY PROFILE
// ═══════════════════════════════════════════════════
bot.hears('👤 My Profile', async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;

  const profile = `
👤 *MY PROFILE*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📛 *Name:* ${user.first_name} ${user.last_name || ''}
👤 *Username:* @${user.username || 'N/A'}
🆔 *Telegram ID:* \`${user.telegram_id}\`
📅 *Joined:* ${new Date(user.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Verified:* ${user.is_verified ? 'Yes ✓' : 'No ✗'}
📱 *Status:* ${user.account_status.toUpperCase()}
🔗 *Ref Code:* \`${user.referral_code}\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Balance:* ${fm(user.balance)}
🎁 *Bonus:* ${fm(user.welcome_bonus)}
👥 *Ref Earnings:* ${fm(user.referral_earnings)}
💳 *Withdrawn:* ${fm(user.total_withdrawals)}
👥 *Referrals:* ${user.successful_referrals || 0}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;

  await ctx.replyWithMarkdown(profile, mainKeyboard);
});

// ═══════════════════════════════════════════════════
// 📜 HISTORY
// ═══════════════════════════════════════════════════
bot.hears('📜 History', async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  let msg = '📜 *TRANSACTION HISTORY*\n\n';

  if (withdrawals?.length) {
    msg += '💳 *Withdrawals:*\n';
    withdrawals.forEach(w => {
      const e = w.status === 'approved' ? '✅' : w.status === 'rejected' ? '❌' : '⏳';
      msg += `${e} ${fm(w.amount)} | ${w.status}\n   🏦 ${w.bank_name} | 📅 ${new Date(w.created_at).toLocaleDateString()}\n\n`;
    });
  }

  if (transactions?.length) {
    msg += '💰 *Transactions:*\n';
    transactions.forEach(tx => {
      const e = tx.type === 'welcome_bonus' ? '🎁' : tx.type === 'referral_bonus' ? '👥' : '💳';
      const s = parseFloat(tx.amount) > 0 ? '+' : '';
      msg += `${e} ${s}${fm(Math.abs(tx.amount))} | ${tx.description}\n`;
    });
  }

  if (!withdrawals?.length && !transactions?.length) {
    msg += '📭 No transactions yet.\n\nStart inviting friends! 👥';
  }

  await ctx.replyWithMarkdown(msg, mainKeyboard);
});

// ═══════════════════════════════════════════════════
// 📢 JOIN CHANNELS
// ═══════════════════════════════════════════════════
bot.hears('📢 Join Channels', async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;
  
  const updatesOk = await checkMembership(user.telegram_id, UPDATES_CHANNEL);
  const paymentsOk = await checkMembership(user.telegram_id, PAYMENTS_CHANNEL);

  const joinButtons = Markup.inlineKeyboard([
    [Markup.button.url('📢 UPDATES CHANNEL', 'https://t.me/uptickupdates')],
    [Markup.button.url('💳 PAYMENTS CHANNEL', 'https://t.me/uptickpayments')]
  ]);

  await ctx.replyWithMarkdown(
    `📢 *JOIN OUR CHANNELS*\n\n` +
    `Join both to verify & get ${fm(5000)} bonus!\n\n` +
    `📢 @uptickupdates - ${updatesOk ? '✅ Joined' : '❌ Not Joined'}\n` +
    `💳 @uptickpayments - ${paymentsOk ? '✅ Joined' : '❌ Not Joined'}\n\n` +
    `After joining, tap ✅ *Verify Account*`,
    { ...joinButtons, ...mainKeyboard }
  );
});

// ═══════════════════════════════════════════════════
// ℹ️ HELP & SUPPORT
// ═══════════════════════════════════════════════════
bot.hears('ℹ️ Help & Support', async (ctx) => {
  const help = `
ℹ️ *HELP & SUPPORT*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *MENU GUIDE:*
• 📊 Dashboard - View balance & stats
• 👥 Invite Friends - Share referral link
• ✅ Verify Account - Join channels & verify
• 💳 Withdraw Funds - Cash out earnings
• 👤 My Profile - Account information
• 📜 History - Transactions & withdrawals
• 📢 Join Channels - Channel links
• ℹ️ Help & Support - This guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *EARNING RULES:*
• Welcome Bonus: ${fm(5000)}
• Per Referral: ${fm(5000)}
• Min Withdrawal: ${fm(75000)}
• Min Referrals: 7
• One pending withdrawal at a time

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *CONTACT:*
• Support: @upticksupport
• Updates: @uptickupdates
• Payments: @uptickpayments
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;

  await ctx.replyWithMarkdown(help, mainKeyboard);
});

// ═══════════════════════════════════════════════════
// HANDLE WITHDRAWAL TEXT SUBMISSION
// ═══════════════════════════════════════════════════
bot.on('text', async (ctx, next) => {
  const text = ctx.message.text.trim();
  
  // Skip menu buttons and commands
  if (text.match(/^[📊👥✅💳👤📜📢ℹ️🔙]/) || text.startsWith('/')) return next();

  // Check if it's withdrawal format
  const lines = text.split('\n').map(l => l.trim());
  
  if (lines.length === 4) {
    const [amount, bankName, accountName, accountNumber] = lines;
    const withdrawalAmount = parseFloat(amount);

    if (!isNaN(withdrawalAmount) && withdrawalAmount >= 75000 && /^\d{10}$/.test(accountNumber)) {
      await refreshUser(ctx);
      const user = ctx.user;

      if (!user.is_verified) return ctx.reply('❌ Verify first! Tap ✅ Verify Account', mainKeyboard);
      if (withdrawalAmount > parseFloat(user.balance)) return ctx.reply(`❌ Insufficient balance! You have ${fm(user.balance)}`, mainKeyboard);
      if ((user.successful_referrals || 0) < 7) return ctx.reply(`❌ Need 7 referrals. You have ${user.successful_referrals || 0}`, mainKeyboard);

      const { data: pending } = await supabase
        .from('withdrawals')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (pending) return ctx.reply('❌ You have a pending withdrawal already.', mainKeyboard);

      await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount: withdrawalAmount,
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber,
        status: 'pending'
      });

      return ctx.replyWithMarkdown(
        `✅ *WITHDRAWAL SUBMITTED!*\n\n` +
        `💰 Amount: ${fm(withdrawalAmount)}\n` +
        `🏦 Bank: ${bankName}\n` +
        `👤 Account: ${accountName}\n` +
        `🔢 Number: ${accountNumber}\n\n` +
        `⏳ Pending admin approval...`,
        mainKeyboard
      );
    }
  }
  
  return next();
});

// ═══════════════════════════════════════════════════
// INLINE BUTTON HANDLERS
// ═══════════════════════════════════════════════════
bot.action('retry_verify', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.user;
  
  const updatesOk = await checkMembership(user.telegram_id, UPDATES_CHANNEL);
  const paymentsOk = await checkMembership(user.telegram_id, PAYMENTS_CHANNEL);

  if (updatesOk && paymentsOk) {
    await supabase.from('users').update({
      is_verified: true,
      is_member_uptickupdates: true,
      is_member_uptickpayments: true,
      membership_verified_at: new Date().toISOString()
    }).eq('id', user.id);

    await ctx.replyWithMarkdown(`✅ *VERIFIED!*\n\n🎉 ${fm(5000)} bonus credited!`, mainKeyboard);
  } else {
    await ctx.answerCbQuery('❌ Not joined both channels yet!', { show_alert: true });
  }
});

bot.action('q_75000', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📝 Send details:\n\n75000\nBANK NAME\nACCOUNT NAME\nACCOUNT NUMBER', mainKeyboard);
});

bot.action('q_100000', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📝 Send details:\n\n100000\nBANK NAME\nACCOUNT NAME\nACCOUNT NUMBER', mainKeyboard);
});

bot.action('q_150000', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📝 Send details:\n\n150000\nBANK NAME\nACCOUNT NAME\nACCOUNT NUMBER', mainKeyboard);
});

bot.action('q_200000', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📝 Send details:\n\n200000\nBANK NAME\nACCOUNT NAME\nACCOUNT NUMBER', mainKeyboard);
});

// ═══════════════════════════════════════════════════
// 🔐 ADMIN PANEL
// ═══════════════════════════════════════════════════
bot.command('admin', async (ctx) => {
  if (!ctx.isAdmin) return ctx.reply('⛔ Access denied.');

  await ctx.replyWithMarkdown(
    `🔐 *ADMIN PANEL*\n\nWelcome, ${ctx.from.first_name}!\nSelect an option:`,
    adminKeyboard
  );
});

// Admin: Stats
bot.hears('📊 Stats', async (ctx) => {
  if (!ctx.isAdmin) return;

  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: activeUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('account_status', 'active');
  const { count: verifiedUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true);
  const { count: totalRefs } = await supabase.from('referral_history').select('*', { count: 'exact', head: true });

  const { data: withdrawals } = await supabase.from('withdrawals').select('status, amount');
  const totalPaid = withdrawals?.filter(w => w.status === 'approved').reduce((s, w) => s + parseFloat(w.amount), 0) || 0;
  const pendingAmount = withdrawals?.filter(w => w.status === 'pending').reduce((s, w) => s + parseFloat(w.amount), 0) || 0;
  const pendingCount = withdrawals?.filter(w => w.status === 'pending').length || 0;

  const { data: balances } = await supabase.from('users').select('balance');
  const totalBalance = balances?.reduce((s, u) => s + parseFloat(u.balance), 0) || 0;

  const statsMsg = `
📊 *PLATFORM STATISTICS*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *USERS*
┣ Total: *${totalUsers || 0}*
┣ Active: *${activeUsers || 0}*
┣ Verified: *${verifiedUsers || 0}*
┗ Referrals: *${totalRefs || 0}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *FINANCES*
┣ Total Balance: *${fm(totalBalance)}*
┣ Total Paid: *${fm(totalPaid)}*
┣ Pending: *${fm(pendingAmount)}*
┗ Pending Count: *${pendingCount}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;

  await ctx.replyWithMarkdown(statsMsg, adminKeyboard);
});

// Admin: Users
bot.hears('👥 Users', async (ctx) => {
  if (!ctx.isAdmin) return;

  const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(20);

  let msg = '👥 *RECENT USERS*\n\n';
  users?.forEach((u, i) => {
    msg += `${i+1}. *${u.first_name}* @${u.username || 'N/A'}\n`;
    msg += `   💰 ${fm(u.balance)} | 👥 ${u.successful_referrals || 0} refs\n`;
    msg += `   ${u.is_verified ? '✅' : '❌'} | ${u.account_status}\n\n`;
  });

  await ctx.replyWithMarkdown(msg, adminKeyboard);
});

// Admin: Withdrawals
bot.hears('💳 Withdrawals', async (ctx) => {
  if (!ctx.isAdmin) return;

  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*, user:user_id(first_name, username, telegram_id)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (!withdrawals?.length) {
    return ctx.reply('✅ No pending withdrawals!', adminKeyboard);
  }

  let msg = '💳 *PENDING WITHDRAWALS*\n\n';
  const buttons = [];

  withdrawals.forEach((w, i) => {
    msg += `${i+1}. 💰 ${fm(w.amount)}\n`;
    msg += `   👤 ${w.user?.first_name} | 🏦 ${w.bank_name}\n`;
    msg += `   👤 ${w.account_name} | 🔢 ${w.account_number}\n`;
    msg += `   📅 ${new Date(w.created_at).toLocaleDateString()}\n\n`;
    buttons.push([
      Markup.button.callback(`✅ Approve #${i+1}`, `approve_${w.id}`),
      Markup.button.callback(`❌ Reject #${i+1}`, `reject_${w.id}`)
    ]);
  });

  await ctx.replyWithMarkdown(msg, { ...Markup.inlineKeyboard(buttons), ...adminKeyboard });
});

// Approve withdrawal
bot.action(/approve_(.+)/, async (ctx) => {
  if (!ctx.isAdmin) return;
  await ctx.answerCbQuery();

  const withdrawalId = ctx.match[1];
  const { data: w } = await supabase.from('withdrawals').select('*, user:user_id(*)').eq('id', withdrawalId).single();
  if (!w) return;

  await supabase.from('withdrawals').update({ status: 'approved', processed_at: new Date().toISOString() }).eq('id', withdrawalId);

  try {
    await bot.telegram.sendMessage(w.user.telegram_id,
      `✅ *Withdrawal Approved!*\n\n💰 Amount: ${fm(w.amount)}\n🏦 ${w.bank_name}\n\nYour payment has been processed!`,
      { parse_mode: 'Markdown' }
    );
  } catch (e) {}

  await ctx.reply(`✅ Approved ${fm(w.amount)} withdrawal!`);
});

// Reject withdrawal
bot.action(/reject_(.+)/, async (ctx) => {
  if (!ctx.isAdmin) return;
  await ctx.answerCbQuery();

  const withdrawalId = ctx.match[1];
  const { data: w } = await supabase.from('withdrawals').select('*, user:user_id(*)').eq('id', withdrawalId).single();
  if (!w) return;

  await supabase.from('withdrawals').update({ status: 'rejected', processed_at: new Date().toISOString() }).eq('id', withdrawalId);
  await supabase.from('users').update({ pending_withdrawals: w.user.pending_withdrawals - w.amount }).eq('id', w.user.id);

  try {
    await bot.telegram.sendMessage(w.user.telegram_id,
      `❌ *Withdrawal Rejected*\n\n💰 Amount: ${fm(w.amount)}\n\nContact @upticksupport for details.`,
      { parse_mode: 'Markdown' }
    );
  } catch (e) {}

  await ctx.reply(`❌ Rejected ${fm(w.amount)} withdrawal.`);
});

// Admin: Broadcast
bot.hears('📢 Broadcast', async (ctx) => {
  if (!ctx.isAdmin) return;
  ctx.session = ctx.session || {};
  ctx.session.awaitingBroadcast = true;
  await ctx.reply('📢 *BROADCAST*\n\nSend the message to send to all users:', Markup.keyboard([['🔙 Cancel']]).resize());
});

bot.hears('🔙 Cancel', async (ctx) => {
  if (!ctx.isAdmin) return;
  ctx.session.awaitingBroadcast = false;
  await ctx.reply('Cancelled.', adminKeyboard);
});

// Handle broadcast message
bot.on('text', async (ctx, next) => {
  if (ctx.session?.awaitingBroadcast && ctx.isAdmin) {
    const text = ctx.message.text;
    if (text === '🔙 Cancel') return;

    const { data: users } = await supabase.from('users').select('telegram_id').eq('account_status', 'active');
    let sent = 0;
    
    for (const u of users || []) {
      try {
        await bot.telegram.sendMessage(u.telegram_id, `📢 *ANNOUNCEMENT*\n\n${text}`, { parse_mode: 'Markdown' });
        sent++;
        await new Promise(r => setTimeout(r, 50)); // Rate limit
      } catch (e) {}
    }

    ctx.session.awaitingBroadcast = false;
    await ctx.reply(`✅ Broadcast sent to *${sent}* users!`, { ...Markup.removeKeyboard(), ...adminKeyboard });
    return;
  }
  return next();
});

// Admin: Exit
bot.hears('🔙 Exit Admin', async (ctx) => {
  if (!ctx.isAdmin) return;
  await ctx.replyWithMarkdown('👋 Exited admin panel.', mainKeyboard);
});

// ═══════════════════════════════════════════════════
// COMMAND HANDLERS (Fallback)
// ═══════════════════════════════════════════════════
bot.command('dashboard', async (ctx) => {
  await refreshUser(ctx);
  const user = ctx.user;
  await ctx.replyWithMarkdown(`📊 Use the *📊 Dashboard* button below!`, mainKeyboard);
});

bot.command('invite', async (ctx) => {
  await ctx.replyWithMarkdown(`👥 Use the *👥 Invite Friends* button below!`, mainKeyboard);
});

bot.command('verify', async (ctx) => {
  await ctx.replyWithMarkdown(`✅ Use the *✅ Verify Account* button below!`, mainKeyboard);
});

bot.command('withdraw', async (ctx) => {
  await ctx.replyWithMarkdown(`💳 Use the *💳 Withdraw Funds* button below!`, mainKeyboard);
});

bot.command('profile', async (ctx) => {
  await ctx.replyWithMarkdown(`👤 Use the *👤 My Profile* button below!`, mainKeyboard);
});

bot.command('history', async (ctx) => {
  await ctx.replyWithMarkdown(`📜 Use the *📜 History* button below!`, mainKeyboard);
});

bot.command('help', async (ctx) => {
  await ctx.replyWithMarkdown(`ℹ️ Use the *ℹ️ Help & Support* button below!`, mainKeyboard);
});

// ═══════════════════════════════════════════════════
// LAUNCH BOT
// ═══════════════════════════════════════════════════
bot.launch().then(() => {
  console.log('╔══════════════════════════════════════╗');
  console.log('║      🤖 UPTICK PAY BOT ONLINE       ║');
  console.log('║   Professional Reply Keyboard Menu  ║');
  console.log('║   Admin Panel: /admin command       ║');
  console.log('╚══════════════════════════════════════╝');
}).catch(err => {
  console.error('❌ Bot Error:', err.message);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));