package dev.mozhno.logging;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.LoggingEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;

class MaskedMessageConverterTest {

    private final MaskedMessageConverter converter = new MaskedMessageConverter();

    @Test
    void shouldReturnNullWhenMessageIsNull() {
        assertThat(converter.convert(eventWithMessage(null))).isNull();
    }

    @Test
    void shouldReturnEmptyWhenMessageIsBlank() {
        assertThat(converter.convert(eventWithMessage("   "))).isEqualTo("   ");
    }

    @Test
    void shouldMaskBearerToken() {
        String input = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR";
        String result = converter.convert(eventWithMessage(input));
        assertThat(result).contains("Bearer ****");
        assertThat(result).doesNotContain("eyJhbGci");
    }

    @Test
    void shouldMaskPasswordParam() {
        assertThat(converter.convert(eventWithMessage("password=secret123")))
            .isEqualTo("password=****");
        assertThat(converter.convert(eventWithMessage("PASSWORD: mypass")))
            .isEqualTo("PASSWORD: ****");
        assertThat(converter.convert(eventWithMessage("token=abc123tokenvalue")))
            .isEqualTo("token=****");
    }

    @Test
    void shouldMaskApiKeyParam() {
        assertThat(converter.convert(eventWithMessage("apiKey=sk-12345")))
            .isEqualTo("apiKey=****");
    }

    @Test
    void shouldMaskEmail() {
        assertThat(converter.convert(eventWithMessage("user: john.doe@example.com")))
            .isEqualTo("user: joh***@example.com");
    }

    @Test
    void shouldMaskIPv4() {
        assertThat(converter.convert(eventWithMessage("from 192.168.1.100")))
            .isEqualTo("from 192.168.***.***");
        assertThat(converter.convert(eventWithMessage("10.0.0.1 connected")))
            .isEqualTo("10.0.***.*** connected");
    }

    @Test
    void shouldNotAlterNonSensitiveText() {
        String msg = "Request GET /api/v1/flags completed in 42ms";
        assertThat(converter.convert(eventWithMessage(msg))).isEqualTo(msg);
    }

    @Test
    void shouldHandleComplexLogMessage() {
        String msg = "User john.doe@example.com from 192.168.1.1 called /api/v1/flags with token=abc123";
        String result = converter.convert(eventWithMessage(msg));
        assertThat(result).isEqualTo(
            "User joh***@example.com from 192.168.***.*** called /api/v1/flags with token=****");
    }

    private ILoggingEvent eventWithMessage(String message) {
        LoggingEvent event = new LoggingEvent();
        event.setMessage(message);
        event.setLevel(Level.INFO);
        event.setLoggerName("test");
        return event;
    }
}
