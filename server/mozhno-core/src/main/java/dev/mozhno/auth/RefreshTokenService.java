package dev.mozhno.auth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

import static dev.mozhno.client.HashUtils.generateRawToken;
import static dev.mozhno.client.HashUtils.sha256;

/**
 * Manages the lifecycle of access/refresh token pairs with rotation and theft detection.
 *
 * <p>Uses token families: every refresh token belongs to a family. On each refresh,
 * the old token is marked used and replaced by a new token in the same family.
 * If a used or revoked token is replayed (reuse attack), the entire family is revoked.</p>
 */
@Service
public class RefreshTokenService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

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

    /**
     * Value object holding an access token and its corresponding refresh token.
     */
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

    /**
     * Thrown when a refresh token is unknown, expired, revoked, or reused —
     * indicating potential token theft.
     */
    public static class TokenReuseException extends RuntimeException {
        public TokenReuseException(String message) {
            super(message);
        }
    }

    /**
     * Issues a new JWT access token and a corresponding opaque refresh token.
     *
     * @param user       the authenticated user
     * @param projectId  the project ID to embed in the JWT, or null
     * @param rememberMe if true, uses the full refresh token TTL; otherwise caps at 1 day
     * @return token pair
     */
    public TokenPair issueTokens(User user, Integer projectId, boolean rememberMe) {
        String accessToken = jwtService.generateAccessToken(user, projectId);
        RefreshToken rt = createRefreshToken(user.getId(), rememberMe);
        String rawToken = generateRawToken();
        rt.setTokenHash(sha256(rawToken));
        refreshTokenRepository.save(rt);
        return new TokenPair(accessToken, rawToken);
    }

    public TokenPair issueTokens(User user, boolean rememberMe) {
        return issueTokens(user, null, rememberMe);
    }

    /**
     * Rotates the refresh token: marks the current one as used, issues a replacement
     * in the same family, and generates a new access token.
     *
     * @param rawRefreshToken the raw (unhashed) refresh token
     * @param projectId       the project ID to embed in the new JWT, or null
     * @return new token pair
     * @throws TokenReuseException if the token is unknown, expired, revoked, or reused
     */
    @Transactional
    public TokenPair refresh(String rawRefreshToken) {
        String hash = sha256(rawRefreshToken);
        RefreshToken existing = refreshTokenRepository.findByHashForUpdate(hash);

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
        newToken.setExpiresAt(Instant.now().plus(
            existing.getExpiresAt().isAfter(Instant.now().plus(1, ChronoUnit.DAYS))
                ? ChronoUnit.DAYS.between(Instant.now(), existing.getExpiresAt())
                : 1,
            ChronoUnit.DAYS));
        newToken.setRevoked(false);
        refreshTokenRepository.save(newToken);

        String accessToken = jwtService.generateAccessToken(user, user.getProjectId());
        return new TokenPair(accessToken, newRaw);
    }

    /**
     * Revokes the given refresh token and its entire family.
     *
     * @param rawRefreshToken the raw token to revoke
     */
    @Transactional
    public void revoke(String rawRefreshToken) {
        String hash = sha256(rawRefreshToken);
        RefreshToken existing = refreshTokenRepository.findByHash(hash);
        if (existing != null) {
            refreshTokenRepository.revokeFamily(existing.getFamily());
        }
    }

    /**
     * Revokes all active refresh tokens for a user (e.g. on password change or admin suspension).
     *
     * @param userId the user whose tokens should be revoked
     */
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

    private static String generateFamily() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
