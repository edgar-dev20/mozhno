package dev.mozhno.util;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Iterator;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

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

    /**
     * Reads the dimensions (width, height) of an image from its bytes.
     * Parses headers directly for PNG, JPEG, GIF to avoid buffering;
     * falls back to {@link ImageReader} (metadata disabled) for WebP.
     *
     * @param data the image bytes
     * @return an array of {@code [width, height]}, or {@code null} if the
     *         format is not supported by any registered reader
     * @throws IOException if an I/O error occurs during header parsing
     */
    public static int[] readDimensions(byte[] data) throws IOException {
        if (data == null || data.length < 4) return null;

        if (data[0] == (byte) 0x89 && data.length >= 24) {
            return new int[]{
                readIntBE(data, 16),
                readIntBE(data, 20)
            };
        }

        if (data[0] == (byte) 0xFF && data[1] == (byte) 0xD8) {
            int len = data.length;
            for (int i = 2; i < len - 8; i++) {
                if ((data[i] & 0xFF) != 0xFF) continue;
                int marker = data[i + 1] & 0xFF;
                if (marker == 0x00 || marker == 0xFF) continue;
                if (marker == 0xC0 || marker == 0xC2) {
                    return new int[]{
                        readShortBE(data, i + 7),
                        readShortBE(data, i + 5)
                    };
                }
                if (marker == 0xD8 || marker == 0xD9 || (marker >= 0xD0 && marker <= 0xD7) || marker == 0x01) {
                    i++;
                    continue;
                }
                int segLen = readShortBE(data, i + 2);
                i += segLen + 1;
            }
            return null;
        }

        if (data[0] == 'G' && data[1] == 'I' && data[2] == 'F' && data.length >= 10) {
            return new int[]{
                readShortLE(data, 6),
                readShortLE(data, 8)
            };
        }

        if (data.length >= 12
            && data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F'
            && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') {
            try (ImageInputStream iis = ImageIO.createImageInputStream(new ByteArrayInputStream(data))) {
                if (iis == null) return null;
                Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
                if (!readers.hasNext()) return null;
                ImageReader reader = readers.next();
                try {
                    reader.setInput(iis, false, true);
                    return new int[]{reader.getWidth(0), reader.getHeight(0)};
                } finally {
                    reader.dispose();
                }
            }
        }

        return null;
    }

    private static int readIntBE(byte[] data, int offset) {
        return ((data[offset] & 0xFF) << 24)
            | ((data[offset + 1] & 0xFF) << 16)
            | ((data[offset + 2] & 0xFF) << 8)
            | (data[offset + 3] & 0xFF);
    }

    private static int readShortBE(byte[] data, int offset) {
        return ((data[offset] & 0xFF) << 8)
            | (data[offset + 1] & 0xFF);
    }

    private static int readShortLE(byte[] data, int offset) {
        return (data[offset] & 0xFF)
            | ((data[offset + 1] & 0xFF) << 8);
    }
}
