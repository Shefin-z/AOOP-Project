package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.model.CommunityPost;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class CommunityModerationService {
    public record Result(int spamScore, int fraudScore, int riskScore, String riskLabel, String reasons, String status) { }
    public Result analyse(String content, List<CommunityPost> recentPosts) {
        String text = content == null ? "" : content.trim(); String lower = text.toLowerCase(Locale.ROOT); int spam = 0, fraud = 0; List<String> reasons = new ArrayList<>();
        for (String keyword : List.of("buy now", "limited offer", "click here", "easy money", "giveaway", "prize", "whatsapp", "telegram")) if (lower.contains(keyword)) { spam += 10; reasons.add("spam phrase: " + keyword); }
        for (String keyword : List.of("otp", "password", "pin", "send money", "bkash", "nagad", "rocket", "registration fee", "guaranteed investment", "guaranteed crypto", "guaranteed forex", "guaranteed profit")) if (lower.contains(keyword)) { fraud += 12; reasons.add("fraud signal: " + keyword); }
        int links = text.split("https?://", -1).length - 1; if (links >= 3) { spam += 18; reasons.add("too many links"); }
        if (text.matches(".*(.)\\1{5,}.*")) { spam += 10; reasons.add("repeated characters"); }
        long letters = text.chars().filter(Character::isLetter).count(); long caps = text.chars().filter(Character::isUpperCase).count(); if (letters >= 12 && caps * 100 / letters >= 70) { spam += 10; reasons.add("excessive capital letters"); }
        if (recentPosts.stream().anyMatch(post -> post.getContent().trim().equalsIgnoreCase(text))) { spam += 35; reasons.add("duplicate recent post"); }
        spam = Math.min(100, spam); fraud = Math.min(100, fraud); int risk = Math.min(100, Math.max(spam, fraud)); String label = fraud >= 38 ? "fraud" : spam >= 35 ? "spam" : risk >= 20 ? "suspicious" : "safe";
        return new Result(spam, fraud, risk, label, String.join("; ", reasons), risk >= 20 ? "pending_review" : "visible");
    }
}
