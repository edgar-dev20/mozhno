package dev.mozhno.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.ConflictException;
import dev.mozhno.exception.NotFoundException;

import dev.mozhno.util.MediaTypeUtils;

import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.List;

/**
 * Service for user management (CRUD).
 *
 * <p>Domain events are published on update and delete for audit
 * and integration purposes. User creation is handled exclusively through
 * the invite flow — see {@link UserInviteService}.</p>
 */
@Service
public class UserService {

    private static final long MAX_AVATAR_PIXELS = 1024L * 1024L;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DomainEventPublisher events;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       DomainEventPublisher events) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.events = events;
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
        if (request.role() != null) {
            if ("admin".equals(user.getRole()) && !"admin".equals(request.role())) {
                ensureGroupHasOtherAdmin(user);
            }
            user.setRole(request.role());
        }
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
        if (user == null) return;
        if ("admin".equals(user.getRole())) {
            ensureGroupHasOtherAdmin(user);
        }
        String email = user.getEmail();
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
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read avatar file: " + e.getMessage());
        }
        MediaType type = MediaTypeUtils.detectRasterImageType(bytes);
        if (type == null) {
            throw new BadRequestException(
                "UNSUPPORTED_IMAGE_FORMAT",
                "Only PNG, JPEG, GIF or WEBP images are allowed");
        }
        int[] dims;
        try {
            dims = MediaTypeUtils.readDimensions(bytes);
        } catch (IOException e) {
            throw new BadRequestException(
                "IMAGE_READ_ERROR",
                "Failed to read image");
        }
        if (dims == null) {
            throw new BadRequestException(
                "IMAGE_READ_ERROR",
                "Failed to read image");
        }
        long pixels = (long) dims[0] * (long) dims[1];
        if (pixels > MAX_AVATAR_PIXELS) {
            throw new BadRequestException(
                "IMAGE_TOO_LARGE",
                dims[0] + "x" + dims[1] + " px. Max: 1024x1024 px");
        }
        userRepository.updateAvatarData(id, bytes);
        user.setAvatar("blob" + MediaTypeUtils.extensionFor(type));
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

    private void ensureGroupHasOtherAdmin(User user) {
        int children = userRepository.countByCreatedBy(user.getId());
        if (children > 0) {
            int otherAdmins = userRepository.countAdminsCreatedBy(user.getId(), user.getId());
            if (otherAdmins == 0) {
                throw new ConflictException(
                    "Cannot remove the last admin from a group that has members. Promote another member to admin first.");
            }
        }
    }
}