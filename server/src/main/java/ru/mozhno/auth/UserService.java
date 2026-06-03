package ru.mozhno.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.events.DomainEvent;
import ru.mozhno.events.DomainEventPublisher;

import java.util.List;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DomainEventPublisher events;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       DomainEventPublisher events) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.events = events;
    }

    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    public UserDto findById(Integer id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + id);
        }
        return toDto(user);
    }

    public UserDto create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("User with email " + request.email() + " already exists");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        user.setRole(request.role());
        user.setStatus("invited");
        User saved = userRepository.save(user);
        events.publish(new DomainEvent(null, "user.created", "user",
            saved.getId(), saved.getEmail(), "User invited with role: " + saved.getRole()));
        return toDto(saved);
    }

    public UserDto update(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new RuntimeException("User not found with id: " + id);
        }
        if (request.email() != null && !request.email().equals(user.getEmail()) && userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("User with email " + request.email() + " already exists");
        }
        if (request.email() != null) user.setEmail(request.email());
        if (request.password() != null) user.setPasswordHash(passwordEncoder.encode(request.password()));
        if (request.name() != null) user.setName(request.name());
        if (request.role() != null) user.setRole(request.role());
        if (request.status() != null) user.setStatus(request.status());
        User saved = userRepository.save(user);
        events.publish(new DomainEvent(null, "user.updated", "user",
            saved.getId(), saved.getEmail(), "User updated: role=" + saved.getRole() + ", status=" + saved.getStatus()));
        return toDto(saved);
    }

    public void delete(Integer id) {
        User user = userRepository.findById(id);
        String email = user != null ? user.getEmail() : String.valueOf(id);
        userRepository.delete(id);
        events.publish(new DomainEvent(null, "user.deleted", "user",
            id, email, "User deleted"));
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getStatus(), user.getCreatedAt(), user.getLastActiveAt());
    }
}