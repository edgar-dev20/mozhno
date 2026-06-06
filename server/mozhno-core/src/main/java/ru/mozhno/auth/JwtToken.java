package ru.mozhno.auth;

public class JwtToken {
    private final Integer userId;
    private final String email;
    private final String name;
    private final String role;
    private final String status;

    public JwtToken(Integer userId, String email, String name, String role, String status) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.status = status;
    }

    public Integer getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
}