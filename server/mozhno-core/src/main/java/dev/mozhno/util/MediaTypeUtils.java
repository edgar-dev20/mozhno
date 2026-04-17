package dev.mozhno.util;

import org.springframework.http.MediaType;

public final class MediaTypeUtils {

    private MediaTypeUtils() {
    }

    public static MediaType detectImageType(byte[] data) {
        if (data.length < 4) return MediaType.IMAGE_JPEG;
        if (data[0] == (byte) 0x89 && data[1] == 'P' && data[2] == 'N' && data[3] == 'G') return MediaType.IMAGE_PNG;
        if (data[0] == 'G' && data[1] == 'I' && data[2] == 'F') return MediaType.parseMediaType("image/gif");
        if (data[0] == (byte) 0xFF && data[1] == (byte) 0xD8) return MediaType.IMAGE_JPEG;
        if (data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F') return MediaType.parseMediaType("image/webp");
        if (data.length > 4 && data[0] == '<') return MediaType.parseMediaType("image/svg+xml");
        return MediaType.IMAGE_JPEG;
    }

    public static boolean isImageContentType(String contentType) {
        return contentType != null && contentType.startsWith("image/");
    }
}
