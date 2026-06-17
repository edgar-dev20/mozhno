package dev.mozhno.mail;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EmailTemplateServiceTest {

    private final EmailTemplateService service = new EmailTemplateService();

    @Test
    void renderResetPasswordEmail_ru_shouldContainRussianText() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc", "ru");

        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("Вы запросили сброс пароля");
        assertThat(html).contains("Сбросить пароль");
        assertThat(html).contains("Если вы не запрашивали сброс пароля");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderResetPasswordEmail_en_shouldContainEnglishText() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc", "en");

        assertThat(html).contains("Password reset");
        assertThat(html).contains("You have requested a password reset");
        assertThat(html).contains("Reset password");
        assertThat(html).contains("safely ignore this email");
        assertThat(html).contains("lang=\"en\"");
    }

    @Test
    void renderResetPasswordEmail_default_shouldBeRussian() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc");

        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderResetPasswordEmail_shouldContainResetLink() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc123", "ru");

        assertThat(html).contains("https://example.com/reset?token=abc123");
    }

    @Test
    void renderResetPasswordEmail_en_shouldContainResetLink() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc123", "en");

        assertThat(html).contains("https://example.com/reset?token=abc123");
    }

    @Test
    void renderInviteEmail_ru_shouldContainRussianText() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz", "ru");

        assertThat(html).contains("Добро пожаловать в можно");
        assertThat(html).contains("Вас пригласили присоединиться");
        assertThat(html).contains("Принять приглашение");
        assertThat(html).contains("Добро пожаловать в команду!");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_en_shouldContainEnglishText() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz", "en");

        assertThat(html).contains("Welcome to Mozhno");
        assertThat(html).contains("You have been invited to join");
        assertThat(html).contains("Accept invitation");
        assertThat(html).contains("Welcome to the team!");
        assertThat(html).contains("lang=\"en\"");
    }

    @Test
    void renderInviteEmail_default_shouldBeRussian() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz");

        assertThat(html).contains("Добро пожаловать в можно");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_shouldContainInviteLink() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz789", "ru");

        assertThat(html).contains("https://example.com/invite?token=xyz789");
    }

    @Test
    void renderInviteEmail_en_shouldContainInviteLink() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz789", "en");

        assertThat(html).contains("https://example.com/invite?token=xyz789");
    }

    @Test
    void renderResetPasswordEmail_shouldBeValidHtml() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc", "ru");

        assertThat(html.trim()).startsWith("<!DOCTYPE html>");
        assertThat(html.trim()).endsWith("</html>");
    }

    @Test
    void renderInviteEmail_shouldBeValidHtml() {
        String html = service.renderInviteEmail("https://example.com/invite?token=abc", "ru");

        assertThat(html.trim()).startsWith("<!DOCTYPE html>");
        assertThat(html.trim()).endsWith("</html>");
    }

    @Test
    void renderResetPasswordEmail_invalidLocale_shouldThrow() {
        assertThatThrownBy(() -> service.renderResetPasswordEmail("https://example.com/reset", "de"))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Failed to load email template");
    }

    @Test
    void renderInviteEmail_invalidLocale_shouldThrow() {
        assertThatThrownBy(() -> service.renderInviteEmail("https://example.com/invite", "de"))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Failed to load email template");
    }

    @Test
    void renderResetPasswordEmail_pathTraversal_shouldFallbackToRussian() {
        String html = service.renderResetPasswordEmail("https://example.com/reset", "../../etc");

        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_pathTraversal_shouldFallbackToRussian() {
        String html = service.renderInviteEmail("https://example.com/invite", "../en");

        assertThat(html).contains("Добро пожаловать в можно");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderResetPasswordEmail_emptyLocale_shouldFallbackToRussian() {
        String html = service.renderResetPasswordEmail("https://example.com/reset", "");

        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_nullLocale_shouldFallbackToRussian() {
        String html = service.renderInviteEmail("https://example.com/invite", null);

        assertThat(html).contains("Добро пожаловать в можно");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderAdminResetPasswordEmail_ru_shouldContainRussianText() {
        String html = service.renderAdminResetPasswordEmail("https://example.com/reset?token=abc", "ru");

        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("Администратор отправил вам ссылку");
        assertThat(html).contains("Сбросить пароль");
        assertThat(html).contains("обратитесь к администратору");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderAdminResetPasswordEmail_en_shouldContainEnglishText() {
        String html = service.renderAdminResetPasswordEmail("https://example.com/reset?token=abc", "en");

        assertThat(html).contains("Password reset");
        assertThat(html).contains("An administrator has sent you");
        assertThat(html).contains("Reset password");
        assertThat(html).contains("contact your administrator");
        assertThat(html).contains("lang=\"en\"");
    }

    @Test
    void renderAdminResetPasswordEmail_shouldBeValidHtml() {
        String html = service.renderAdminResetPasswordEmail("https://example.com/reset?token=abc", "ru");

        assertThat(html.trim()).startsWith("<!DOCTYPE html>");
        assertThat(html.trim()).endsWith("</html>");
    }
}