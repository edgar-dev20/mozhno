package dev.mozhno.auth;

import dev.mozhno.exception.BadRequestException;

public final class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final String UPPERCASE = ".*[A-Z].*";
    private static final String DIGIT = ".*\\d.*";
    private static final String SPECIAL = ".*[!@#$%^&*()_+\\-=\\[\\]{}|;':\",./<>?].*";

    private PasswordValidator() {}

    public static void validate(String password, String email) {
        if (password == null || password.isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (password.length() < MIN_LENGTH) {
            throw new BadRequestException("Password must be at least " + MIN_LENGTH + " characters");
        }
        if (!password.matches(DIGIT)) {
            throw new BadRequestException("Password must contain at least one digit");
        }
        if (!password.matches(UPPERCASE)) {
            throw new BadRequestException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(SPECIAL)) {
            throw new BadRequestException("Password must contain at least one special character");
        }
        if (email != null && password.equalsIgnoreCase(email)) {
            throw new BadRequestException("Password must not match the email address");
        }
    }
}
