package ru.mozhno.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User management — admin only")
public class UsersController {
    private final UserService userService;

    public UsersController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get all users (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> getAll(@AuthenticationPrincipal UserPrincipal user) {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto getById(@PathVariable Integer id,
                           @AuthenticationPrincipal UserPrincipal user) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create / invite a new user (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto create(@Valid @RequestBody UserCreateRequest request,
                          @AuthenticationPrincipal UserPrincipal user) {
        return userService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto update(@PathVariable Integer id,
                          @Valid @RequestBody UserUpdateRequest request,
                          @AuthenticationPrincipal UserPrincipal user) {
        return userService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a user (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        userService.delete(id);
    }
}