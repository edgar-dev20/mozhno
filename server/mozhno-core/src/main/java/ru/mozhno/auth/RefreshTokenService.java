package ru.mozhno.auth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtService jwtService,
                                  JwtProperties jwtProperties, UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.userRepository = userRepository;
    }

    public static class TokenPair {
        private final String accessToken;
        private final String refreshToken;

        public TokenPair(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }

        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
    }

    public static class TokenReuseException extends RuntimeException {
        public TokenReuseException(String message) {
            super(message);
        }
    }

    public TokenPair issueTokens(User user, boolean rememberMe) {
        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken rt = createRefreshToken(user.getId(), rememberMe);
        String rawToken = generateRawToken();
        rt.setTokenHash(sha256(rawToken));
        refreshTokenRepository.save(rt);
        return new TokenPair(accessToken, rawToken);
    }

    @Transactional
    public TokenPair refresh(String rawRefreshToken) {
        String hash = sha256(rawRefreshToken);
        RefreshToken existing = refreshTokenRepository.findByHash(hash);

        if (existing == null) {
            throw new TokenReuseException("Unknown refresh token");
        }

        if (existing.isRevoked()) {
            refreshTokenRepository.revokeFamily(existing.getFamily());
            throw new TokenReuseException("Token family revoked due to potential theft");
        }

        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenReuseException("Refresh token expired");
        }

        if (existing.getUsedAt() != null) {
            refreshTokenRepository.revokeFamily(existing.getFamily());
            throw new TokenReuseException("Refresh token reuse detected — family revoked");
        }

        User user = userRepository.findById(existing.getUserId());
        if (user == null || "suspended".equals(user.getStatus())) {
            refreshTokenRepository.revokeFamily(existing.getFamily());
            throw new TokenReuseException("User not found or suspended");
        }

        String newRaw = generateRawToken();
        String newHash = sha256(newRaw);

        existing.setUsedAt(Instant.now());
        existing.setReplacedByHash(newHash);
        refreshTokenRepository.save(existing);

        RefreshToken newToken = new RefreshToken();
        newToken.setUserId(user.getId());
        newToken.setTokenHash(newHash);
        newToken.setFamily(existing.getFamily());
        newToken.setExpiresAt(existing.getExpiresAt());
        newToken.setRevoked(false);
        refreshTokenRepository.save(newToken);

        String accessToken = jwtService.generateAccessToken(user);
        return new TokenPair(accessToken, newRaw);
    }

    @Transactional
    public void revoke(String rawRefreshToken) {
        String hash = sha256(rawRefreshToken);
        RefreshToken existing = refreshTokenRepository.findByHash(hash);
        if (existing != null) {
            refreshTokenRepository.revokeFamily(existing.getFamily());
        }
    }

    public void revokeAllForUser(Integer userId) {
        refreshTokenRepository.revokeAllForUser(userId);
    }

    private RefreshToken createRefreshToken(Integer userId, boolean rememberMe) {
        Instant now = Instant.now();
        long ttlDays = rememberMe
            ? jwtProperties.getRefreshTokenTtlDays()
            : jwtProperties.getRefreshTokenTtlDays() > 1 ? 1 : jwtProperties.getRefreshTokenTtlDays();

        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setFamily(generateFamily());
        rt.setExpiresAt(now.plus(ttlDays, ChronoUnit.DAYS));
        rt.setRevoked(false);
        return rt;
    }

    private static String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String generateFamily() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
