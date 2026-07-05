package dev.mozhno.util;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

public final class MediaTypeUtils {

    private MediaTypeUtils() {
    }

    /**
     * Detects the concrete raster image type from magic bytes.
     *
     * @param data the file bytes
     * @return the raster {@link MediaType} (PNG, JPEG, GIF or WEBP), or {@code null}
     *         if the bytes are not one of these formats (SVG and anything else → {@code null})
     */
    public static MediaType detectRasterImageType(byte[] data) {
        if (data == null || data.length < 4) return null;
        if (data[0] == (byte) 0x89 && data[1] == 'P' && data[2] == 'N' && data[3] == 'G') return MediaType.IMAGE_PNG;
        if (data[0] == (byte) 0xFF && data[1] == (byte) 0xD8) return MediaType.IMAGE_JPEG;
        if (data[0] == 'G' && data[1] == 'I' && data[2] == 'F') return MediaType.parseMediaType("image/gif");
        if (data.length >= 12
            && data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F'
            && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') {
            return MediaType.parseMediaType("image/webp");
        }
        return null;
    }

    /**
     * Returns whether the bytes are an allowed raster image (PNG/JPEG/GIF/WEBP).
     * SVG is intentionally rejected because it can carry executable scripts.
     */
    public static boolean isAllowedRasterImage(byte[] data) {
        return detectRasterImageType(data) != null;
    }

    /**
     * Maps a detected raster {@link MediaType} to a file extension.
     */
    public static String extensionFor(MediaType type) {
        if (MediaType.IMAGE_PNG.equals(type)) return ".png";
        if (MediaType.IMAGE_JPEG.equals(type)) return ".jpg";
        if (type != null && "image/gif".equals(type.toString())) return ".gif";
        if (type != null && "image/webp".equals(type.toString())) return ".webp";
        return ".bin";
    }

    /**
     * Detects the media type to serve stored image bytes with.
     *
     * <p>Never returns {@code image/svg+xml}: any non-raster or unknown bytes
     * (including legacy SVGs stored before validation was tightened) are served
     * as {@code application/octet-stream} so they cannot execute inline in a browser.
     *
     * @param data the stored bytes
     * @return a safe {@link MediaType} for the response
     */
    public static MediaType detectImageType(byte[] data) {
        MediaType raster = detectRasterImageType(data);
        return raster != null ? raster : MediaType.APPLICATION_OCTET_STREAM;
    }

    /**
     * Builds a hardened {@link ResponseEntity} for serving stored image bytes.
     *
     * <p>Applies a safe content type ({@link #detectImageType}, never SVG) plus
     * {@code X-Content-Type-Options: nosniff}, a locked-down
     * {@code Content-Security-Policy} and a private {@code Cache-Control}, so the
     * blob cannot execute scripts when opened directly as a top-level document.
     * Centralised here so both the avatar and logo endpoints stay in sync.
     */
    public static ResponseEntity<byte[]> imageResponse(byte[] data) {
        return ResponseEntity.ok()
            .contentType(detectImageType(data))
            .header("X-Content-Type-Options", "nosniff")
            .header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox")
            .header("Cache-Control", "private, max-age=300")
            .body(data);
    }
}
