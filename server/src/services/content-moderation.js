const spamSignals = [
  [/\b(buy now|limited offer|click here|dm me|inbox me|contact me now)\b/i, 22, "Promotional or engagement-bait wording"],
  [/\b(whatsapp|telegram)\b/i, 14, "Requests contact through an external messaging service"],
  [/\b(guaranteed income|easy money|earn from home|no experience needed)\b/i, 32, "Unrealistic income promise"],
  [/\b(free gift|giveaway winner|claim (your )?prize)\b/i, 34, "Prize or giveaway language"],
];

const fraudSignals = [
  [/\b(otp|one[- ]time password|verification code|password|pin number)\b/i, 48, "Requests or references private authentication information"],
  [/\b(send|pay|transfer)\b.{0,35}\b(bkash|nagad|rocket|money|fee|taka|bdt)\b/i, 48, "Requests a money transfer"],
  [/\b(bkash|nagad|rocket)\b.{0,35}\b(send|pay|transfer|cash out)\b/i, 48, "Requests a mobile financial transaction"],
  [/\b(registration|processing|security|application)\s+fee\b/i, 38, "Requests a fee"],
  [/\b(double|triple)\b.{0,20}\b(money|investment|profit|return)\b/i, 55, "Promises implausible financial returns"],
  [/\b(crypto|forex|investment)\b.{0,30}\b(guaranteed|risk[- ]free|instant profit)\b/i, 55, "High-risk investment promise"],
];

function analyseContent(value, { duplicate = false } = {}) {
  const content = String(value || "").trim();
  const reasons = [];
  let spamScore = 0;
  let fraudScore = 0;

  for (const [pattern, score, reason] of spamSignals) {
    if (pattern.test(content)) {
      spamScore += score;
      reasons.push(reason);
    }
  }
  for (const [pattern, score, reason] of fraudSignals) {
    if (pattern.test(content)) {
      fraudScore += score;
      reasons.push(reason);
    }
  }

  const urls = content.match(/https?:\/\/\S+/gi) || [];
  if (urls.length > 2) {
    spamScore += 22;
    reasons.push("Contains several external links");
  }
  if (/(.)\1{7,}/i.test(content)) {
    spamScore += 16;
    reasons.push("Contains excessive repeated characters");
  }
  const letters = content.replace(/[^A-Za-z]/g, "");
  const uppercase = content.replace(/[^A-Z]/g, "");
  if (letters.length >= 25 && uppercase.length / letters.length > 0.72) {
    spamScore += 14;
    reasons.push("Uses excessive capital letters");
  }
  if (duplicate) {
    spamScore += 45;
    reasons.push("Duplicates a recent post from this account");
  }

  const score = Math.min(100, Math.max(spamScore, fraudScore));
  let label = "safe";
  if (fraudScore >= 38) label = "fraud";
  else if (spamScore >= 35) label = "spam";
  else if (score >= 20) label = "suspicious";

  return {
    score,
    label,
    reasons: [...new Set(reasons)],
    requiresReview: score >= 38,
  };
}

module.exports = { analyseContent };
