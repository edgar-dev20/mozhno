package dev.mozhno.util;

public final class FileUtils {

    private FileUtils() {
    }

    public static String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}
