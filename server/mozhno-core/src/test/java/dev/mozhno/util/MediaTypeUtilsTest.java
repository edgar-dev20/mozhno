package dev.mozhno.util;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MediaTypeUtilsTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10, 0, 0, 0, 0};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 16, 'J', 'F'};
    private static final byte[] GIF = {'G', 'I', 'F', '8', '9', 'a', 1, 0};
    private static final byte[] WEBP = {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'};
    private static final byte[] SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes();

    @Test
    void detectsRasterFormats() {
        assertEquals(MediaType.IMAGE_PNG, MediaTypeUtils.detectRasterImageType(PNG));
        assertEquals(MediaType.IMAGE_JPEG, MediaTypeUtils.detectRasterImageType(JPEG));
        assertEquals(MediaType.parseMediaType("image/gif"), MediaTypeUtils.detectRasterImageType(GIF));
        assertEquals(MediaType.parseMediaType("image/webp"), MediaTypeUtils.detectRasterImageType(WEBP));
    }

    @Test
    void rejectsSvgAndUnknown() {
        assertNull(MediaTypeUtils.detectRasterImageType(SVG));
        assertNull(MediaTypeUtils.detectRasterImageType("not an image".getBytes()));
        assertNull(MediaTypeUtils.detectRasterImageType(new byte[]{1, 2}));
        assertNull(MediaTypeUtils.detectRasterImageType(null));
        assertFalse(MediaTypeUtils.isAllowedRasterImage(SVG));
        assertTrue(MediaTypeUtils.isAllowedRasterImage(PNG));
    }

    @Test
    void serveTypeNeverSvg() {
        // Legacy SVG bytes must be served as a non-executable type, never image/svg+xml.
        assertEquals(MediaType.APPLICATION_OCTET_STREAM, MediaTypeUtils.detectImageType(SVG));
        assertEquals(MediaType.APPLICATION_OCTET_STREAM, MediaTypeUtils.detectImageType("junk".getBytes()));
        assertEquals(MediaType.IMAGE_PNG, MediaTypeUtils.detectImageType(PNG));
    }

    @Test
    void extensionMapping() {
        assertEquals(".png", MediaTypeUtils.extensionFor(MediaType.IMAGE_PNG));
        assertEquals(".jpg", MediaTypeUtils.extensionFor(MediaType.IMAGE_JPEG));
        assertEquals(".gif", MediaTypeUtils.extensionFor(MediaType.parseMediaType("image/gif")));
        assertEquals(".webp", MediaTypeUtils.extensionFor(MediaType.parseMediaType("image/webp")));
    }
}
