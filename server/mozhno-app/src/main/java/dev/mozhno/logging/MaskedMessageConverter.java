package dev.mozhno.logging;

import ch.qos.logback.classic.pattern.MessageConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;

import java.util.regex.Pattern;

/**
 * Logback {@link MessageConverter} that applies sensitive-data masking to
 * the formatted log message before it reaches the appender.
 *
 * <p>This converter handles text-based (non-JSON) outputs. For structured
 * JSON logging, {@link SensitiveDataMasker} provides field-level masking
 * via the logstash encoder.
 *
 * <p>Patterns masked:
 * <ul>
 *   <li>Authorization headers: {@code Bearer eyJ...} → {@code Bearer ****}</li>
 *   <li>Credentials in key=value pairs: passwords, secrets, tokens</li>
 *   <li>JWT-like base64 strings &ge; 50 chars</li>
 *   <li>Email addresses: partial masking of local part</li>
 *   <li>IPv4 addresses: last two octets masked</li>
 * </ul>
 */
public class MaskedMessageConverter extends MessageConverter {

    private static final Pattern BEARER_TOKEN = Pattern.compile(
        "(?i)(Bearer\\s+)[A-Za-z0-9+/=_-]{20,}", Pattern.UNIX_LINES);

    private static final Pattern PASSWORD_PARAM = Pattern.compile(
        "(?i)(password|pass|pwd|secret|token|apiKey|api_key|apikey)(\\s*[:=]\\s*)([^\\s,;}&]+)",
        Pattern.UNIX_LINES);

    private static final Pattern JWT_LIKE = Pattern.compile(
        "\\b([A-Za-z0-9+/=_-]{50,})\\b");

    private static final Pattern EMAIL_RE = Pattern.compile(
        "([A-Za-z0-9._%+-]{1,3})[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})",
        Pattern.UNIX_LINES | Pattern.CASE_INSENSITIVE);

    private static final Pattern IPV4_RE = Pattern.compile(
        "\\b(\\d{1,3}\\.\\d{1,3})\\.\\d{1,3}\\.\\d{1,3}\\b");

    @Override
    public String convert(ILoggingEvent event) {
        String msg = super.convert(event);
        if (msg == null || msg.isBlank()) {
            return msg;
        }
        msg = BEARER_TOKEN.matcher(msg).replaceAll("$1****");
        msg = PASSWORD_PARAM.matcher(msg).replaceAll("$1$2****");
        msg = EMAIL_RE.matcher(msg).replaceAll(m -> {
            return SensitiveDataMasker.maskEmail(m.group());
        });
        msg = IPV4_RE.matcher(msg).replaceAll(m -> {
            return m.group(1) + ".***.***";
        });
        return msg;
    }
}
