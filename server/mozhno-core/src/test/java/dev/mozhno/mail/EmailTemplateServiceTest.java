package dev.mozhno.mail;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EmailTemplateServiceTest {

    private final EmailTemplateService service = new EmailTemplateService();

    @Test
    void renderResetPasswordEmail_ru_shouldContainRussianText() {
        EmailTemplateService.EmailTemplate result = service.renderResetPasswordEmail("https://example.com/reset?token=abc", "ru");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Сброс пароля");
        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("Мы получили запрос на сброс пароля");
        assertThat(html).contains("Сбросить пароль");
        assertThat(html).contains("проигнорируйте это письмо");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderResetPasswordEmail_en_shouldContainEnglishText() {
        EmailTemplateService.EmailTemplate result = service.renderResetPasswordEmail("https://example.com/reset?token=abc", "en");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Mozhno password reset");
        assertThat(html).contains("Reset your password");
        assertThat(html).contains("We received a request to reset your password");
        assertThat(html).contains("Reset password");
        assertThat(html).contains("ignore this email");
        assertThat(html).contains("lang=\"en\"");
    }

    @Test
    void renderResetPasswordEmail_default_shouldBeRussian() {
        EmailTemplateService.EmailTemplate result = service.renderResetPasswordEmail("https://example.com/reset?token=abc");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Сброс пароля");
        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderResetPasswordEmail_shouldContainResetLink() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc123", "ru").html();

        assertThat(html).contains("https://example.com/reset?token=abc123");
    }

    @Test
    void renderResetPasswordEmail_en_shouldContainResetLink() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc123", "en").html();

        assertThat(html).contains("https://example.com/reset?token=abc123");
    }

    @Test
    void renderInviteEmail_ru_shouldContainRussianText() {
        EmailTemplateService.EmailTemplate result = service.renderInviteEmail("https://example.com/invite?token=xyz", "ru");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Приглашение в можно");
        assertThat(html).contains("Приглашение");
        assertThat(html).contains("Вы получили приглашение присоединиться");
        assertThat(html).contains("Принять приглашение");
        assertThat(html).contains("потому что вас пригласили в проект");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_en_shouldContainEnglishText() {
        EmailTemplateService.EmailTemplate result = service.renderInviteEmail("https://example.com/invite?token=xyz", "en");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Invitation to Mozhno");
        assertThat(html).contains("Invitation");
        assertThat(html).contains("You've been invited to join a project");
        assertThat(html).contains("Accept invitation");
        assertThat(html).contains("because you were invited to a project");
        assertThat(html).contains("lang=\"en\"");
    }

    @Test
    void renderInviteEmail_default_shouldBeRussian() {
        EmailTemplateService.EmailTemplate result = service.renderInviteEmail("https://example.com/invite?token=xyz");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Приглашение в можно");
        assertThat(html).contains("Приглашение");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_shouldContainInviteLink() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz789", "ru").html();

        assertThat(html).contains("https://example.com/invite?token=xyz789");
    }

    @Test
    void renderInviteEmail_en_shouldContainInviteLink() {
        String html = service.renderInviteEmail("https://example.com/invite?token=xyz789", "en").html();

        assertThat(html).contains("https://example.com/invite?token=xyz789");
    }

    @Test
    void renderResetPasswordEmail_shouldBeValidHtml() {
        String html = service.renderResetPasswordEmail("https://example.com/reset?token=abc", "ru").html();

        assertThat(html.trim()).startsWith("<!DOCTYPE html>");
        assertThat(html.trim()).endsWith("</html>");
    }

    @Test
    void renderInviteEmail_shouldBeValidHtml() {
        String html = service.renderInviteEmail("https://example.com/invite?token=abc", "ru").html();

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
        EmailTemplateService.EmailTemplate result = service.renderResetPasswordEmail("https://example.com/reset", "../../etc");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Сброс пароля");
        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_pathTraversal_shouldFallbackToRussian() {
        EmailTemplateService.EmailTemplate result = service.renderInviteEmail("https://example.com/invite", "../en");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Приглашение в можно");
        assertThat(html).contains("Приглашение");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderResetPasswordEmail_emptyLocale_shouldFallbackToRussian() {
        EmailTemplateService.EmailTemplate result = service.renderResetPasswordEmail("https://example.com/reset", "");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Сброс пароля");
        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderInviteEmail_nullLocale_shouldFallbackToRussian() {
        EmailTemplateService.EmailTemplate result = service.renderInviteEmail("https://example.com/invite", null);
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Приглашение в можно");
        assertThat(html).contains("Приглашение");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderAdminResetPasswordEmail_ru_shouldContainRussianText() {
        EmailTemplateService.EmailTemplate result = service.renderAdminResetPasswordEmail("https://example.com/reset?token=abc", "ru");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Сброс пароля");
        assertThat(html).contains("Сброс пароля");
        assertThat(html).contains("Администратор отправил вам ссылку");
        assertThat(html).contains("Сбросить пароль");
        assertThat(html).contains("администратор отправил сброс");
        assertThat(html).contains("lang=\"ru\"");
    }

    @Test
    void renderAdminResetPasswordEmail_en_shouldContainEnglishText() {
        EmailTemplateService.EmailTemplate result = service.renderAdminResetPasswordEmail("https://example.com/reset?token=abc", "en");
        String html = result.html();

        assertThat(result.subject()).isEqualTo("Mozhno password reset");
        assertThat(html).contains("Password reset");
        assertThat(html).contains("An administrator sent you");
        assertThat(html).contains("Reset password");
        assertThat(html).contains("an administrator sent a password reset");
        assertThat(html).contains("lang=\"en\"");
    }

    @Test
    void renderAdminResetPasswordEmail_shouldBeValidHtml() {
        String html = service.renderAdminResetPasswordEmail("https://example.com/reset?token=abc", "ru").html();

        assertThat(html.trim()).startsWith("<!DOCTYPE html>");
        assertThat(html.trim()).endsWith("</html>");
    }
}
