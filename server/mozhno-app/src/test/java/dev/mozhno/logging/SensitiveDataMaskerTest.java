package dev.mozhno.logging;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonStreamContext;
import com.fasterxml.jackson.core.filter.FilteringGeneratorDelegate;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;

class SensitiveDataMaskerTest {

    private final SensitiveDataMasker masker = new SensitiveDataMasker();

    @Test
    void shouldReturnNullWhenValueIsNull() {
        assertThat(masker.mask(fieldContext("password"), null)).isNull();
    }

    @Test
    void shouldReturnValueWhenNotCharSequence() {
        assertThat(masker.mask(fieldContext("password"), 12345)).isEqualTo(12345);
    }

    @Test
    void shouldReturnValueWhenFieldNameIsNull() {
        assertThat(masker.mask(fieldContext("someField"), "some@email.com")).isEqualTo("some@email.com");
    }

    @Nested
    class FullMaskFields {

        @ParameterizedTest
        @ValueSource(strings = {"password", "secret", "token", "accessToken", "refreshToken",
            "apiKey", "authorization", "jwt", "credential", "privateKey",
            "signingKey", "XApiKey", "API_KEY"})
        void shouldMaskSensitiveFields(String fieldName) {
            assertThat(masker.mask(fieldContext(fieldName), "my-secret-value"))
                .isEqualTo("****");
        }

        @Test
        void shouldMaskPasswordField() {
            assertThat(masker.mask(fieldContext("password"), "s3cr3t!")).isEqualTo("****");
        }

        @Test
        void shouldMaskTokenField() {
            assertThat(masker.mask(fieldContext("accessToken"), "eyJhbGciOiJIUzI1NiJ9.xxx.yyy"))
                .isEqualTo("****");
        }
    }

    @Nested
    class EmailMasking {

        @Test
        void shouldMaskEmailLocalPart() {
            var result = (String) masker.mask(fieldContext("email"), "john.doe@example.com");
            assertThat(result).isEqualTo("joh***@example.com");
        }

        @Test
        void shouldMaskEmailCaseInsensitive() {
            var result = (String) masker.mask(fieldContext("Email"), "a@b.com");
            assertThat(result).isEqualTo("a***@b.com");
        }

        @Test
        void shouldHandleShortEmail() {
            var result = (String) masker.mask(fieldContext("email"), "a@b.c");
            assertThat(result).isEqualTo("a***@b.c");
        }

        @Test
        void shouldReturnOriginalWhenNoAtSign() {
            assertThat(masker.mask(fieldContext("email"), "not-an-email"))
                .isEqualTo("not-an-email");
        }

        @Test
        void shouldReturnOriginalWhenBlank() {
            assertThat(masker.mask(fieldContext("email"), "  ")).isEqualTo("  ");
        }
    }

    @Nested
    class IpMasking {

        @Test
        void shouldMaskLastTwoOctets() {
            assertThat(masker.mask(fieldContext("ipAddress"), "192.168.1.100"))
                .isEqualTo("192.168.***.***");
        }

        @Test
        void shouldMaskIpFieldName() {
            assertThat(masker.mask(fieldContext("ip"), "10.0.0.1"))
                .isEqualTo("10.0.***.***");
        }

        @Test
        void shouldMaskClientIp() {
            assertThat(masker.mask(fieldContext("clientIp"), "172.16.254.1"))
                .isEqualTo("172.16.***.***");
        }

        @Test
        void shouldNotMaskCsvIpList() {
            assertThat(masker.mask(fieldContext("xForwardedFor"), "1.2.3.4,5.6.7.8"))
                .isEqualTo("1.2.3.4,5.6.7.8");
        }

        @Test
        void shouldMaskIpv6() {
            var result = (String) masker.mask(fieldContext("ip"), "2001:db8::1");
            assertThat(result).isEqualTo("200***:1");
        }

        @Test
        void shouldReturnOriginalWhenNoDotsOrColons() {
            assertThat(masker.mask(fieldContext("ip"), "localhost")).isEqualTo("localhost");
        }
    }

    @Nested
    class LongTokenDetection {

        @Test
        void shouldMaskLongBase64Token() {
            String longToken = "A".repeat(64);
            assertThat(masker.mask(fieldContext("description"), longToken)).isEqualTo("****");
        }

        @Test
        void shouldNotMaskShortValue() {
            String shortValue = "A".repeat(63);
            assertThat(masker.mask(fieldContext("description"), shortValue)).isEqualTo(shortValue);
        }

        @Test
        void shouldNotMaskValueWithSpecialChars() {
            String valueWithSpecial = "A".repeat(40) + "!extra";
            assertThat(masker.mask(fieldContext("description"), valueWithSpecial))
                .isEqualTo(valueWithSpecial);
        }
    }

    @Test
    void shouldNotMaskUnclassifiedField() {
        assertThat(masker.mask(fieldContext("userName"), "john_doe")).isEqualTo("john_doe");
        assertThat(masker.mask(fieldContext("flagName"), "new-feature")).isEqualTo("new-feature");
    }

    private static JsonStreamContext fieldContext(String fieldName) {
        try {
            StringWriter sw = new StringWriter();
            JsonGenerator gen = new JsonFactory().createGenerator(sw);
            gen.writeStartObject();
            gen.writeFieldName(fieldName);
            JsonStreamContext ctx = gen.getOutputContext();
            gen.close();
            return ctx;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
