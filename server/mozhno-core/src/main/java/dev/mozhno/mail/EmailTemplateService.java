package dev.mozhno.mail;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailTemplateService {

    private final String style;
    private final Map<String, String> templateCache = new ConcurrentHashMap<>();

    public EmailTemplateService() {
        this.style = loadResource("mail/email-style.css");
    }

    public String renderResetPasswordEmail(String resetLink, String locale) {
        String safeLocale = validateLocale(locale);
        String template = loadTemplate("mail/" + safeLocale + "/reset-password.html");
        return template.replace("{{style}}", style).replace("{{link}}", resetLink);
    }

    public String renderInviteEmail(String inviteLink, String locale) {
        String safeLocale = validateLocale(locale);
        String template = loadTemplate("mail/" + safeLocale + "/invite.html");
        return template.replace("{{style}}", style).replace("{{link}}", inviteLink);
    }

    private String validateLocale(String locale) {
        if (locale != null && locale.matches("^[a-z]{2}$")) {
            return locale;
        }
        return "ru";
    }

    public String renderResetPasswordEmail(String resetLink) {
        return renderResetPasswordEmail(resetLink, "ru");
    }

    public String renderInviteEmail(String inviteLink) {
        return renderInviteEmail(inviteLink, "ru");
    }

    public String renderAdminResetPasswordEmail(String resetLink, String locale) {
        String safeLocale = validateLocale(locale);
        String template = loadTemplate("mail/" + safeLocale + "/admin-reset-password.html");
        return template.replace("{{style}}", style).replace("{{link}}", resetLink);
    }

    private String loadTemplate(String path) {
        return templateCache.computeIfAbsent(path, this::loadResource);
    }

    private String loadResource(String path) {
        try {
            return new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load email template: " + path, e);
        }
    }
}