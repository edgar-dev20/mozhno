package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class AuthenticationFlowSpiTest {

    @Test
    void authRequestShouldStoreAllFields() {
        var params = Map.of("idpToken", "abc123");
        var request = new AuthenticationFlowSpi.AuthRequest(
            "user@test.com", "secret", "password", params);

        assertThat(request.email()).isEqualTo("user@test.com");
        assertThat(request.password()).isEqualTo("secret");
        assertThat(request.provider()).isEqualTo("password");
        assertThat(request.params()).isEqualTo(params);
    }

    @Test
    void authRequestShouldAllowNullPasswordForSSOFlows() {
        var request = new AuthenticationFlowSpi.AuthRequest(
            "user@test.com", null, "google", Map.of());

        assertThat(request.email()).isEqualTo("user@test.com");
        assertThat(request.password()).isNull();
        assertThat(request.provider()).isEqualTo("google");
    }

    @Test
    void authResultSuccessShouldHaveNullErrorMessage() {
        var result = new AuthenticationFlowSpi.AuthResult(
            true, null, 1, "user@test.com", "Test User", "ADMIN", "ACTIVE");

        assertThat(result.success()).isTrue();
        assertThat(result.errorMessage()).isNull();
        assertThat(result.userId()).isEqualTo(1);
        assertThat(result.userEmail()).isEqualTo("user@test.com");
        assertThat(result.userName()).isEqualTo("Test User");
        assertThat(result.userRole()).isEqualTo("ADMIN");
        assertThat(result.userStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void authResultFailureShouldHaveNullUserFields() {
        var result = new AuthenticationFlowSpi.AuthResult(
            false, "Invalid password", null, null, null, null, null);

        assertThat(result.success()).isFalse();
        assertThat(result.errorMessage()).isEqualTo("Invalid password");
        assertThat(result.userId()).isNull();
        assertThat(result.userEmail()).isNull();
        assertThat(result.userName()).isNull();
        assertThat(result.userRole()).isNull();
        assertThat(result.userStatus()).isNull();
    }

    @Test
    void supportShouldReturnTrueForMatchingProvider() {
        var flow = new StubAuthFlow("password");
        var request = new AuthenticationFlowSpi.AuthRequest(
            "user@test.com", "secret", "password", Map.of());

        assertThat(flow.supports(request)).isTrue();
    }

    @Test
    void supportShouldReturnFalseForNonMatchingProvider() {
        var flow = new StubAuthFlow("password");
        var request = new AuthenticationFlowSpi.AuthRequest(
            "user@test.com", "secret", "google", Map.of());

        assertThat(flow.supports(request)).isFalse();
    }

    @Test
    void authenticateShouldReturnConfiguredResult() {
        var expected = new AuthenticationFlowSpi.AuthResult(
            true, null, 1, "user@test.com", "User", "VIEWER", "ACTIVE");
        var flow = new StubAuthFlow("password", expected);

        var request = new AuthenticationFlowSpi.AuthRequest(
            "user@test.com", "secret", "password", Map.of());
        var result = flow.authenticate(request);

        assertThat(result).isEqualTo(expected);
    }

    private static class StubAuthFlow implements AuthenticationFlowSpi {
        private final String provider;
        private final AuthResult result;

        StubAuthFlow(String provider) {
            this(provider, null);
        }

        StubAuthFlow(String provider, AuthResult result) {
            this.provider = provider;
            this.result = result;
        }

        @Override
        public int priority() {
            return 100;
        }

        @Override
        public boolean supports(AuthRequest request) {
            return provider.equals(request.provider());
        }

        @Override
        public AuthResult authenticate(AuthRequest request) {
            return result;
        }
    }
}
