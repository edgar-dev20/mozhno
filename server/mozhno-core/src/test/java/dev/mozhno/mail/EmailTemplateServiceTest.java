package dev.mozhno.mail;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmailTemplateServiceTest {

    private final EmailTemplateService service = new EmailTemplateService();

    @Test
    void renderResetPasswordEmail_shouldContainResetLink() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc123");

        assertThat(html).contains("https://example.com/reset?token=abc123");
    }

    @Test
    void renderResetPasswordEmail_shouldContainRussianText() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc");

        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("Вы запросили сброс пароля");
        assertThat(html).contains("Сбросить пароль");
        assertThat(html).contains("Если вы не запрашивали сброс пароля");
    }

    @Test
    void renderResetPasswordEmail_shouldContainExpectedDesignElements() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc");

        assertThat(html).contains("можно.");
        assertThat(html).contains("JetBrains Mono");
        assertThat(html).contains("Manrope");
        assertThat(html).contains("Включай без страха.");
        assertThat(html).contains("border-radius: 24px");
        assertThat(html).contains("border-radius: 12px");
        assertThat(html).contains("letter-spacing: 0.15em");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_shouldContainInviteLink() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz789");

        assertThat(html).contains("https://example.com/invite?token=xyz789");
    }

    @Test
    void renderInviteEmail_shouldContainRussianText() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz");

        assertThat(html).contains("Добро пожаловать в можно");
        assertThat(html).contains("Вас пригласили присоединиться");
        assertThat(html).contains("Принять приглашение");
        assertThat(html).contains("Добро пожаловать в команду!");
    }

    @Test
    void renderInviteEmail_shouldContainExpectedDesignElements() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz");

        assertThat(html).contains("можно.");
        assertThat(html).contains("JetBrains Mono");
        assertThat(html).contains("Manrope");
        assertThat(html).contains("Включай без страха.");
        assertThat(html).contains("border-radius: 24px");
        assertThat(html).contains("border-radius: 12px");
        assertThat(html).contains("letter-spacing: 0.15em");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderResetPasswordEmail_shouldBeValidHtml() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc");

        assertThat(html.trim()).startsWith("<!DOCTYPE html>");
        assertThat(html.trim()).endsWith("</html>");
        assertThat(html).contains("<html");
        assertThat(html).contains("</html>");
    }

    @Test
    void renderInviteEmail_shouldBeValidHtml() {
        String html = service.renderInviteEmail("https://example.com/invite?token=abc");

        assertThat(html.trim()).startsWith("<!DOCTYPE html>");
        assertThat(html.trim()).endsWith("</html>");
        assertThat(html).contains("<html");
        assertThat(html).contains("</html>");
    }
}
