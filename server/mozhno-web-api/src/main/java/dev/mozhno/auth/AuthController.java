package dev.mozhno.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for authentication operations: login, token refresh, logout,
 * password reset, invite acceptance, and retrieving the currently authenticated user.
 *
 * @see AuthService
 * @see PasswordResetService
 * @see UserInviteService
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final UserInviteService userInviteService;
    private final JwtService jwtService;

    @PostMapping("/login")
    @Timed(value = "auth.login", description = "Login request timing")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        boolean rememberMe = request.rememberMe() != null && request.rememberMe();
        return authService.login(request.email(), request.password(),
            request.provider(), request.params(), rememberMe, request.projectId());
    }

    @PostMapping("/select-project")
    public LoginResponse selectProject(@RequestBody SelectProjectRequest request,
                                        @AuthenticationPrincipal UserPrincipal user) {
        return authService.selectProject(user.email(), request.projectId());
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(HttpServletRequest servletRequest, @RequestBody RefreshTokenRequest request) {
        Integer projectId = extractProjectIdFromBearer(servletRequest);
        return authService.refresh(request.refreshToken(), projectId);
    }

    private Integer extractProjectIdFromBearer(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            return jwtService.extractProjectIdLenient(token);
        }
        return null;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        String refreshToken = request != null ? request.refreshToken() : null;
        authService.logout(refreshToken);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal UserPrincipal user) {
        return authService.getCurrentUser(user.email());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.sendResetEmail(request.email(), request.locale());
        return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.password());
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
    }

    @PostMapping("/accept-invite")
    public UserDto acceptInvite(@Valid @RequestBody AcceptInviteRequest request) {
        return userInviteService.acceptInvite(request.token(), request.name(), request.password());
    }

    @ExceptionHandler(AuthService.InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(AuthService.InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(RefreshTokenService.TokenReuseException.class)
    public ResponseEntity<Map<String, String>> handleTokenReuse(RefreshTokenService.TokenReuseException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(PasswordResetService.InvalidTokenException.class)
    public ResponseEntity<Map<String, String>> handleInvalidResetToken(PasswordResetService.InvalidTokenException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(UserInviteService.InvalidInviteTokenException.class)
    public ResponseEntity<Map<String, String>> handleInvalidInviteToken(UserInviteService.InvalidInviteTokenException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("error", ex.getMessage()));
    }
}