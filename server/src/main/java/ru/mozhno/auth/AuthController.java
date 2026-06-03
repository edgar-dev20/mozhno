package ru.mozhno.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal UserPrincipal user) {
        return authService.getCurrentUser(user.email());
    }

    @ExceptionHandler(AuthService.InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(AuthService.InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", ex.getMessage()));
    }
}