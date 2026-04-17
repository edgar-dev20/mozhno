package dev.mozhno.auth;

import dev.mozhno.exception.BadRequestException;

public final class PasswordValidator {

    private static final int MIN_LENGTH = 8;

    private PasswordValidator() {}

    public static void validate(String password, String email) {
        if (password == null || password.isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (password.length() < MIN_LENGTH) {
            throw new BadRequestException("Password must be at least " + MIN_LENGTH + " characters");
        }
        if (!password.matches(".*\\d.*")) {
            throw new BadRequestException("Password must contain at least one digit");
        }
        if (email != null && password.equalsIgnoreCase(email)) {
            throw new BadRequestException("Password must not match the email address");
        }
    }
}
