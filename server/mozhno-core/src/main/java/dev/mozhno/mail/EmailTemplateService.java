package dev.mozhno.mail;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class EmailTemplateService {

    private final String style;
    private final String resetPasswordTemplate;
    private final String inviteTemplate;

    public EmailTemplateService() {
        this.style = loadResource("mail/email-style.css");
        this.resetPasswordTemplate = loadResource("mail/reset-password.html");
        this.inviteTemplate = loadResource("mail/invite.html");
    }

    public String renderResetPasswordEmail(String resetLink) {
        return resetPasswordTemplate.replace("{{style}}", style).replace("{{link}}", resetLink);
    }

    public String renderInviteEmail(String inviteLink) {
        return inviteTemplate.replace("{{style}}", style).replace("{{link}}", inviteLink);
    }

    private String loadResource(String path) {
        try {
            return new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load email template: " + path, e);
        }
    }
}
