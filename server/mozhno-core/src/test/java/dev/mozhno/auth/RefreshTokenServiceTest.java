package dev.mozhno.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User createTestUser() {
        User user = new User();
        user.setId(1);
        user.setEmail("test@example.com");
        user.setRole("admin");
        user.setStatus("active");
        user.setProjectId(1);
        return user;
    }

    @Test
    void issueTokens_shouldReturnTokenPair() {
        User user = createTestUser();
        when(jwtProperties.getRefreshTokenTtlDays()).thenReturn(30L);
        when(jwtService.generateAccessToken(eq(user), any())).thenReturn("access.token.1");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            RefreshToken t = inv.getArgument(0);
            t.setId(1);
            return t;
        });

        RefreshTokenService.TokenPair pair = refreshTokenService.issueTokens(user, false);

        assertNotNull(pair);
        assertNotNull(pair.getAccessToken());
        assertNotNull(pair.getRefreshToken());
        assertEquals("access.token.1", pair.getAccessToken());
        assertFalse(pair.getRefreshToken().isEmpty());
    }

    @Test
    void issueTokens_rememberMe_shouldUseLongerTtl() {
        User user = createTestUser();
        when(jwtProperties.getRefreshTokenTtlDays()).thenReturn(30L);
        when(jwtService.generateAccessToken(eq(user), any())).thenReturn("access.token.2");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            RefreshToken t = inv.getArgument(0);
            t.setId(2);
            return t;
        });

        refreshTokenService.issueTokens(user, true);

        verify(jwtProperties).getRefreshTokenTtlDays();
    }

    @Test
    void issueTokens_shouldStoreSha256Hash() {
        User user = createTestUser();
        when(jwtProperties.getRefreshTokenTtlDays()).thenReturn(30L);
        when(jwtService.generateAccessToken(eq(user), any())).thenReturn("access.token.3");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            RefreshToken t = inv.getArgument(0);
            t.setId(3);
            return t;
        });

        RefreshTokenService.TokenPair pair = refreshTokenService.issueTokens(user, false);

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());

        RefreshToken saved = captor.getValue();
        assertEquals(user.getId(), saved.getUserId());
        assertNotNull(saved.getTokenHash());
        assertEquals(64, saved.getTokenHash().length());
        assertEquals(dev.mozhno.client.HashUtils.sha256(pair.getRefreshToken()), saved.getTokenHash());
        assertFalse(saved.isRevoked());
        assertNotNull(saved.getFamily());
        assertEquals(64, saved.getFamily().length());
        assertNotNull(saved.getExpiresAt());
    }

    @Test
    void refresh_shouldIssueNewTokenPair() {
        User user = createTestUser();
        String oldRaw = "old-raw-token-for-testing-base64url";
        String oldHash = dev.mozhno.client.HashUtils.sha256(oldRaw);

        RefreshToken existingToken = new RefreshToken();
        existingToken.setId(10);
        existingToken.setUserId(user.getId());
        existingToken.setTokenHash(oldHash);
        existingToken.setFamily("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789");
        existingToken.setExpiresAt(Instant.now().plus(5, ChronoUnit.DAYS));
        existingToken.setRevoked(false);

        when(refreshTokenRepository.findByHashForUpdate(oldHash)).thenReturn(existingToken);
        when(userRepository.findById(user.getId())).thenReturn(user);
        when(jwtService.generateAccessToken(eq(user), any())).thenReturn("new.access.token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            RefreshToken t = inv.getArgument(0);
            if (t.getId() == null) t.setId(20);
            return t;
        });

        RefreshTokenService.TokenPair pair = refreshTokenService.refresh(oldRaw);

        assertNotNull(pair);
        assertEquals("new.access.token", pair.getAccessToken());
        assertNotNull(pair.getRefreshToken());
        assertNotEquals(oldRaw, pair.getRefreshToken());
    }

    @Test
    void refresh_shouldMarkOldTokenAsUsed() {
        User user = createTestUser();
        String oldRaw = "test-token-base64encoded-value";
        String oldHash = dev.mozhno.client.HashUtils.sha256(oldRaw);

        RefreshToken existingToken = new RefreshToken();
        existingToken.setId(11);
        existingToken.setUserId(user.getId());
        existingToken.setTokenHash(oldHash);
        existingToken.setFamily("fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210");
        existingToken.setExpiresAt(Instant.now().plus(5, ChronoUnit.DAYS));
        existingToken.setRevoked(false);

        when(refreshTokenRepository.findByHashForUpdate(oldHash)).thenReturn(existingToken);
        when(userRepository.findById(user.getId())).thenReturn(user);
        when(jwtService.generateAccessToken(eq(user), any())).thenReturn("acc.tok");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            RefreshToken t = inv.getArgument(0);
            if (t.getId() == null) t.setId(21);
            return t;
        });

        refreshTokenService.refresh(oldRaw);

        assertNotNull(existingToken.getUsedAt());
        assertNotNull(existingToken.getReplacedByHash());
    }

    @Test
    void refresh_shouldThrowOnUnknownToken() {
        String unknownRaw = "unknown-token-value-hex-string";
        String unknownHash = dev.mozhno.client.HashUtils.sha256(unknownRaw);

        when(refreshTokenRepository.findByHashForUpdate(unknownHash)).thenReturn(null);

        assertThrows(RefreshTokenService.TokenReuseException.class,
            () -> refreshTokenService.refresh(unknownRaw));
    }

    @Test
    void refresh_shouldThrowOnRevokedToken() {
        String raw = "revoked-token-value-for-test";
        String hash = dev.mozhno.client.HashUtils.sha256(raw);

        RefreshToken revokedToken = new RefreshToken();
        revokedToken.setId(12);
        revokedToken.setUserId(1);
        revokedToken.setTokenHash(hash);
        revokedToken.setFamily("family-revoked");
        revokedToken.setExpiresAt(Instant.now().plus(5, ChronoUnit.DAYS));
        revokedToken.setRevoked(true);

        when(refreshTokenRepository.findByHashForUpdate(hash)).thenReturn(revokedToken);

        assertThrows(RefreshTokenService.TokenReuseException.class,
            () -> refreshTokenService.refresh(raw));

        verify(refreshTokenRepository).revokeFamily("family-revoked");
    }

    @Test
    void refresh_shouldThrowOnExpiredToken() {
        String raw = "expired-token-value-testing";
        String hash = dev.mozhno.client.HashUtils.sha256(raw);

        RefreshToken expiredToken = new RefreshToken();
        expiredToken.setId(13);
        expiredToken.setUserId(1);
        expiredToken.setTokenHash(hash);
        expiredToken.setFamily("family-expired");
        expiredToken.setExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS));
        expiredToken.setRevoked(false);

        when(refreshTokenRepository.findByHashForUpdate(hash)).thenReturn(expiredToken);

        assertThrows(RefreshTokenService.TokenReuseException.class,
            () -> refreshTokenService.refresh(raw));
    }

    @Test
    void refresh_shouldThrowAndRevokeFamilyOnReuse() {
        String raw = "reused-token-for-testing";
        String hash = dev.mozhno.client.HashUtils.sha256(raw);

        RefreshToken usedToken = new RefreshToken();
        usedToken.setId(14);
        usedToken.setUserId(1);
        usedToken.setTokenHash(hash);
        usedToken.setFamily("family-reuse");
        usedToken.setExpiresAt(Instant.now().plus(5, ChronoUnit.DAYS));
        usedToken.setRevoked(false);
        usedToken.setUsedAt(Instant.now().minus(1, ChronoUnit.HOURS));

        when(refreshTokenRepository.findByHashForUpdate(hash)).thenReturn(usedToken);

        assertThrows(RefreshTokenService.TokenReuseException.class,
            () -> refreshTokenService.refresh(raw));

        verify(refreshTokenRepository).revokeFamily("family-reuse");
    }

    @Test
    void refresh_shouldThrowWhenUserNotFound() {
        String raw = "token-for-missing-user";
        String hash = dev.mozhno.client.HashUtils.sha256(raw);

        RefreshToken token = new RefreshToken();
        token.setId(15);
        token.setUserId(999);
        token.setTokenHash(hash);
        token.setFamily("family-nouser");
        token.setExpiresAt(Instant.now().plus(5, ChronoUnit.DAYS));
        token.setRevoked(false);

        when(refreshTokenRepository.findByHashForUpdate(hash)).thenReturn(token);
        when(userRepository.findById(999)).thenReturn(null);

        assertThrows(RefreshTokenService.TokenReuseException.class,
            () -> refreshTokenService.refresh(raw));

        verify(refreshTokenRepository).revokeFamily("family-nouser");
    }

    @Test
    void refresh_shouldThrowWhenUserSuspended() {
        String raw = "token-for-suspended-user";
        String hash = dev.mozhno.client.HashUtils.sha256(raw);

        User suspendedUser = new User();
        suspendedUser.setId(2);
        suspendedUser.setEmail("suspended@test.com");
        suspendedUser.setStatus("suspended");

        RefreshToken token = new RefreshToken();
        token.setId(16);
        token.setUserId(2);
        token.setTokenHash(hash);
        token.setFamily("family-suspended");
        token.setExpiresAt(Instant.now().plus(5, ChronoUnit.DAYS));
        token.setRevoked(false);

        when(refreshTokenRepository.findByHashForUpdate(hash)).thenReturn(token);
        when(userRepository.findById(2)).thenReturn(suspendedUser);

        assertThrows(RefreshTokenService.TokenReuseException.class,
            () -> refreshTokenService.refresh(raw));

        verify(refreshTokenRepository).revokeFamily("family-suspended");
    }

    @Test
    void revoke_shouldRevokeFamilyWhenTokenExists() {
        String raw = "token-to-revoke-for-real";
        String hash = dev.mozhno.client.HashUtils.sha256(raw);

        RefreshToken token = new RefreshToken();
        token.setId(17);
        token.setTokenHash(hash);
        token.setFamily("family-torevoke");

        when(refreshTokenRepository.findByHash(hash)).thenReturn(token);

        refreshTokenService.revoke(raw);

        verify(refreshTokenRepository).revokeFamily("family-torevoke");
    }

    @Test
    void revoke_shouldNotThrowWhenTokenNotFound() {
        String raw = "nonexistent-token-revoke";
        String hash = dev.mozhno.client.HashUtils.sha256(raw);

        when(refreshTokenRepository.findByHash(hash)).thenReturn(null);

        assertDoesNotThrow(() -> refreshTokenService.revoke(raw));

        verify(refreshTokenRepository, never()).revokeFamily(any());
    }

    @Test
    void revokeAllForUser_shouldDelegateToRepository() {
        refreshTokenService.revokeAllForUser(42);

        verify(refreshTokenRepository).revokeAllForUser(42);
    }

    @Test
    void sha256_shouldProduceDeterministicHash() {
        String input = "hello-world";
        String hash1 = dev.mozhno.client.HashUtils.sha256(input);
        String hash2 = dev.mozhno.client.HashUtils.sha256(input);

        assertEquals(hash1, hash2);
        assertEquals(64, hash1.length());
    }

    @Test
    void sha256_shouldProduceDifferentHashForDifferentInputs() {
        String hash1 = dev.mozhno.client.HashUtils.sha256("input-one");
        String hash2 = dev.mozhno.client.HashUtils.sha256("input-two");

        assertNotEquals(hash1, hash2);
    }

    @Test
    void issueTokens_shouldGenerateUniqueRefreshes() {
        User user = createTestUser();
        when(jwtProperties.getRefreshTokenTtlDays()).thenReturn(30L);
        when(jwtService.generateAccessToken(eq(user), any())).thenReturn("access.1", "access.2");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            RefreshToken t = inv.getArgument(0);
            t.setId(100);
            return t;
        });

        RefreshTokenService.TokenPair pair1 = refreshTokenService.issueTokens(user, false);
        RefreshTokenService.TokenPair pair2 = refreshTokenService.issueTokens(user, false);

        assertNotEquals(pair1.getRefreshToken(), pair2.getRefreshToken());
    }
}
