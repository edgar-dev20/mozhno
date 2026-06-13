package dev.mozhno.spi;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthenticationProviderSpiTest {

    @Test
    void shouldSortByPriority() {
        var p1 = new StubAuthProvider(300, false, false);
        var p2 = new StubAuthProvider(100, false, false);
        var p3 = new StubAuthProvider(200, false, false);

        List<AuthenticationProviderSpi> providers = new ArrayList<>(List.of(p1, p2, p3));
        providers.sort(Comparator.comparingInt(AuthenticationProviderSpi::priority));

        assertThat(providers).extracting(AuthenticationProviderSpi::priority)
            .containsExactly(100, 200, 300);
    }

    @Test
    void shouldSkipProviderWhenNotSupported() {
        var provider = new StubAuthProvider(100, false, false);
        var request = mock(HttpServletRequest.class);

        assertThat(provider.supports(request)).isFalse();
        assertThat(provider.authenticate(request)).isEmpty();
    }

    @Test
    void shouldReturnEmptyWhenAuthenticationFails() {
        var provider = new StubAuthProvider(100, true, false);
        var request = mock(HttpServletRequest.class);

        assertThat(provider.supports(request)).isTrue();
        assertThat(provider.authenticate(request)).isEmpty();
    }

    @Test
    void shouldReturnAuthenticationWhenSuccessful() {
        var provider = new StubAuthProvider(100, true, true);
        var request = mock(HttpServletRequest.class);
        var auth = mock(Authentication.class);
        provider.auth = auth;

        assertThat(provider.supports(request)).isTrue();
        assertThat(provider.authenticate(request)).hasValue(auth);
    }

    @Test
    void priorityShouldReturnConfiguredValue() {
        assertThat(new StubAuthProvider(42, false, false).priority()).isEqualTo(42);
        assertThat(new StubAuthProvider(Integer.MAX_VALUE, false, false).priority()).isEqualTo(Integer.MAX_VALUE);
        assertThat(new StubAuthProvider(0, false, false).priority()).isEqualTo(0);
    }

    @Nested
    class ProviderChain {

        @Test
        void shouldTryProvidersInPriorityOrderUntilOneSucceeds() {
            var fail1 = new StubAuthProvider(100, true, false);
            var success = new StubAuthProvider(200, true, true);
            var fail2 = new StubAuthProvider(300, true, false);

            success.auth = mock(Authentication.class);

            List<AuthenticationProviderSpi> providers = new ArrayList<>(List.of(fail2, fail1, success));
            providers.sort(Comparator.comparingInt(AuthenticationProviderSpi::priority));

            var request = mock(HttpServletRequest.class);
            Optional<Authentication> result = Optional.empty();
            for (var p : providers) {
                if (!p.supports(request)) continue;
                result = p.authenticate(request);
                if (result.isPresent()) break;
            }

            assertThat(result).isPresent();
        }

        @Test
        void shouldReturnEmptyWhenNoProviderAuthenticates() {
            var p1 = new StubAuthProvider(100, true, false);
            var p2 = new StubAuthProvider(200, true, false);

            var request = mock(HttpServletRequest.class);
            Optional<Authentication> result = Optional.empty();
            for (var p : List.of(p1, p2)) {
                if (!p.supports(request)) continue;
                result = p.authenticate(request);
                if (result.isPresent()) break;
            }

            assertThat(result).isEmpty();
        }
    }

    private static class StubAuthProvider implements AuthenticationProviderSpi {
        private final int priority;
        private final boolean supports;
        private final boolean authenticates;
        Authentication auth;

        StubAuthProvider(int priority, boolean supports, boolean authenticates) {
            this.priority = priority;
            this.supports = supports;
            this.authenticates = authenticates;
        }

        @Override
        public int priority() { return priority; }

        @Override
        public boolean supports(HttpServletRequest request) { return supports; }

        @Override
        public Optional<Authentication> authenticate(HttpServletRequest request) {
            if (!authenticates) return Optional.empty();
            return Optional.ofNullable(auth);
        }
    }
}
