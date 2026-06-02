package ru.mozhno.auth;

public class JwtToken {
    private final Integer userId;
    private final String email;
    private final String role;

    public JwtToken(Integer userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public Integer getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}