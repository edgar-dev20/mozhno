package dev.mozhno.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.environments.Environment;
import dev.mozhno.environments.EnvironmentRepository;
import dev.mozhno.exception.ConflictException;
import dev.mozhno.exception.QuotaExceededException;
import dev.mozhno.mail.EmailTemplateService;
import dev.mozhno.projects.Project;
import dev.mozhno.projects.ProjectRepository;
import dev.mozhno.spi.NotificationSpi;
import dev.mozhno.spi.QuotaSpi;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import static dev.mozhno.client.HashUtils.generateRawToken;
import static dev.mozhno.client.HashUtils.sha256;

@Service
public class UserInviteService {

    private static final Map<String, String> RU_INVITE_SUBJECT = Map.of("ru", "Приглашение в Mozhno", "en", "Invitation to Mozhno");

    private final EmailTemplateService emailTemplateService;
    private final InviteTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationSpi notificationSpi;
    private final DomainEventPublisher events;
    private final QuotaSpi quotaSpi;
    private final AuthProperties authProperties;
    private final ProjectRepository projectRepository;
    private final EnvironmentRepository environmentRepository;
    private final String baseUrl;

    public UserInviteService(EmailTemplateService emailTemplateService,
                             InviteTokenRepository tokenRepository,
                             UserRepository userRepository,
                             PasswordEncoder passwordEncoder,
                             NotificationSpi notificationSpi,
                             DomainEventPublisher events,
                             QuotaSpi quotaSpi,
                             AuthProperties authProperties,
                             ProjectRepository projectRepository,
                             EnvironmentRepository environmentRepository,
                             dev.mozhno.config.MozhnoProperties mozhnoProperties) {
        this.emailTemplateService = emailTemplateService;
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationSpi = notificationSpi;
        this.events = events;
        this.quotaSpi = quotaSpi;
        this.authProperties = authProperties;
        this.projectRepository = projectRepository;
        this.environmentRepository = environmentRepository;
        this.baseUrl = mozhnoProperties.getBaseUrl();
    }

    @Transactional
    public void inviteUser(InviteUserRequest request, Integer createdBy) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("User with email " + request.email() + " already exists");
        }

        QuotaSpi.QuotaResult quota = quotaSpi.canCreateUser(null);
        if (quota instanceof QuotaSpi.Blocked blocked) {
            throw new QuotaExceededException(blocked.current(), blocked.limit(), blocked.planName());
        }

        String rawToken = generateRawToken();
        String tokenHash = sha256(rawToken);
        String locale = request.locale() != null ? request.locale() : "ru";

        InviteToken token = new InviteToken();
        token.setEmail(request.email());
        token.setRole(request.role());
        token.setCreatedBy(createdBy);
        token.setTokenHash(tokenHash);
        token.setLocale(locale);
        token.setExpiresAt(Instant.now().plus(authProperties.getInvite().getTokenTtlDays(), ChronoUnit.DAYS));
        tokenRepository.save(token);

        String inviteLink = baseUrl + "/accept-invite#token=" + rawToken;
        String html = emailTemplateService.renderInviteEmail(inviteLink, locale);
        String subject = RU_INVITE_SUBJECT.getOrDefault(locale, "Invitation to Mozhno");

        notificationSpi.send(new NotificationSpi.NotificationEvent(
            "EMAIL", request.email(), subject, html, null));

        events.publish(DomainEvent.of(null, "user.invited", "user",
            null, request.email(), "Invitation sent for role: " + request.role()));
    }

    @Transactional
    public UserDto acceptInvite(String rawToken, String name, String password) {
        String tokenHash = sha256(rawToken);
        InviteToken token = tokenRepository.findByHashForUpdate(tokenHash);

        if (token == null) {
            throw new InvalidInviteTokenException("Invalid or expired invite link");
        }
        if (token.getUsedAt() != null) {
            throw new InvalidInviteTokenException("This invite link has already been used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidInviteTokenException("Invite link has expired");
        }

        PasswordValidator.validate(password, token.getEmail());

        User user = userRepository.findByEmail(token.getEmail());
        if (user == null) {
            user = new User();
            user.setEmail(token.getEmail());
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setName(name != null ? name : token.getEmail());
            user.setRole(token.getRole());
            user.setStatus("active");
            user.setLocale(token.getLocale() != null ? token.getLocale() : "ru");
            Project project = createDefaultProject();
            user.setProjectId(project.getId());
            userRepository.save(user);
        } else if ("invited".equals(user.getStatus())) {
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setName(name != null ? name : user.getName());
            user.setRole(token.getRole());
            user.setStatus("active");
            if (user.getProjectId() == null) {
                Project project = createDefaultProject();
                user.setProjectId(project.getId());
            }
            userRepository.save(user);
        } else {
            throw new ConflictException("User " + token.getEmail() + " cannot accept invite (status: " + user.getStatus() + ")");
        }

        tokenRepository.markUsed(token.getId());

        events.publish(DomainEvent.of(null, "user.invite_accepted", "user",
            user.getId(), user.getEmail(), "Invitation accepted, account activated"));

        return new UserDto(user.getId(), user.getEmail(), user.getName(),
            user.getRole(), user.getStatus(), user.getAvatar(), user.getLocale(),
            user.getCreatedAt(), user.getLastActiveAt());
    }

    private Project createDefaultProject() {
        Project project = new Project();
        project.setName("My Project");
        project.setDescription("");
        Project saved = projectRepository.save(project);

        Environment prod = new Environment();
        prod.setName("Production");
        prod.setProjectId(saved.getId());
        prod.setDescription("Live environment");
        prod.setColor("#2d9484");
        environmentRepository.save(prod);

        Environment staging = new Environment();
        staging.setName("Staging");
        staging.setProjectId(saved.getId());
        staging.setDescription("Pre-production testing");
        staging.setColor("#e67e22");
        environmentRepository.save(staging);

        Environment dev = new Environment();
        dev.setName("Development");
        dev.setProjectId(saved.getId());
        dev.setDescription("Local and shared development");
        dev.setColor("#3498db");
        environmentRepository.save(dev);

        return saved;
    }

    public static class InvalidInviteTokenException extends RuntimeException {
        public InvalidInviteTokenException(String message) {
            super(message);
        }
    }
}