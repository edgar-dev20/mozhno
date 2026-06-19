package dev.mozhno.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.exception.ConflictException;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.exception.QuotaExceededException;

import java.io.IOException;
import java.util.List;

/**
 * Service for user management (CRUD) with quota enforcement.
 *
 * <p>Before creating a user, the {@link dev.mozhno.spi.QuotaSpi} is consulted.
 * If the tenant quota is exceeded, the operation is blocked. Domain events
 * are published on create, update, and delete for audit and integration purposes.</p>
 */
@Service
public class UserService {

    private static final String DEFAULT_STATUS = "active";
    private static final String DEFAULT_LOCALE = "ru";
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DomainEventPublisher events;
    private final QuotaSpi quotaSpi;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       DomainEventPublisher events, QuotaSpi quotaSpi) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.events = events;
        this.quotaSpi = quotaSpi;
    }

    /**
     * Returns all users as DTOs.
     *
     * @return list of user DTOs
     */
    @Transactional(readOnly = true)
    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    /**
     * Finds a user by id.
     *
     * @param id user id
     * @return user DTO
     * @throws RuntimeException if not found
     */
    @Transactional(readOnly = true)
    public UserDto findById(Integer id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new NotFoundException("User", id);
        }
        return toDto(user);
    }

    /**
     * Creates a new user after checking quota and email uniqueness.
     *
     * @param request user creation payload
     * @return created user DTO
     * @throws RuntimeException if email exists or quota is exceeded
     */
    @Transactional
    public UserDto create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("User with email " + request.email() + " already exists");
        }

        PasswordValidator.validate(request.password(), request.email());

        QuotaSpi.QuotaResult quota = quotaSpi.canCreateUser(null);
        if (quota instanceof QuotaSpi.Blocked blocked) {
            throw new QuotaExceededException(blocked.current(), blocked.limit(), blocked.planName());
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        user.setRole(request.role());
        user.setStatus(DEFAULT_STATUS);
        user.setLocale(request.locale() != null ? request.locale() : DEFAULT_LOCALE);
        User saved = userRepository.save(user);
        events.publish(DomainEvent.of(null, "user.created", "user",
            saved.getId(), saved.getEmail(), "Role: " + saved.getRole()));
        return toDto(saved);
    }

    /**
     * Updates an existing user. Only non-null fields in the request are applied.
     *
     * @param id      user id
     * @param request update payload (partial)
     * @return updated user DTO
     * @throws RuntimeException if user not found or new email conflicts
     */
    @Transactional
    public UserDto update(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new NotFoundException("User", id);
        }
        if (request.email() != null && !request.email().equals(user.getEmail()) && userRepository.existsByEmail(request.email())) {
            throw new ConflictException("User with email " + request.email() + " already exists");
        }
        if (request.email() != null) user.setEmail(request.email());
        if (request.password() != null) {
            PasswordValidator.validate(request.password(), user.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (request.name() != null) user.setName(request.name());
        if (request.role() != null) user.setRole(request.role());
        if (request.status() != null) user.setStatus(request.status());
        if (request.locale() != null) user.setLocale(request.locale());
        User saved = userRepository.save(user);
        events.publish(DomainEvent.of(null, "user.updated", "user",
            saved.getId(), saved.getEmail(), "Role: " + saved.getRole() + ", Status: " + saved.getStatus()));
        return toDto(saved);
    }

    /**
     * Deletes a user by id. Idempotent — no error if the user does not exist.
     *
     * @param id user id
     */
    @Transactional
    public void delete(Integer id) {
        User user = userRepository.findById(id);
        String email = user != null ? user.getEmail() : String.valueOf(id);
        userRepository.delete(id);
        events.publish(DomainEvent.of(null, "user.deleted", "user",
            id, email, "User deleted"));
    }

    /**
     * Uploads an avatar image for a user, storing bytes in the database.
     *
     * @param id   the user ID
     * @param file the uploaded image file
     * @return the updated user DTO
     */
    @Transactional
    public UserDto uploadAvatar(Integer id, MultipartFile file) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new NotFoundException("User", id);
        }
        try {
            byte[] bytes = file.getBytes();
            userRepository.updateAvatarData(id, bytes);
        } catch (IOException e) {
            throw new dev.mozhno.exception.BadRequestException("Failed to read avatar file: " + e.getMessage());
        }
        String ext = dev.mozhno.util.FileUtils.getExtension(file.getOriginalFilename());
        user.setAvatar("blob" + ext);
        User saved = userRepository.save(user);
        events.publish(DomainEvent.of(null, "user.avatar_updated", "user",
            saved.getId(), saved.getEmail(), "Avatar updated"));
        return toDto(saved);
    }

    /**
     * Returns the avatar binary data for a user.
     *
     * @param id the user ID
     * @return avatar bytes, or null if no avatar is set
     */
    @Transactional(readOnly = true)
    public byte[] getAvatarData(Integer id) {
        User user = userRepository.findById(id);
        if (user == null || user.getAvatar() == null || user.getAvatar().isEmpty()) {
            return null;
        }
        return userRepository.getAvatarData(id);
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getStatus(), user.getAvatar(), user.getLocale(), user.getCreatedAt(), user.getLastActiveAt());
    }
}