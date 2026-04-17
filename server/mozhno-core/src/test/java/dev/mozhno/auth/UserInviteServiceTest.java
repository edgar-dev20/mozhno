package dev.mozhno.auth;

import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.mail.EmailTemplateService;
import dev.mozhno.spi.NotificationSpi;
import dev.mozhno.spi.QuotaSpi;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserInviteServiceTest {

    @Mock
    private EmailTemplateService emailTemplateService;

    @Mock
    private InviteTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationSpi notificationSpi;

    @Mock
    private DomainEventPublisher events;

    @Mock
    private QuotaSpi quotaSpi;

    @InjectMocks
    private UserInviteService userInviteService;

    private InviteUserRequest createRequest(String email, String role) {
        return new InviteUserRequest(email, role, null);
    }

    @Test
    void inviteUser_emailExists_shouldThrow() {
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userInviteService.inviteUser(
            createRequest("existing@example.com", "editor"), 1))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("already exists");
    }

    @Test
    void inviteUser_quotaBlocked_shouldThrow() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(quotaSpi.canCreateUser(null)).thenReturn(new QuotaSpi.Blocked("users", 10, 10, "Free"));

        assertThatThrownBy(() -> userInviteService.inviteUser(
            createRequest("new@example.com", "editor"), 1))
            .isInstanceOf(dev.mozhno.exception.QuotaExceededException.class)
            .hasMessageContaining("limit reached");
    }

    @Test
    void inviteUser_success_shouldStoreTokenAndSendEmail() {
        when(userRepository.existsByEmail("invitee@example.com")).thenReturn(false);
        when(quotaSpi.canCreateUser(null)).thenReturn(new QuotaSpi.Allowed());
        when(emailTemplateService.renderInviteEmail(anyString())).thenReturn("<html>invite</html>");
        when(tokenRepository.save(any(InviteToken.class))).thenAnswer(inv -> {
            InviteToken t = inv.getArgument(0);
            t.setId(1);
            return t;
        });

        userInviteService.inviteUser(createRequest("invitee@example.com", "developer"), 42);

        ArgumentCaptor<InviteToken> tokenCaptor = ArgumentCaptor.forClass(InviteToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        InviteToken saved = tokenCaptor.getValue();
        assertThat(saved.getEmail()).isEqualTo("invitee@example.com");
        assertThat(saved.getRole()).isEqualTo("developer");
        assertThat(saved.getCreatedBy()).isEqualTo(42);
        assertThat(saved.getTokenHash()).isNotEmpty();
        assertThat(saved.getExpiresAt()).isAfter(Instant.now());

        ArgumentCaptor<NotificationSpi.NotificationEvent> eventCaptor =
            ArgumentCaptor.forClass(NotificationSpi.NotificationEvent.class);
        verify(notificationSpi).send(eventCaptor.capture());
        NotificationSpi.NotificationEvent event = eventCaptor.getValue();
        assertThat(event.type()).isEqualTo("EMAIL");
        assertThat(event.recipient()).isEqualTo("invitee@example.com");
        assertThat(event.subject()).isEqualTo("Приглашение в Mozhno");
        assertThat(event.body()).isEqualTo("<html>invite</html>");

        verify(events).publish(any(DomainEvent.class));
    }

    @Test
    void acceptInvite_invalidToken_shouldThrow() {
        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(null);

        assertThatThrownBy(() -> userInviteService.acceptInvite("bad-token", "Name", "password1"))
            .isInstanceOf(UserInviteService.InvalidInviteTokenException.class)
            .hasMessageContaining("Invalid or expired");
    }

    @Test
    void acceptInvite_alreadyUsedToken_shouldThrow() {
        InviteToken token = new InviteToken();
        token.setId(1);
        token.setUsedAt(Instant.now().minus(1, java.time.temporal.ChronoUnit.HOURS));
        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);

        assertThatThrownBy(() -> userInviteService.acceptInvite("used-token", "Name", "password1"))
            .isInstanceOf(UserInviteService.InvalidInviteTokenException.class)
            .hasMessageContaining("already been used");
    }

    @Test
    void acceptInvite_expiredToken_shouldThrow() {
        InviteToken token = new InviteToken();
        token.setId(1);
        token.setExpiresAt(Instant.now().minus(1, java.time.temporal.ChronoUnit.DAYS));
        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);

        assertThatThrownBy(() -> userInviteService.acceptInvite("expired-token", "Name", "password1"))
            .isInstanceOf(UserInviteService.InvalidInviteTokenException.class)
            .hasMessageContaining("expired");
    }

    @Test
    void acceptInvite_newUser_shouldCreateUserAndMarkUsed() {
        InviteToken token = new InviteToken();
        token.setId(10);
        token.setEmail("newuser@example.com");
        token.setRole("editor");
        token.setExpiresAt(Instant.now().plus(6, java.time.temporal.ChronoUnit.DAYS));

        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);
        when(userRepository.findByEmail("newuser@example.com")).thenReturn(null);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-pw");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(100);
            return u;
        });

        UserDto result = userInviteService.acceptInvite("valid-token", "John Doe", "password123");

        assertThat(result.email()).isEqualTo("newuser@example.com");
        assertThat(result.name()).isEqualTo("John Doe");
        assertThat(result.role()).isEqualTo("editor");
        assertThat(result.status()).isEqualTo("active");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getEmail()).isEqualTo("newuser@example.com");
        assertThat(saved.getPasswordHash()).isEqualTo("hashed-pw");
        assertThat(saved.getName()).isEqualTo("John Doe");
        assertThat(saved.getRole()).isEqualTo("editor");
        assertThat(saved.getStatus()).isEqualTo("active");

        verify(tokenRepository).markUsed(10);
        verify(events).publish(any(DomainEvent.class));
    }

    @Test
    void acceptInvite_existingInvitedUser_shouldActivate() {
        User existing = new User();
        existing.setId(50);
        existing.setEmail("existing@example.com");
        existing.setStatus("invited");
        existing.setName("Old Name");

        InviteToken token = new InviteToken();
        token.setId(11);
        token.setEmail("existing@example.com");
        token.setRole("developer");
        token.setExpiresAt(Instant.now().plus(6, java.time.temporal.ChronoUnit.DAYS));

        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);
        when(userRepository.findByEmail("existing@example.com")).thenReturn(existing);
        when(passwordEncoder.encode("newpass1")).thenReturn("hashed-newpass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDto result = userInviteService.acceptInvite("valid-token", "Updated Name", "newpass1");

        assertThat(result.email()).isEqualTo("existing@example.com");
        assertThat(result.name()).isEqualTo("Updated Name");
        assertThat(result.status()).isEqualTo("active");

        assertThat(existing.getPasswordHash()).isEqualTo("hashed-newpass");
        assertThat(existing.getStatus()).isEqualTo("active");

        verify(tokenRepository).markUsed(11);
    }

    @Test
    void acceptInvite_nullName_shouldUseEmail() {
        InviteToken token = new InviteToken();
        token.setId(12);
        token.setEmail("noname@example.com");
        token.setRole("viewer");
        token.setExpiresAt(Instant.now().plus(6, java.time.temporal.ChronoUnit.DAYS));

        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);
        when(userRepository.findByEmail("noname@example.com")).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(101);
            return u;
        });

        UserDto result = userInviteService.acceptInvite("valid-token", null, "password1");

        assertThat(result.name()).isEqualTo("noname@example.com");
    }
}
