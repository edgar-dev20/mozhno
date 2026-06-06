package ru.mozhno.spi;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;

import java.util.Optional;

public interface AuthenticationProviderSpi {

    int priority();

    boolean supports(HttpServletRequest request);

    Optional<Authentication> authenticate(HttpServletRequest request);
}
