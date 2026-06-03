package ru.mozhno.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        if ("suspended".equals(user.getStatus())) {
            throw new InvalidCredentialsException("Account is suspended");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        userRepository.updateLastActive(user.getId());
        String token = jwtService.generateAccessToken(user);
        return new LoginResponse(token, toDto(user));
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return toDto(user);
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getStatus(), user.getCreatedAt(), user.getLastActiveAt());
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) {
            super(message);
        }
    }
}