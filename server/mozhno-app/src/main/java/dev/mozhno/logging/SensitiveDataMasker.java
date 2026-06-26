package dev.mozhno.logging;

import tools.jackson.core.TokenStreamContext;
import net.logstash.logback.mask.ValueMasker;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Masks sensitive field values in structured JSON log output.
 *
 * <p>Registered as a logstash {@link ValueMasker} and applied by the
 * {@code LogstashEncoder} to every field value before writing. Supports
 * full-value replacement for credential-like fields and partial masking
 * for privacy-sensitive fields (emails, IP addresses).
 *
 * <p>Masking rules:
 * <ul>
 *   <li><b>Full mask ({@code ****}):</b> field names matching
 *       {@code password, secret, token, apiKey, accessToken, refreshToken,
 *       authorization, jwt, credential, privateKey}</li>
 *   <li><b>Email partial:</b> {@code jdoe@example.com} → {@code jdo***@example.com}</li>
 *   <li><b>IP partial:</b> {@code 192.168.1.100} → {@code 192.168.***.***}</li>
 *   <li><b>Token-like strings:</b> values &ge; 64 chars matching
 *       base64 pattern are fully masked regardless of field name</li>
 * </ul>
 */
public class SensitiveDataMasker implements ValueMasker {

    private static final Set<String> FULL_MASK_FIELDS = Set.of(
        "password", "pass", "pwd",
        "secret", "clientsecret",
        "token", "accesstoken", "refreshtoken", "jwt", "idtoken",
        "apikey", "xapikey", "api_key",
        "authorization",
        "credential", "credentials",
        "privatekey", "private_key",
        "signingkey", "signing_key"
    );

    private static final Set<String> PARTIAL_MASK_FIELDS = Set.of(
        "email", "useremail", "emailaddress", "recipient"
    );

    private static final Set<String> IP_MASK_FIELDS = Set.of(
        "ipaddress", "ip", "clientip", "remoteip", "x-forwarded-for", "x-real-ip"
    );

    private static final Pattern LONG_TOKEN_LIKE = Pattern.compile(
        "^[A-Za-z0-9+/=_-]{64,}$"
    );

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^([^@]{1,3})[^@]*(@.*)$"
    );

    private static final String MASKED = "****";

    @Override
    public Object mask(TokenStreamContext context, Object value) {
        if (!(value instanceof CharSequence cs)) {
            return value;
        }

        String fieldName = context.currentName();
        if (fieldName == null) {
            return value;
        }

        String lowerName = fieldName.toLowerCase();
        String text = cs.toString();

        if (FULL_MASK_FIELDS.contains(lowerName)) {
            return MASKED;
        }

        if (PARTIAL_MASK_FIELDS.contains(lowerName)) {
            return maskEmail(text);
        }

        if (IP_MASK_FIELDS.contains(lowerName)) {
            return maskIp(text);
        }

        if (text.length() >= 64 && LONG_TOKEN_LIKE.matcher(text).matches()) {
            return MASKED;
        }

        return value;
    }

    static String maskEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) {
            return email;
        }
        var m = EMAIL_PATTERN.matcher(email);
        if (m.matches()) {
            return m.group(1) + "***" + m.group(2);
        }
        int at = email.indexOf('@');
        return email.charAt(0) + "***" + email.substring(at);
    }

    static String maskIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return ip;
        }
        if (ip.contains(",")) {
            return ip;
        }
        int lastDot = ip.lastIndexOf('.');
        if (lastDot > 0) {
            int secondLast = ip.lastIndexOf('.', lastDot - 1);
            if (secondLast > 0) {
                return ip.substring(0, secondLast + 1) + "***.***";
            }
        }
        if (ip.contains(":")) {
            int lastColon = ip.lastIndexOf(':');
            if (lastColon > 2) {
                return ip.substring(0, 3) + "***" + ip.substring(lastColon);
            }
        }
        return ip;
    }
}
