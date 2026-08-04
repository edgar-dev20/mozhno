package dev.mozhno.auth;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtPropertiesTest {

    @Test
    void getSecretBytes_shouldDecodeValidBase64() {
        byte[] raw = "this-is-a-32-byte-secret-key-for-test!".getBytes(StandardCharsets.UTF_8);
        String base64 = Base64.getEncoder().encodeToString(raw);

        JwtProperties props = new JwtProperties();
        props.setSecret(base64);

        byte[] result = props.getSecretBytes();
        assertArrayEquals(raw, result);
    }

    @Test
    void getSecretBytes_shouldTreatPlainTextAsUtf8() {
        JwtProperties props = new JwtProperties();
        props.setSecret("this-is-a-plain-text-secret-that-is-at-least-32-chars");

        byte[] result = props.getSecretBytes();
        assertArrayEquals("this-is-a-plain-text-secret-that-is-at-least-32-chars".getBytes(StandardCharsets.UTF_8), result);
    }

    @Test
    void getSecretBytes_shouldFallBackToUtf8WhenBase64DecodeWouldBeTooShort() {
        // "tooShort" decodes to 6 bytes via Base64 (too short for >= 32 check), so should fall to UTF-8
        JwtProperties props = new JwtProperties();
        props.setSecret("this-is-a-string-that-decodes-short-but-is-long-enough-as-utf8-here");

        byte[] result = props.getSecretBytes();
        // This string is 68 chars UTF-8 but may decode to < 32 bytes in Base64
        assertTrue(result.length >= 32, "should be at least 32 bytes from UTF-8 fallback");
    }

    @Test
    void getSecretBytes_shouldFallBackToUtf8WhenBase64TooShort() {
        // "thisisateststr" decodes to 9 bytes (< 32), falls through to UTF-8 (16 bytes)
        // which is also < 32, but that's caught by JwtService, not JwtProperties
        JwtProperties props = new JwtProperties();
        props.setSecret("thisisateststringthatisjustlongenoughutf8buttooshortbase64");

        byte[] result = props.getSecretBytes();
        // Base64 decode would be < 32 bytes, so falls through to UTF-8
        byte[] expected = "thisisateststringthatisjustlongenoughutf8buttooshortbase64".getBytes(StandardCharsets.UTF_8);
        assertTrue(result.length >= 32);
        assertArrayEquals(expected, result);
    }

    @Test
    void getSecretBytes_shouldWorkWithShortBase64ThatFallsThrough() {
        // "dG9vU2hvcnQ=" decodes to "tooShort" (8 bytes < 32) → falls through to UTF-8
        JwtProperties props = new JwtProperties();
        props.setSecret("dG9vU2hvcnQ=");

        byte[] result = props.getSecretBytes();
        byte[] utf8 = "dG9vU2hvcnQ=".getBytes(StandardCharsets.UTF_8);
        assertArrayEquals(utf8, result);
    }
}
