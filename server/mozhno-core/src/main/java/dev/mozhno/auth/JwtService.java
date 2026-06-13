package dev.mozhno.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

/**
 * Generates and validates JSON Web Tokens for user authentication.
 *
 * <p>Access tokens are signed with HMAC-SHA256 using a Base64-decoded secret.
 * Parsing errors (expired, malformed, bad signature) return {@code null} instead
 * of throwing, allowing callers to treat invalid tokens as unauthenticated.</p>
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final String issuer;
    private final long accessTokenTtlMinutes;

    public JwtService(JwtProperties properties) {
        byte[] decodedKey = Base64.getDecoder().decode(properties.getSecret());
        if (decodedKey.length < 32) {
            throw new IllegalStateException("jwt.secret must be at least 256 bits (32 bytes) when Base64-decoded");
        }
        this.key = Keys.hmacShaKeyFor(decodedKey);
        this.issuer = properties.getIssuer();
        this.accessTokenTtlMinutes = properties.getAccessTokenTtlMinutes();
    }

    /**
     * Creates a signed JWT access token for the given user.
     *
     * @param user the authenticated user
     * @return compact JWT string
     */
    public String generateAccessToken(User user) {
        return generateAccessToken(user, null);
    }

    public String generateAccessToken(User user, Integer projectId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES);

        var builder = Jwts.builder()
            .id(UUID.randomUUID().toString())
            .issuer(issuer)
            .subject(user.getEmail())
            .claim("user_id", user.getId())
            .claim("name", user.getName())
            .claim("role", user.getRole())
            .claim("status", user.getStatus())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(key);

        if (projectId != null) {
            builder.claim("project_id", projectId);
        }

        return builder.compact();
    }

    /**
     * Validates and parses a JWT access token.
     *
     * @param token the raw JWT string from the Authorization header
     * @return parsed {@link JwtToken}, or {@code null} if the token is invalid, expired,
     *         or has a bad signature
     */
    public JwtToken parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            Integer userId = claims.get("user_id", Integer.class);
            String name = claims.get("name", String.class);
            String role = claims.get("role", String.class);
            String status = claims.get("status", String.class);
            Integer projectId = claims.get("project_id", Integer.class);

            return new JwtToken(userId, claims.getSubject(), name, role, status, projectId);
        } catch (ExpiredJwtException | SignatureException | MalformedJwtException | IllegalArgumentException e) {
            return null;
        }
    }

    public Integer extractProjectIdLenient(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.get("project_id", Integer.class);
        } catch (ExpiredJwtException e) {
            return e.getClaims().get("project_id", Integer.class);
        } catch (SignatureException | MalformedJwtException | IllegalArgumentException e) {
            return null;
        }
    }
}