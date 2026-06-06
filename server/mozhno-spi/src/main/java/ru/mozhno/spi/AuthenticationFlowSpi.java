package ru.mozhno.spi;

import java.util.Map;

public interface AuthenticationFlowSpi {

    boolean supports(AuthRequest request);

    AuthResult authenticate(AuthRequest request);

    record AuthRequest(String email, String password, String provider, Map<String, String> params) {}

    record AuthResult(boolean success, String errorMessage,
                      Integer userId, String userEmail, String userName,
                      String userRole, String userStatus) {}
}
