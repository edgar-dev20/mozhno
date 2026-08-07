package dev.mozhno.mail;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EmailTemplateService {

    private static final Pattern TITLE_PATTERN = Pattern.compile("<title>([^<]+)</title>");

    public record EmailTemplate(String subject, String html) {}

    private final String style;
    private final Map<String, String> templateCache = new ConcurrentHashMap<>();

    public EmailTemplateService() {
        this.style = loadResource("mail/email-style.css");
    }

    public EmailTemplate renderResetPasswordEmail(String resetLink, String locale) {
        String safeLocale = validateLocale(locale);
        return render("mail/" + safeLocale + "/reset-password.html", resetLink);
    }

    public EmailTemplate renderInviteEmail(String inviteLink, String locale) {
        String safeLocale = validateLocale(locale);
        return render("mail/" + safeLocale + "/invite.html", inviteLink);
    }

    public EmailTemplate renderAdminResetPasswordEmail(String resetLink, String locale) {
        String safeLocale = validateLocale(locale);
        return render("mail/" + safeLocale + "/admin-reset-password.html", resetLink);
    }

    public EmailTemplate renderResetPasswordEmail(String resetLink) {
        return renderResetPasswordEmail(resetLink, "ru");
    }

    public EmailTemplate renderInviteEmail(String inviteLink) {
        return renderInviteEmail(inviteLink, "ru");
    }

    private EmailTemplate render(String templatePath, String link) {
        String template = loadTemplate(templatePath);
        String subject = extractSubject(template);
        String html = template.replace("{{style}}", style).replace("{{link}}", link);
        html = TITLE_PATTERN.matcher(html).replaceFirst("");
        return new EmailTemplate(subject, html);
    }

    private String extractSubject(String template) {
        Matcher m = TITLE_PATTERN.matcher(template);
        return m.find() ? m.group(1).trim() : "";
    }

    private String validateLocale(String locale) {
        if (locale != null && locale.matches("^[a-z]{2}$")) {
            return locale;
        }
        return "ru";
    }

    private String loadTemplate(String path) {
        return templateCache.computeIfAbsent(path, this::loadResource);
    }

    private String loadResource(String path) {
        try {
            return new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new dev.mozhno.exception.BadRequestException("Failed to load email template: " + path);
        }
    }
}
