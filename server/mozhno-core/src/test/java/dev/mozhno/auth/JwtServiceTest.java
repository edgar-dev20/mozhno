package dev.mozhno.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret("dGhpc2lzYXRlc3RzZWNyZXRrZXlmb3Jqd3R0aGF0aXNhdGxlYXN0MzJieXRlc2xvbmc=");
        props.setIssuer("test-issuer");
        props.setAccessTokenTtlMinutes(5);

        jwtService = new JwtService(props);

        testUser = new User();
        testUser.setId(1);
        testUser.setEmail("test@example.com");
        testUser.setRole("admin");
    }

    @Test
    void generateAccessToken_shouldProduceParsableToken() {
        String token = jwtService.generateAccessToken(testUser);
        assertNotNull(token);
        assertFalse(token.isEmpty());

        JwtToken parsed = jwtService.parseToken(token);
        assertNotNull(parsed);
        assertEquals(testUser.getId(), parsed.getUserId());
        assertEquals(testUser.getEmail(), parsed.getEmail());
        assertEquals(testUser.getRole(), parsed.getRole());
    }

    @Test
    void parseToken_shouldReturnNullForInvalidToken() {
        assertNull(jwtService.parseToken("invalid.token.here"));
        assertNull(jwtService.parseToken(""));
        assertNull(jwtService.parseToken("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.signature"));
    }

    @Test
    void parseToken_shouldReturnNullForNullToken() {
        assertNull(jwtService.parseToken(null));
    }

    @Test
    void parseToken_shouldReturnNullForTamperedToken() {
        String token = jwtService.generateAccessToken(testUser);
        String tampered = token.substring(0, token.length() - 5) + "abcde";
        assertNull(jwtService.parseToken(tampered));
    }

    @Test
    void parseToken_shouldReturnNullForDifferentIssuerToken() {
        JwtProperties otherProps = new JwtProperties();
        otherProps.setSecret("c2hvdWxkYmUzMmJ5dGVzTWluaW11bUxlbmd0aEtleUZvckhTMjU2QWxnb3JpdGht");
        otherProps.setIssuer("other-issuer");
        JwtService otherJwtService = new JwtService(otherProps);

        String token = otherJwtService.generateAccessToken(testUser);
        assertNull(jwtService.parseToken(token));
    }

    @Test
    void generateAccessToken_shouldIncludeRequiredClaims() {
        String token = jwtService.generateAccessToken(testUser);
        JwtToken parsed = jwtService.parseToken(token);

        assertNotNull(parsed);
        assertEquals(1, parsed.getUserId());
        assertEquals("test@example.com", parsed.getEmail());
        assertEquals("admin", parsed.getRole());
    }

    @Test
    void generateAccessToken_shouldProduceUniqueTokens() {
        String token1 = jwtService.generateAccessToken(testUser);
        String token2 = jwtService.generateAccessToken(testUser);
        assertNotEquals(token1, token2);
    }

    @Test
    void constructor_shouldRejectShortSecret() {
        JwtProperties props = new JwtProperties();
        props.setSecret("dG9vU2hvcnQ=");
        assertThrows(IllegalStateException.class, () -> new JwtService(props));
    }

    @Test
    void extractProjectIdLenient_shouldReturnProjectIdForValidToken() {
        String token = jwtService.generateAccessToken(testUser, 42);
        Integer projectId = jwtService.extractProjectIdLenient(token);
        assertEquals(42, projectId);
    }

    @Test
    void extractProjectIdLenient_shouldReturnProjectIdForExpiredToken() {
        JwtProperties expiredProps = new JwtProperties();
        expiredProps.setSecret("dGhpc2lzYXRlc3RzZWNyZXRrZXlmb3Jqd3R0aGF0aXNhdGxlYXN0MzJieXRlc2xvbmc=");
        expiredProps.setIssuer("test-issuer");
        expiredProps.setAccessTokenTtlMinutes(0);

        JwtService expiredJwtService = new JwtService(expiredProps);
        String token = expiredJwtService.generateAccessToken(testUser, 42);

        Integer projectId = jwtService.extractProjectIdLenient(token);
        assertEquals(42, projectId);
    }

    @Test
    void extractProjectIdLenient_shouldReturnNullWhenNoProjectId() {
        String token = jwtService.generateAccessToken(testUser);
        Integer projectId = jwtService.extractProjectIdLenient(token);
        assertNull(projectId);
    }

    @Test
    void extractProjectIdLenient_shouldReturnNullForInvalidToken() {
        assertNull(jwtService.extractProjectIdLenient("invalid.token.here"));
        assertNull(jwtService.extractProjectIdLenient(""));
        assertNull(jwtService.extractProjectIdLenient(null));
    }

    @Test
    void extractProjectIdLenient_shouldReturnNullForTamperedToken() {
        String token = jwtService.generateAccessToken(testUser, 42);
        String tampered = token.substring(0, token.length() - 5) + "abcde";
        assertNull(jwtService.extractProjectIdLenient(tampered));
    }
}