package ru.mozhno.auth;

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

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
            .id(UUID.randomUUID().toString())
            .issuer(issuer)
            .subject(user.getEmail())
            .claim("user_id", user.getId())
            .claim("role", user.getRole())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(key)
            .compact();
    }

    public JwtToken parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            Integer userId = claims.get("user_id", Integer.class);
            String role = claims.get("role", String.class);

            return new JwtToken(userId, claims.getSubject(), role);
        } catch (ExpiredJwtException | SignatureException | MalformedJwtException | IllegalArgumentException e) {
            return null;
        }
    }
}